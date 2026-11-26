export interface LLMCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export interface LLMProvider {
  readonly name: string;
  generateJson(request: LLMCompletionRequest): Promise<string>;
}
