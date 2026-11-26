import type { FilterQuery } from "mongoose";
import {
  type IQuiz,
  type PublicQuizDto,
  QuizModel,
  type QuizSummaryDto,
  toPublicQuizDto,
  toQuizSummaryDto,
} from "../models/quiz.model.js";
import type { PaginationMeta } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";
import type {
  GenerateQuizInput,
  ListQuizzesQuery,
} from "../validators/quiz.validator.js";
import { AIQuizGenerator } from "./ai/aiQuizGenerator.service.js";
import { createLLMProvider } from "./ai/providerFactory.js";

const defaultGenerator = new AIQuizGenerator(createLLMProvider());

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Generates a quiz via AI, validates it, saves it, and returns a safe public DTO. */
export async function generateAndSaveQuiz(
  userId: string,
  input: GenerateQuizInput,
  generator: AIQuizGenerator = defaultGenerator,
): Promise<PublicQuizDto> {
  const generated = await generator.generate(input);

  const quiz = await QuizModel.create({
    userId,
    title: generated.title,
    topic: input.topic,
    difficulty: input.difficulty,
    questionCount: generated.questions.length,
    questions: generated.questions,
  });

  return toPublicQuizDto(quiz, userId);
}

/** Lists paginated quiz summaries (supports topic/difficulty filters and ?mine=true). */
export async function listQuizzes(
  query: ListQuizzesQuery,
  viewerUserId?: string,
): Promise<{ quizzes: QuizSummaryDto[]; meta: PaginationMeta }> {
  const filter: FilterQuery<IQuiz> = {};

  if (query.mine) {
    if (!viewerUserId) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required to filter your quizzes",
      );
    }
    filter.userId = viewerUserId;
  }

  if (query.difficulty) {
    filter.difficulty = query.difficulty;
  }

  if (query.topic) {
    filter.topic = { $regex: escapeRegex(query.topic), $options: "i" };
  }

  const skip = (query.page - 1) * query.limit;

  const [quizzes, total] = await Promise.all([
    QuizModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit),
    QuizModel.countDocuments(filter),
  ]);

  return {
    quizzes: quizzes.map(toQuizSummaryDto),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

/** Returns a single quiz without answer keys. */
export async function getPublicQuizById(
  quizId: string,
  viewerUserId?: string,
): Promise<PublicQuizDto> {
  const quiz = await QuizModel.findById(quizId);
  if (!quiz) {
    throw new AppError(404, "NOT_FOUND", "Quiz not found");
  }
  return toPublicQuizDto(quiz, viewerUserId);
}

/** Deletes a quiz only if the requesting user owns it. */
export async function deleteQuizById(
  quizId: string,
  userId: string,
): Promise<void> {
  const quiz = await QuizModel.findById(quizId);
  if (!quiz) {
    throw new AppError(404, "NOT_FOUND", "Quiz not found");
  }

  if (quiz.userId.toString() !== userId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only delete your own quizzes",
    );
  }

  await quiz.deleteOne();
}
