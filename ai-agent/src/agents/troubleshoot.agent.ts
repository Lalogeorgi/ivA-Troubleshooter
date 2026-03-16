import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { searchProceduresTool } from "../tools/searchProcedures.tool";
import { searchDocumentationTool } from "../tools/searchDocumentation.tool";
import { getProcedureStepsTool } from "../tools/getProcedureSteps.tool";
import { getServiceBulletinsTool } from "../tools/getServiceBulletins.tool";
import { SYSTEM_PROMPT } from "../prompts/troubleshoot.prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
dotenv.config();

const tools = [
  searchProceduresTool,
  searchDocumentationTool,
  getProcedureStepsTool,
  getServiceBulletinsTool,
];

export async function runTroubleshootAgent(machine_context: any, problem_description: string, error_code?: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.log("[AI LOG] OPENAI_API_KEY is missing. Returning offline mock agent plan.");
    return {
      troubleshooting_steps: [
        {
          step_number: 1,
          instruction: "Verify the main pump connections and ensure the fluid lines are completely bled. (Offline Mock AI Response)",
          source: "Pump Replacement Guide"
        },
        {
          step_number: 2,
          instruction: "Perform a baseline pressure calibration to stabilize the sensors after replacement. (Offline Mock AI Response)",
          source: "Calibration Procedure V2"
        }
      ]
    };
  }

  // Use gpt-4o or gpt-3.5-turbo (OpenAI API Key must be in .env)
  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
  });

  const agent = createReactAgent({
    llm,
    tools,
    messageModifier: new SystemMessage(SYSTEM_PROMPT),
  });

  const inputMessage = new HumanMessage(`
Machine Context: ${JSON.stringify(machine_context)}
Problem Description: ${problem_description}
Error Code: ${error_code || 'None'}

Please analyze this and provide the troubleshooting plan JSON. Remember to search for existing procedures or docs first!
`);

  const result = await agent.invoke({ messages: [inputMessage] });
  
  const finalContent = result.messages[result.messages.length - 1].content as string;
  
  // Attempt to parse standard markdown JSON blocks
  const jsonMatch = finalContent.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.warn("Failed to parse matched JSON segment.");
    }
  }
  
  // Safe fail-case required by constraints
  if (finalContent.includes("No verified troubleshooting procedure found")) {
    return {
      troubleshooting_steps: [
        {
          step_number: 1,
          instruction: "No verified troubleshooting procedure found. Please consult documentation manually.",
          source: "System Constraints"
        }
      ]
    };
  }

  // Fallback flat parse
  try {
     return JSON.parse(finalContent);
  } catch (e) {
     console.error("Agent returned unparseable text format:", finalContent);
     return {
       troubleshooting_steps: [
         {
           step_number: 1,
           instruction: "Agent completed task but returned unformatted plain text. Review logs.",
           source: "Agent Fallback"
         }
       ]
     };
  }
}
