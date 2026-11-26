import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/** General rate limiter for all /api endpoints. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.nodeEnv === "test",
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests, please try again later.",
    },
  },
});

/** Stricter rate limiter we will attach to AI quiz generation in Step 3. */
export const aiGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.nodeEnv === "test",
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "AI quiz generation limit reached. Please wait a few minutes.",
    },
  },
});
