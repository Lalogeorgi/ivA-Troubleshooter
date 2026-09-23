# Phase 5: Agentic Retrieval & Tool Architecture (MCP-Compatible)

## 1. Objective
Refactor the agent architecture from an unstable out-of-process Express microservice with regex JSON parsing into a modular, observable, and schema-enforced Agentic Service Core. Support pluggable LLM providers (Local Ollama/vLLM and Enterprise Cloud) with strictly validated tool execution and Model Context Protocol (MCP) server endpoints.

## 2. Prerequisites
- Phase 1, 2, 3, and 4 completed.

## 3. Files & Modules Affected
- `ai-agent/` (Consolidate into unified backend module or monorepo package `packages/agent-core`)
- `backend/src/agent/` (New NestJS Agent Module)
- `backend/src/agent/agent.service.ts`
- `backend/src/agent/llm-provider.factory.ts`
- `backend/src/agent/providers/ollama.provider.ts`
- `backend/src/agent/providers/openai.provider.ts`
- `backend/src/agent/providers/anthropic.provider.ts`
- `backend/src/agent/tools/` (Typed Zod tools)
- `backend/src/agent/mcp/` (Model Context Protocol server endpoint)

## 4. Database Changes
- Add `AgentExecutionTrace` table to persist agent decisions, tool invocations, inputs, retrieved evidence, and token consumption for auditability and compliance.

## 5. API Changes
- `POST /api/v1/agent/diagnose` — Streaming or synchronous agent execution endpoint.
- `GET /api/v1/agent/traces/:caseId` — Retrieve complete observable execution audit trail for a case.
- `/mcp` — SSE / JSON-RPC endpoint implementing the Model Context Protocol for external agent tool interop.

## 6. UI Changes
- Replace generic chatbot view with an interactive **Diagnostic Reasoning Inspector**:
  - Displays retrieved evidence with confidence indicators.
  - Distinguishes *Documented Fact*, *Historical Observation*, and *AI Hypothesis*.
  - Displays tools called and live execution state.

## 7. Architecture Changes
- Deprecate standalone Express microservice on port 3002.
- Integrate agent execution directly into the NestJS application lifecycle, eliminating fragile out-of-process network hops and unvalidated JSON regex parsing.
- Provide clean provider interface (`ILlmProvider`) allowing seamless switching between local Qwen/Llama and enterprise cloud LLMs.

## 8. Dependencies
- `zod`: Schema validation.
- `@modelcontextprotocol/sdk`: Model Context Protocol server.

## 9. Implementation Tasks
1. **Model Provider Interface & Adapters**:
   - Implement `ILlmProvider` with `generateText`, `generateStructured`, and `embed`.
   - Implement `OllamaProvider` connecting to `http://localhost:11434` for local air-gapped inference.
   - Implement `OpenAiCompatibleProvider` for Azure OpenAI, vLLM, or public OpenAI.
2. **Schema-Enforced Tools**:
   - Implement tools with strict Zod input and output schemas:
     - `search_knowledge_hybrid`
     - `get_component_specs`
     - `get_troubleshooting_tree`
     - `get_service_bulletin`
     - `inspect_provenance_page`
     - `query_historical_failures`
3. **Deterministic Diagnostic Loop**:
   - Build a stateful diagnostic loop that executes tools, synthesizes findings, and formats recommendations according to medical device safety rules.
4. **Audit & Trace Logger**:
   - Record every prompt, tool call, retrieved chunk, and model output into `AgentExecutionTrace`.

## 10. Testing
- Provider unit tests: Test mock provider, Ollama provider, and OpenAI provider with structured Zod outputs.
- Tool validation tests: Verify tools reject invalid inputs with descriptive error messages.
- Hallucination & safety test: Verify the agent returns "Unverified procedure — consult documentation manually" when no matching evidence is found.

## 11. Acceptance Criteria
- [ ] Agent runs in-process or via unified package with zero regex JSON parsing.
- [ ] Seamlessly switches between local Ollama and cloud LLMs via environment configuration.
- [ ] All tool calls and retrieved evidence are logged in `AgentExecutionTrace`.
- [ ] Strict distinction maintained between documented facts and AI hypotheses.

## 12. Risks & Rollback Considerations
- **Risk**: Local LLMs generating malformed tool call arguments.
- **Mitigation**: Implement automatic repair retries with schema error feedback.

## 13. Documentation Updates
- Create `docs/agent-tool-protocol.md` defining all available tools, parameters, and return schemas.
