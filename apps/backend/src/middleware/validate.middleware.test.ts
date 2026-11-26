import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError } from "../utils/appError.js";
import { validate } from "./validate.middleware.js";

describe("validate middleware", () => {
  const schema = z.object({
    username: z.string().trim().min(3),
  });

  it("parses valid body and calls next with no error", () => {
    const middleware = validate({ body: schema });
    const req = { body: { username: "  alex  " } } as Request;
    const res = { locals: {} } as Response;
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(req.body).toEqual({ username: "alex" });
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards AppError 400 VALIDATION_ERROR on invalid body", () => {
    const middleware = validate({ body: schema });
    const req = { body: { username: "ab" } } as Request;
    const res = { locals: {} } as Response;
    const next = vi.fn();

    middleware(req, res, next as unknown as NextFunction);

    const err = next.mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
  });
});
