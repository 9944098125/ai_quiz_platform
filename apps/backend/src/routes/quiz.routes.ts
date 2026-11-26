import { Router } from "express";
import {
  deleteQuiz,
  generateQuiz,
  getQuizById,
  getQuizzes,
} from "../controllers/quiz.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { aiGenerationLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  generateQuizSchema,
  listQuizzesQuerySchema,
  quizIdParamSchema,
} from "../validators/quiz.validator.js";

const quizRouter = Router();

quizRouter.post(
  "/generate",
  requireAuth,
  aiGenerationLimiter,
  validate({ body: generateQuizSchema }),
  generateQuiz,
);

quizRouter.get(
  "/",
  optionalAuth,
  validate({ query: listQuizzesQuerySchema }),
  getQuizzes,
);

quizRouter.get(
  "/:id",
  requireAuth,
  validate({ params: quizIdParamSchema }),
  getQuizById,
);

quizRouter.delete(
  "/:id",
  requireAuth,
  validate({ params: quizIdParamSchema }),
  deleteQuiz,
);

export default quizRouter;
