import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

interface MongooseLikeError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
}

/** Handles unmatched routes under the API. */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new AppError(
      404,
      "NOT_FOUND",
      `Route ${req.method} ${req.originalUrl} not found`,
    ),
  );
}

/** Centralized Express error middleware returning uniform JSON error envelopes. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Malformed JSON request body",
      },
    });
    return;
  }

  const mongoErr = err as MongooseLikeError;

  if (mongoErr?.code === 11000) {
    const duplicateFields = mongoErr.keyValue
      ? Object.keys(mongoErr.keyValue)
      : [];
    res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message:
          duplicateFields.length > 0
            ? `${duplicateFields.join(", ")} already exists`
            : "Resource already exists",
      },
    });
    return;
  }

  if (mongoErr?.name === "ValidationError" && mongoErr.errors) {
    const details = Object.entries(mongoErr.errors).map(([field, detail]) => ({
      field,
      message: detail.message,
    }));
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Database validation failed",
        details,
      },
    });
    return;
  }

  if (mongoErr?.name === "CastError") {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: `Invalid identifier format${mongoErr.path ? ` for ${mongoErr.path}` : ""}`,
      },
    });
    return;
  }

  if (!env.isProduction) {
    console.error("Unhandled error:", err);
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected internal server error occurred",
    },
  });
}
