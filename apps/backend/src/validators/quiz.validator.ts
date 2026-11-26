import { z } from "zod";

export const QUIZ_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type QuizDifficulty = (typeof QUIZ_DIFFICULTIES)[number];

export const ALLOWED_QUESTION_COUNTS = [5, 10, 15] as const;

export const generateQuizSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(2, "Topic must be at least 2 characters")
    .max(80, "Topic must be at most 80 characters"),
  difficulty: z.enum(QUIZ_DIFFICULTIES),
  questionCount: z
    .number()
    .int()
    .refine(
      (val): val is 5 | 10 | 15 =>
        ALLOWED_QUESTION_COUNTS.includes(val as 5 | 10 | 15),
      { message: "Number of questions must be 5, 10, or 15" },
    ),
});

export const listQuizzesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  topic: z.string().trim().max(80).optional(),
  difficulty: z.enum(QUIZ_DIFFICULTIES).optional(),
  mine: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

export const quizIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID format"),
});

const aiQuestionSchema = z
  .object({
    question: z.string().trim().min(5).max(500),
    options: z.array(z.string().trim().min(1).max(250)).length(4),
    correctAnswer: z.string().trim().min(1).max(250),
    explanation: z.string().trim().min(5).max(1000),
  })
  .superRefine((q, ctx) => {
    const normalizedOptions = q.options.map((opt) => opt.toLowerCase());
    if (new Set(normalizedOptions).size !== 4) {
      ctx.addIssue({
        code: "custom",
        message: "Question options must all be distinct",
        path: ["options"],
      });
    }

    if (!q.options.includes(q.correctAnswer)) {
      ctx.addIssue({
        code: "custom",
        message: "correctAnswer must match one of the four options",
        path: ["correctAnswer"],
      });
    }
  });

export function createAiQuizOutputSchema(expectedCount: number) {
  return z.object({
    title: z.string().trim().min(3).max(120),
    topic: z.string().trim().min(2).max(80),
    difficulty: z.enum(QUIZ_DIFFICULTIES),
    questions: z.array(aiQuestionSchema).length(expectedCount),
  });
}

export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type ListQuizzesQuery = z.infer<typeof listQuizzesQuerySchema>;
export type ValidatedAiQuiz = z.infer<
  ReturnType<typeof createAiQuizOutputSchema>
>;
