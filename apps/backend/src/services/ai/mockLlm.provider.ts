import type {
  LLMCompletionRequest,
  LLMProvider,
} from "./llmProvider.interface.js";

/** Deterministic local provider useful for automated tests or offline dev (LLM_PROVIDER=mock). */
export class MockLLMProvider implements LLMProvider {
  public readonly name = "mock";

  public async generateJson(request: LLMCompletionRequest): Promise<string> {
    const countMatch = request.userPrompt.match(/exactly\s+(\d+)\s+questions/i);
    const topicMatch = request.userPrompt.match(/Topic:\s*(.+)/i);
    const diffMatch = request.userPrompt.match(
      /Difficulty:\s*(easy|medium|hard)/i,
    );

    const count = Number(countMatch?.[1] ?? 5);
    const topic = topicMatch?.[1]?.trim() ?? "General Knowledge";
    const difficulty = (diffMatch?.[1]?.toLowerCase() ?? "medium") as
      | "easy"
      | "medium"
      | "hard";

    const questions = Array.from({ length: count }, (_, idx) => {
      const n = idx + 1;
      return {
        question: `Sample ${topic} question #${n} (${difficulty})?`,
        options: [
          `Correct concept ${n}`,
          `Distractor A for ${n}`,
          `Distractor B for ${n}`,
          `Distractor C for ${n}`,
        ],
        correctAnswer: `Correct concept ${n}`,
        explanation: `Correct concept ${n} accurately answers question #${n} about ${topic}.`,
      };
    });

    return JSON.stringify({
      title: `${topic} (${difficulty}) Quiz`,
      topic,
      difficulty,
      questions,
    });
  }
}
