import { toUserDto, UserModel, type UserDto } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { signUserToken } from "../utils/jwt.js";
import type {
  OnboardUserInput,
  UpdateProfileInput,
} from "../validators/user.validator.js";

export interface OnboardResult {
  user: UserDto;
  token: string;
}

/** Creates a new user from the onboarding dialog and returns a session JWT. */
export async function onboardUser(
  input: OnboardUserInput,
): Promise<OnboardResult> {
  const usernameLower = input.username.toLowerCase();

  const existing = await UserModel.findOne({ usernameLower }).lean();
  if (existing) {
    throw new AppError(409, "CONFLICT", "Username is already taken");
  }

  const user = await UserModel.create({
    username: input.username,
    usernameLower,
    ...(input.preferredTopic ? { preferredTopic: input.preferredTopic } : {}),
  });

  const userDto = toUserDto(user);
  const token = signUserToken({
    userId: userDto.id,
    username: userDto.username,
  });

  return { user: userDto, token };
}

/** Fetches the current authenticated user's profile. */
export async function getUserById(userId: string): Promise<UserDto> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }
  return toUserDto(user);
}

/** Updates username and/or preferredTopic for the current user. */
export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<UserDto> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }

  if (input.username !== undefined) {
    const nextLower = input.username.toLowerCase();
    if (nextLower !== user.usernameLower) {
      const taken = await UserModel.findOne({
        usernameLower: nextLower,
      }).lean();
      if (taken) {
        throw new AppError(409, "CONFLICT", "Username is already taken");
      }
      user.username = input.username;
      user.usernameLower = nextLower;
    } else {
      user.username = input.username;
    }
  }

  if (input.preferredTopic !== undefined) {
    user.preferredTopic = input.preferredTopic ?? undefined;
  }

  await user.save();
  return toUserDto(user);
}
