import { AppError } from "../../utils/appError.js";
import {
  createAiQuizOutputSchema,
  type GenerateQuizInput,
  type ValidatedAiQuiz,
} from "../../validators/quiz.validator.js";
import type { LLMProvider } from "./llmProvider.interface.js";

const MAX_RAW_AI_RESPONSE_BYTES = 65_536; // 64 KB safety cap

function stripMarkdownCodeFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return trimmed;
}

function buildQuizPrompts(input: GenerateQuizInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = [
    "You are an expert educational assessment author.",
    "Return ONLY valid JSON with no markdown, commentary, or extra keys.",
    "Required JSON shape:",
    "{",
    '  "title": "string",',
    '  "topic": "string",',
    '  "difficulty": "easy" | "medium" | "hard",',
    '  "questions": [',
    "    {",
    '      "question": "string",',
    '      "options": ["opt1", "opt2", "opt3", "opt4"],',
    '      "correctAnswer": "exact string matching one option",',
    '      "explanation": "clear concise explanation"',
    "    }",
    "  ]",
    "}",
    "Rules: exactly 4 distinct options per question, exactly 1 correctAnswer matching an option verbatim, non-empty explanation.",
  ].join("\n");

  const userPrompt = [
    `Generate a multiple-choice quiz with exactly ${input.questionCount} questions.`,
    `Topic: ${input.topic}`,
    `Difficulty: ${input.difficulty}`,
  ].join("\n");

  return { systemPrompt, userPrompt };
}

/** Coordinates prompt construction, LLM invocation, JSON parsing, and strict validation. */
export class AIQuizGenerator {
  private readonly provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  public async generate(input: GenerateQuizInput): Promise<ValidatedAiQuiz> {
    const prompts = buildQuizPrompts(input);
    const rawResponse = await this.provider.generateJson(prompts);

    if (Buffer.byteLength(rawResponse, "utf8") > MAX_RAW_AI_RESPONSE_BYTES) {
      throw new AppError(
        502,
        "AI_PROVIDER_ERROR",
        "AI response exceeded the maximum allowed size",
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(stripMarkdownCodeFences(rawResponse));
    } catch {
      throw new AppError(
        502,
        "AI_PROVIDER_ERROR",
        "AI provider returned invalid JSON",
      );
    }

    const schema = createAiQuizOutputSchema(input.questionCount);
    const result = schema.safeParse(parsedJson);

    if (!result.success) {
      throw new AppError(
        502,
        "AI_PROVIDER_ERROR",
        "AI generated malformed quiz data. Please try again.",
      );
    }

    return result.data;
  }
}
