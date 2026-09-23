import { Injectable, Logger } from '@nestjs/common';
import { ILlmProvider, LlmGenerationOptions } from '../llm-provider.interface';
import OpenAI from 'openai';

@Injectable()
export class OpenAiProvider implements ILlmProvider {
  readonly name = 'openai';
  readonly model: string;
  private readonly client: OpenAI;
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy_api_key',
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }

  async generateText(prompt: string, options?: LlmGenerationOptions): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 1500,
    });

    return completion.choices[0].message.content || '';
  }

  async generateStructured<T>(prompt: string, options?: LlmGenerationOptions): Promise<T> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: `${options.systemPrompt}\nAlways respond with a valid JSON object.`,
      });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      response_format: { type: 'json_object' },
      temperature: options?.temperature ?? 0.1,
    });

    const content = completion.choices[0].message.content || '{}';
    return JSON.parse(content) as T;
  }
}
