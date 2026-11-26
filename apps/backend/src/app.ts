import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import apiRouter from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import helmet from "helmet";

const app = express();

app.set("true proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiLimiter);

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
