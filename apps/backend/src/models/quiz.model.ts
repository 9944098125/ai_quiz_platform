import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import {
  QUIZ_DIFFICULTIES,
  type QuizDifficulty,
} from "../validators/quiz.validator.js";

export interface IQuestion {
  _id: Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IQuiz {
  userId: Types.ObjectId;
  title: string;
  topic: string;
  difficulty: QuizDifficulty;
  questionCount: number;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export type QuizDocument = HydratedDocument<IQuiz>;

export interface PublicQuestionDto {
  id: string;
  question: string;
  options: string[];
}

export interface PublicQuizDto {
  id: string;
  title: string;
  topic: string;
  difficulty: QuizDifficulty;
  questionCount: number;
  questions: PublicQuestionDto[];
  isOwner: boolean;
  createdAt: string;
}

export interface QuizSummaryDto {
  id: string;
  title: string;
  topic: string;
  difficulty: QuizDifficulty;
  questionCount: number;
  createdAt: string;
}

const questionSchema = new Schema<IQuestion>({
  question: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr: string[]) => arr.length === 4,
      message: "Each question must have exactly 4 options",
    },
  },
  correctAnswer: { type: String, required: true, trim: true },
  explanation: { type: String, required: true, trim: true },
});

const quizSchema = new Schema<IQuiz>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    topic: { type: String, required: true, trim: true, maxlength: 80 },
    difficulty: {
      type: String,
      enum: QUIZ_DIFFICULTIES,
      required: true,
    },
    questionCount: { type: Number, required: true },
    questions: { type: [questionSchema], required: true },
  },
  { timestamps: true },
);

quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ topic: 1, difficulty: 1 });

export const QuizModel = model<IQuiz>("Quiz", quizSchema);

/** Strips correctAnswer and explanation so answer keys never leak before completion. */
export function toPublicQuizDto(
  quiz: QuizDocument,
  viewerUserId?: string,
): PublicQuizDto {
  return {
    id: quiz._id.toString(),
    title: quiz.title,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    questionCount: quiz.questionCount,
    questions: quiz.questions.map((q) => ({
      id: q._id.toString(),
      question: q.question,
      options: q.options,
    })),
    isOwner: Boolean(viewerUserId && quiz.userId.toString() === viewerUserId),
    createdAt: quiz.createdAt.toISOString(),
  };
}

export function toQuizSummaryDto(quiz: QuizDocument): QuizSummaryDto {
  return {
    id: quiz._id.toString(),
    title: quiz.title,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    questionCount: quiz.questionCount,
    createdAt: quiz.createdAt.toISOString(),
  };
}
