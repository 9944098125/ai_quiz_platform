import type { NextFunction, Request, Response } from "express";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { signUserToken } from "../utils/jwt.js";
import { requireAuth } from "./auth.middleware.js";

describe("requireAuth middleware", () => {
  beforeAll(() => {
    if (!env.jwtSecret) {
      (env as { jwtSecret: string }).jwtSecret = "test-secret-for-unit-tests";
    }
  });

  it("rejects missing Authorization header with 401", () => {
    const req = { headers: {} } as Request;
    const next = vi.fn();

    requireAuth(req, {} as Response, next as unknown as NextFunction);

    const err = next.mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
  });

  it("attaches req.user for a valid Bearer JWT", () => {
    const token = signUserToken({ userId: "user123", username: "alex_dev" });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const next = vi.fn();

    requireAuth(req, {} as Response, next as unknown as NextFunction);

    expect(req.user).toEqual({ userId: "user123", username: "alex_dev" });
    expect(next).toHaveBeenCalledWith();
  });
});
