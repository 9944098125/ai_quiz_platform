import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", apiRouter);

export default app;
