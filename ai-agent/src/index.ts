import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { troubleshootRouter } from './agents/troubleshoot.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Main AI endpoint
app.use('/ai', troubleshootRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-agent' });
});

app.listen(PORT, () => {
  console.log(`AI Agent service running on port ${PORT}`);
});
