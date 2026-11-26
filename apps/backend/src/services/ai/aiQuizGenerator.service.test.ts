import { describe, expect, it } from "vitest";
import { AppError } from "../../utils/appError.js";
import { AIQuizGenerator } from "./aiQuizGenerator.service.js";
import type { LLMProvider } from "./llmProvider.interface.js";
import { MockLLMProvider } from "./mockLlm.provider.js";

describe("AIQuizGenerator", () => {
  it("generates and validates a quiz from MockLLMProvider", async () => {
    const generator = new AIQuizGenerator(new MockLLMProvider());
    const result = await generator.generate({
      topic: "JavaScript",
      difficulty: "medium",
      questionCount: 5,
    });

    expect(result.questions).toHaveLength(5);
    expect(result.difficulty).toBe("medium");
    for (const q of result.questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correctAnswer);
    }
  });

  it("strips markdown json fences cleanly", async () => {
    const fencedProvider: LLMProvider = {
      name: "fenced-test",
      async generateJson() {
        const inner = await new MockLLMProvider().generateJson({
          systemPrompt: "",
          userPrompt: "exactly 5 questions\nTopic: React\nDifficulty: easy",
        });
        return `\`\`\`json\n${inner}\n\`\`\``;
      },
    };

    const generator = new AIQuizGenerator(fencedProvider);
    const result = await generator.generate({
      topic: "React",
      difficulty: "easy",
      questionCount: 5,
    });

    expect(result.questions).toHaveLength(5);
  });

  it("rejects malformed AI JSON with 502 AI_PROVIDER_ERROR", async () => {
    const badJsonProvider: LLMProvider = {
      name: "bad-json",
      async generateJson() {
        return "not valid json {{{";
      },
    };

    const generator = new AIQuizGenerator(badJsonProvider);
    await expect(
      generator.generate({
        topic: "CSS",
        difficulty: "easy",
        questionCount: 5,
      }),
    ).rejects.toMatchObject<Partial<AppError>>({
      statusCode: 502,
      code: "AI_PROVIDER_ERROR",
    });
  });

  it("rejects duplicate options or wrong question count", async () => {
    const badSchemaProvider: LLMProvider = {
      name: "bad-schema",
      async generateJson() {
        return JSON.stringify({
          title: "Broken Quiz",
          topic: "SQL",
          difficulty: "hard",
          questions: [
            {
              question: "Duplicate options test?",
              options: ["SELECT", "select", "FROM", "WHERE"],
              correctAnswer: "SELECT",
              explanation: "Duplicate options must fail validation.",
            },
          ],
        });
      },
    };

    const generator = new AIQuizGenerator(badSchemaProvider);
    await expect(
      generator.generate({
        topic: "SQL",
        difficulty: "hard",
        questionCount: 5,
      }),
    ).rejects.toMatchObject<Partial<AppError>>({
      statusCode: 502,
      code: "AI_PROVIDER_ERROR",
    });
  });
});
