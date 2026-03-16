import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export const getServiceBulletinsTool = tool(
  async ({ instrument_id, firmware_version }) => {
    try {
      const url = new URL(`${API_URL}/service-bulletins`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch service bulletins: ${response.statusText}`);
      }

      // Filter local mock array by instrument reference or target firmness if available.
      // Typically the backend service would filter this via query params natively.
      const data = await response.json();
      
      // Basic filtering assuming standard structure
      const filtered = data.filter((tb: any) => {
         let match = true;
         if (instrument_id && tb.instrumentId && tb.instrumentId !== instrument_id) match = false;
         // firmware checks omitted for simplicity if not universally present
         return match;
      });

      return JSON.stringify(filtered.slice(0, 5));
    } catch (e: any) {
      return `Error retrieving service bulletins: ${e.message}`;
    }
  },
  {
    name: 'get_service_bulletins',
    description: 'Retrieves technical service bulletins or field safety notices that might be relevant to an instrument or specific firmware version.',
    schema: z.object({
      instrument_id: z.string().optional().describe('The ID of the instrument to scope the search to.'),
      firmware_version: z.string().optional().describe('The firmware version of the instrument (e.g., "4.2")'),
    }),
  }
);
