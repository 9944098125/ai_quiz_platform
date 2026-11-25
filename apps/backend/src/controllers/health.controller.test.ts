import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { getHealth } from "./health.controller.js";

describe("getHealth", () => {
  it("returns 200 with UP status payload", () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    getHealth({} as Request, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "UP",
        message: "Quiz Platform API is running",
        database: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
  });
});
