import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export const searchProceduresTool = tool(
  async ({ instrument_id, firmware_version, error_code, symptom }) => {
    try {
      const url = new URL(`${API_URL}/troubleshooting`);
      if (instrument_id) url.searchParams.append('instrument_id', instrument_id);
      if (firmware_version) url.searchParams.append('firmware_version', firmware_version);
      if (error_code) url.searchParams.append('error_code', error_code);
      if (symptom) url.searchParams.append('symptom', symptom);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch procedures: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.stringify(data.slice(0, 5)); // Return top 5 matching procedures max
    } catch (e: any) {
      return `Error retrieving procedures: ${e.message}`;
    }
  },
  {
    name: 'search_procedures',
    description: 'Searches for structured troubleshooting procedures based on instrument, firmware, error code, or symptom.',
    schema: z.object({
      instrument_id: z.string().optional().describe('The ID of the instrument to filter procedures by. This should ideally be a UUID. If not available, search broadly.'),
      firmware_version: z.string().optional().describe('The firmware version of the instrument (e.g., "5.5.5")'),
      error_code: z.string().optional().describe('The exact error code observed (e.g., "E1045")'),
      symptom: z.string().optional().describe('A plain text description of the symptom or component issue'),
    }),
  }
);
