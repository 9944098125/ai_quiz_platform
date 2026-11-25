import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI ?? "",
  secretToken: process.env.SECRET_TOKEN ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
} as const;
