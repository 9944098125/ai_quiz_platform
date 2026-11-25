import mongoose from "mongoose";
import { env } from "./env.js";

/** Connects to MongoDB using MONGO_URI when configured. */
export async function connectDB(): Promise<void> {
  if (!env.mongoUri) {
    console.warn("MONGO_URI is not set. Skipping MongoDB connection.");
    return;
  }

  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

/** Maps Mongoose connection readyState to a readable status label. */
export function getDatabaseStatus(): string {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] ?? "unknown";
}
