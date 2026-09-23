import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export const searchDocumentationTool = tool(
  async ({ query, instrument_id }) => {
    try {
      const response = await fetch(`${API_URL}/knowledge-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, instrument_id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to search documentation: ${response.statusText}`);
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      return JSON.stringify(results.slice(0, 3)); // Return top 3 semantic matches
    } catch (e: any) {
      return `Error retrieving documentation: ${e.message}`;
    }
  },
  {
    name: 'search_documentation',
    description: 'Performs a semantic search over all ingested knowledge base documents, service manuals, and bulletins using a natural language query.',
    schema: z.object({
      query: z.string().describe('The natural language query describing the issue or component to look up.'),
      instrument_id: z.string().optional().describe('The ID of the instrument to scope the search to.'),
    }),
  }
);
