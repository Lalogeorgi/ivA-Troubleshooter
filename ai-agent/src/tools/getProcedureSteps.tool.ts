import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export const getProcedureStepsTool = tool(
  async ({ procedure_id }) => {
    try {
      // The backend GET /procedures/:id returns the procedure info.
      // We also need the steps. Assuming GET /procedure-steps?procedureId=... or similar, 
      // but let's query the specific procedure endpoint, which should include steps if modified,
      // or we can query steps directly.
      const url = new URL(`${API_URL}/procedure-steps`);
      // Nest.js standard generated CRUD might not filter exactly like this out of the box unless we modified it.
      // We will try fetching all steps and filtering or fetching specific if the backend is standard.
      // Wait, in Phase 1/2 we built GET /procedure-steps.
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch procedure steps: ${response.statusText}`);
      }

      const allSteps = await response.json();
      const procedureSteps = allSteps.filter((step: any) => step.procedureId === procedure_id);
      
      // Sort by stepNumber
      procedureSteps.sort((a: any, b: any) => a.stepNumber - b.stepNumber);
      
      return JSON.stringify(procedureSteps);
    } catch (e: any) {
      return `Error retrieving procedure steps: ${e.message}`;
    }
  },
  {
    name: 'get_procedure_steps',
    description: 'Retrieves the complete, ordered list of step-by-step instructions for a specific procedure. Use this AFTER finding a relevant procedure ID.',
    schema: z.object({
      procedure_id: z.string().describe('The unique ID of the procedure to retrieve steps for.'),
    }),
  }
);
