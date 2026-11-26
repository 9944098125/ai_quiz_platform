import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "../utils/appError.js";
import { errorHandler, notFoundHandler } from "./error.middleware.js";

function createMockResponse() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status } as unknown as Response;
  return { res, status, json };
}

describe("notFoundHandler", () => {
  it("forwards a 404 AppError to next", () => {
    const next = vi.fn() as unknown as NextFunction;
    const req = {
      method: "GET",
      originalUrl: "/api/unknown",
    } as Request;

    notFoundHandler(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const forwardedError = (next as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0];
    expect(forwardedError).toBeInstanceOf(AppError);
    expect(forwardedError.statusCode).toBe(404);
    expect(forwardedError.code).toBe("NOT_FOUND");
  });
});

describe("errorHandler", () => {
  it("serializes operational AppError payloads", () => {
    const { res, status, json } = createMockResponse();
    const err = new AppError(400, "VALIDATION_ERROR", "Invalid topic", [
      { field: "topic", message: "Required" },
    ]);

    errorHandler(err, {} as Request, res, vi.fn());

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid topic",
        details: [{ field: "topic", message: "Required" }],
      },
    });
  });

  it("maps Mongo duplicate key errors to 409 CONFLICT", () => {
    const { res, status, json } = createMockResponse();
    const err = Object.assign(new Error("E11000 duplicate key"), {
      code: 11000,
      keyValue: { username: "alex" },
    });

    errorHandler(err, {} as Request, res, vi.fn());

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "CONFLICT",
        message: "username already exists",
      },
    });
  });

  it("maps Mongoose CastError to 400 BAD_REQUEST", () => {
    const { res, status, json } = createMockResponse();
    const err = Object.assign(new Error("Cast to ObjectId failed"), {
      name: "CastError",
      path: "id",
    });

    errorHandler(err, {} as Request, res, vi.fn());

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid identifier format for id",
      },
    });
  });

  it("returns safe 500 error for unexpected exceptions", () => {
    const { res, status, json } = createMockResponse();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("Sensitive DB string"), {} as Request, res, vi.fn());

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected internal server error occurred",
      },
    });

    consoleSpy.mockRestore();
  });
});
