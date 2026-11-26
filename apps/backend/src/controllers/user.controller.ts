import type { Request, Response } from "express";
import {
  getUserById,
  onboardUser,
  updateUserProfile,
} from "../services/user.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";
import type {
  OnboardUserInput,
  UpdateProfileInput,
} from "../validators/user.validator.js";

export async function onboard(req: Request, res: Response): Promise<void> {
  const result = await onboardUser(req.body as OnboardUserInput);
  sendSuccess(res, result, 201);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const user = await getUserById(req.user.userId);
  sendSuccess(res, { user });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const user = await updateUserProfile(
    req.user.userId,
    req.body as UpdateProfileInput,
  );
  sendSuccess(res, { user });
}
