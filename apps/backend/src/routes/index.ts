import { Router } from "express";
import healthRouter from "./health.routes.js";
import userRouter from "./user.routes.js";
import quizRouter from "./quiz.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/quizzes", quizRouter);

export default apiRouter;
