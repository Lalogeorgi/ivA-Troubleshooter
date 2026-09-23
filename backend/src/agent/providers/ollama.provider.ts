import { Injectable, Logger } from '@nestjs/common';
import { ILlmProvider, LlmGenerationOptions } from '../llm-provider.interface';

@Injectable()
export class OllamaProvider implements ILlmProvider {
  readonly name = 'ollama';
  readonly model: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(OllamaProvider.name);

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
  }

  async generateText(prompt: string, options?: LlmGenerationOptions): Promise<string> {
    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: options?.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.2,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      return data.response;
    } catch (err: any) {
      this.logger.warn(`Ollama inference unavailable (${err.message}). Verify Ollama is running on ${this.baseUrl}`);
      throw err;
    }
  }

  async generateStructured<T>(prompt: string, options?: LlmGenerationOptions): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid, unescaped JSON matching the requested structure. Do NOT include markdown code blocks, backticks, or preamble.`;
    const raw = await this.generateText(jsonPrompt, options);

    try {
      const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(clean) as T;
    } catch (parseErr: any) {
      this.logger.error(`Failed to parse structured JSON from Ollama output: ${parseErr.message}`);
      throw new Error(`Ollama returned invalid JSON: ${raw.substring(0, 100)}...`);
    }
  }
}
