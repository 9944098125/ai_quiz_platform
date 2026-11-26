import { Schema, model, type HydratedDocument } from "mongoose";

export interface IUser {
  username: string;
  usernameLower: string;
  preferredTopic?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export interface UserDto {
  id: string;
  username: string;
  preferredTopic: string | null;
  createdAt: string;
  updatedAt: string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    usernameLower: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    preferredTopic: {
      type: String,
      trim: true,
      maxlength: 60,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<IUser>("User", userSchema);

/** Maps a Mongoose User document to a safe API DTO. */
export function toUserDto(user: UserDocument): UserDto {
  return {
    id: user._id.toString(),
    username: user.username,
    preferredTopic: user.preferredTopic ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
