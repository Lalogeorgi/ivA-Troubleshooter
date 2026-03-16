import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

export const TroubleshootState = Annotation.Root({
  // The input configuration from the frontend
  machine_context: Annotation<any>({
    reducer: (x, y) => y ?? x,
  }),
  problem_description: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  error_code: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
  }),
  
  // Interaction history and tool calls layer
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),

  // Extracted queries layer
  search_queries: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),

  // Final structured output layer
  final_plan: Annotation<any>({
    reducer: (x, y) => y ?? x,
  }),
});
