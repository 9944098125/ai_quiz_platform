import { z } from "zod";

const usernameRule = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(24, "Username must be at most 24 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens",
  );

const preferredTopicRule = z
  .string()
  .trim()
  .min(1, "Preferred topic cannot be empty")
  .max(60, "Preferred topic must be at most 60 characters");

export const onboardUserSchema = z.object({
  username: usernameRule,
  preferredTopic: preferredTopicRule.optional(),
});

export const updateProfileSchema = z
  .object({
    username: usernameRule.optional(),
    preferredTopic: preferredTopicRule.nullable().optional(),
  })
  .refine(
    (data) => data.username !== undefined || data.preferredTopic !== undefined,
    { message: "Provide at least one field to update" },
  );

export type OnboardUserInput = z.infer<typeof onboardUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
