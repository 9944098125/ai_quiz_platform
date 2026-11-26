import { env } from "../../config/env.js";
import { AppError } from "../../utils/appError.js";
import type {
  LLMCompletionRequest,
  LLMProvider,
} from "./llmProvider.interface.js";

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

/** OpenRouter implementation using the OpenAI-compatible Chat Completions API. */
export class OpenRouterProvider implements LLMProvider {
  public readonly name = "openrouter";

  public async generateJson(request: LLMCompletionRequest): Promise<string> {
    if (!env.llm.apiKey) {
      throw new AppError(
        500,
        "INTERNAL_ERROR",
        "LLM_API_KEY is not configured on the server",
      );
    }

    const endpoint = `${env.llm.baseUrl.replace(/\/+$/, "")}/chat/completions`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.llm.apiKey}`,
          "HTTP-Referer": env.corsOrigin,
          "X-Title": "QuizGen AI",
        },
        body: JSON.stringify({
          model: env.llm.model,
          temperature: request.temperature ?? 0.4,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
        }),
        signal: AbortSignal.timeout(env.llm.timeoutMs),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError")
      ) {
        throw new AppError(
          504,
          "AI_PROVIDER_ERROR",
          "AI quiz generation timed out. Please try again.",
        );
      }
      throw new AppError(
        502,
        "AI_PROVIDER_ERROR",
        "Unable to reach the AI provider. Please try again later.",
      );
    }

    if (response.status === 429) {
      throw new AppError(
        429,
        "RATE_LIMITED",
        "AI provider rate limit reached. Please wait a moment and try again.",
      );
    }

    if (!response.ok) {
      throw new AppError(
        502,
        "AI_PROVIDER_ERROR",
        `AI provider returned an error (status ${response.status})`,
      );
    }

    const payload = (await response.json()) as OpenRouterChatResponse;
    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new AppError(
        502,
        "AI_PROVIDER_ERROR",
        "AI provider returned an empty response",
      );
    }

    return content;
  }
}
