import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";
import { verifyUserToken } from "../utils/jwt.js";

/** Protects routes by requiring a valid Bearer JWT in Authorization header. */
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication token is required"));
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication token is required"));
    return;
  }

  req.user = verifyUserToken(token);
  next();
}

/** Attaches req.user if a valid Bearer token is present; does not block guests. */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    next();
    return;
  }

  req.user = verifyUserToken(token);
  next();
}
