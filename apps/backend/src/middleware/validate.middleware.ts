import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/appError.js";

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/** Validates request body, params, and query against Zod schemas. */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const issues: Array<{ location: string; field: string; message: string }> =
      [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({
            location: "body",
            field: issue.path.join(".") || "body",
            message: issue.message,
          });
        }
      } else {
        req.body = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({
            location: "params",
            field: issue.path.join(".") || "params",
            message: issue.message,
          });
        }
      } else {
        Object.assign(req.params, result.data);
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({
            location: "query",
            field: issue.path.join(".") || "query",
            message: issue.message,
          });
        }
      } else {
        // Express 5 defines req.query as a read-only getter, so store parsed query on res.locals
        res.locals.validatedQuery = result.data;
      }
    }

    if (issues.length > 0) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Request validation failed",
          issues,
        ),
      );
      return;
    }

    next();
  };
}
