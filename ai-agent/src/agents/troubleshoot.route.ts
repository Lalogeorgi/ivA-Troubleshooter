import { Router } from 'express';
import { runTroubleshootAgent } from './troubleshoot.agent';

export const troubleshootRouter = Router();

troubleshootRouter.post('/troubleshoot', async (req, res) => {
  try {
    const { machine_context, problem_description, error_code } = req.body;
    
    if (!machine_context || !problem_description) {
      return res.status(400).json({ error: 'machine_context and problem_description are required' });
    }

    console.log(`\n[AI LOG] Request received for: ${machine_context.instrument} | Problem: ${problem_description} | Code: ${error_code}`);

    const result = await runTroubleshootAgent(machine_context, problem_description, error_code);
    
    console.log(`[AI LOG] Plan generated successfully.`);
    // The result is our parsed structured JSON (or safe fallback)
    res.json(result);

  } catch (error) {
    console.error('[AI LOG] Error running AI agent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
