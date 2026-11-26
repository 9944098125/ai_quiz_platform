import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthenticatedUser } from "../types/express.d.js";
import { AppError } from "./appError.js";

function getJwtSecret(): string {
  if (!env.jwtSecret) {
    throw new AppError(
      500,
      "INTERNAL_ERROR",
      "JWT_SECRET is not configured on the server",
    );
  }
  return env.jwtSecret;
}

/** Signs a session JWT for an onboarded user. */
export function signUserToken(payload: AuthenticatedUser): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getJwtSecret(), options);
}

/** Verifies a Bearer JWT and extracts the authenticated user identity. */
export function verifyUserToken(token: string): AuthenticatedUser {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload | string;

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.username !== "string"
    ) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid authentication token");
    }

    return {
      userId: decoded.userId,
      username: decoded.username,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired session token");
  }
}
