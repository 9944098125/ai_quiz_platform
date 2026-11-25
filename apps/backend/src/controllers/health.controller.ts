import type { Request, Response } from "express";
import { getDatabaseStatus } from "../config/db.js";

/** Handles GET /api/health checks. */
export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: "UP",
    message: "Quiz Platform API is running",
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
}
