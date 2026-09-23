# ADR-002: Model-Agnostic LLM Provider Abstraction & Private Inference

## Status
Accepted

## Context
Hospital networks, clinical laboratories, and medical device manufacturers operate under strict data privacy regulations (HIPAA, GDPR, ISO 13485) and intellectual property protections. Many OEMs and hospital systems strictly prohibit transmitting internal service manuals, equipment telemetry, site locations, or service notes to third-party public cloud AI providers (such as OpenAI or Anthropic).

The original prototype hardcoded dependencies on OpenAI (`gpt-4o` and `text-embedding-3-small`), returning a static mock string whenever an OpenAI key was unavailable.

## Decision
We establish a **Pluggable Model Provider Abstraction** within the backend core:
1. Define a unified provider interface:
   ```typescript
   export interface ILlmProvider {
     id: string;
     generateText(prompt: string, options?: LlmOptions): Promise<string>;
     generateStructured<T>(prompt: string, schema: z.ZodType<T>, options?: LlmOptions): Promise<T>;
     generateStream(prompt: string, options?: LlmOptions): AsyncIterable<string>;
     embed(text: string | string[]): Promise<number[][]>;
   }
   ```
2. Implement four native provider adapters:
   - **Local / Edge Provider (`OllamaProvider` / `LlamaCppProvider`)**: Connects to locally hosted instances of open-weight models (e.g., Qwen 2.5 7B/14B, Llama 3.3 8B) running on the FSE laptop or local server.
   - **Private Enterprise Cluster (`VllmProvider`)**: Connects to on-premise high-throughput vLLM/TGI clusters.
   - **Enterprise Cloud Provider (`OpenAiCompatibleProvider`)**: Connects to private VPC endpoints (e.g. Azure OpenAI, AWS Bedrock, GCP Vertex AI).
   - **Standard Cloud API (`AnthropicProvider` / `OpenAiProvider`)**: Optional for development or unrestricted environments.
3. Decouple embeddings from the LLM provider, supporting lightweight local embedding models (e.g., `BAAI/bge-small-en-v1.5` running locally via ONNX/transformers.js or Ollama) for zero-network environments.

## Consequences
### Positive
- Fully air-gapped and private on-premise deployments are supported out-of-the-box.
- Eliminates hardcoded reliance on a single vendor.
- Organizations can switch models based on cost, latency, or compliance requirements without rewriting application code.

### Negative
- Local models may exhibit varying fidelity in tool calling; requires strict Zod schema validation and defensive error recovery in the agent orchestrator.
