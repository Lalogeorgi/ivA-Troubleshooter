export interface LlmGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ILlmProvider {
  readonly name: string;
  readonly model: string;

  /**
   * Generate unconstrained natural language response
   */
  generateText(prompt: string, options?: LlmGenerationOptions): Promise<string>;

  /**
   * Generate schema-enforced structured JSON response
   */
  generateStructured<T>(prompt: string, options?: LlmGenerationOptions): Promise<T>;
}
