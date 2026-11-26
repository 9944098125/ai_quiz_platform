import type { Request, Response } from "express";
import {
  deleteQuizById,
  generateAndSaveQuiz,
  getPublicQuizById,
  listQuizzes,
} from "../services/quiz.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";
import type {
  GenerateQuizInput,
  ListQuizzesQuery,
} from "../validators/quiz.validator.js";

export async function generateQuiz(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const quiz = await generateAndSaveQuiz(
    req.user.userId,
    req.body as GenerateQuizInput,
  );
  sendSuccess(res, { quiz }, 201);
}

export async function getQuizzes(req: Request, res: Response): Promise<void> {
  const query = res.locals.validatedQuery as ListQuizzesQuery;
  const { quizzes, meta } = await listQuizzes(query, req.user?.userId);
  sendSuccess(res, { quizzes }, 200, meta);
}

export async function getQuizById(req: Request, res: Response): Promise<void> {
  const quizId = req.params.id as string;
  const quiz = await getPublicQuizById(quizId, req.user?.userId);
  sendSuccess(res, { quiz });
}

export async function deleteQuiz(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const quizId = req.params.id as string;
  await deleteQuizById(quizId, req.user.userId);
  sendSuccess(res, { message: "Quiz deleted successfully" });
}
