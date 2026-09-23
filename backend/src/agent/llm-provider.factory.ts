import { Injectable, Logger } from '@nestjs/common';
import { ILlmProvider } from './llm-provider.interface';
import { MockProvider } from './providers/mock.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class LlmProviderFactory {
  private readonly logger = new Logger(LlmProviderFactory.name);

  constructor(
    private readonly mockProvider: MockProvider,
    private readonly ollamaProvider: OllamaProvider,
    private readonly openAiProvider: OpenAiProvider,
  ) {}

  getProvider(): ILlmProvider {
    const configured = (process.env.LLM_PROVIDER || 'mock').toLowerCase().trim();

    if (configured === 'ollama') {
      this.logger.log('Active LLM Provider: Local Ollama');
      return this.ollamaProvider;
    }

    if (configured === 'openai' && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      this.logger.log('Active LLM Provider: OpenAI / Cloud');
      return this.openAiProvider;
    }

    this.logger.log('Active LLM Provider: Grounded Clinical Mock Engine (Deterministic)');
    return this.mockProvider;
  }
}
