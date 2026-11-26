import { env } from "../../config/env.js";
import type { LLMProvider } from "./llmProvider.interface.js";
import { MockLLMProvider } from "./mockLlm.provider.js";
import { OpenRouterProvider } from "./openRouter.provider.js";

/** Selects the configured LLMProvider from environment variables. */
export function createLLMProvider(): LLMProvider {
  if (env.llm.provider === "mock") {
    return new MockLLMProvider();
  }
  return new OpenRouterProvider();
}
