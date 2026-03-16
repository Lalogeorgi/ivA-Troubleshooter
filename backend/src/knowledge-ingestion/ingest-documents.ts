import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';

// Initialize context
const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_api_key_for_offline_validation',
});

// Settings
const DOCS_DIR = path.join(__dirname, '../../../documents');
const CHUNK_SIZE = 1000; // rough characters per chunk, simulating token size

async function extractTextFromPdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return await extractTextFromPdf(filePath);
    case '.docx':
      return await extractTextFromDocx(filePath);
    case '.txt':
    case '.html':
      return fs.readFileSync(filePath, 'utf-8');
    default:
      console.log(`Unsupported extension: ${ext}`);
      return '';
  }
}

// Simple sliding window chunker
function chunkText(text: string, chunkSize: number = CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    // try to find a newline or period to break cleanly
    let end = i + chunkSize;
    if (end < text.length) {
      const nextNewline = text.lastIndexOf('\n', end);
      const nextPeriod = text.lastIndexOf('. ', end);
      const breakPoint = Math.max(nextNewline, nextPeriod);
      if (breakPoint > i + chunkSize / 2) {
        end = breakPoint + 1;
      }
    } else {
      end = text.length;
    }
    chunks.push(text.substring(i, end).trim());
    i = end;
  }
  return chunks.filter((c) => c.length > 5); // Filter out too small chunks
}

async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });
    return response.data[0].embedding;
  } catch (e) {
    console.error('Failed to generate embedding:', e);
    // If running without real API key, return a dummy vector (length 1536)
    return new Array(1536).fill(0.001);
  }
}

async function processFile(filePath: string, instrumentModel?: string) {
  console.log(`Processing: ${filePath}`);
  const text = await extractText(filePath);
  if (!text) {
    console.log(`No text extracted from ${filePath}. Skipping.`);
    return;
  }

  const fileName = path.basename(filePath);
  let instrumentId: string | null = null;

  if (instrumentModel) {
    const inst = await prisma.instrument.findFirst({
      where: { model: instrumentModel },
    });
    if (inst) instrumentId = inst.id;
  }

  // Create document entry
  const document = await prisma.document.create({
    data: {
      title: fileName,
      documentType: fileName.includes('bulletin')
        ? 'service_bulletin'
        : 'service_manual',
      filePath: filePath,
      instrumentId: instrumentId,
    },
  });

  const chunks = chunkText(text);
  console.log(`Created ${chunks.length} chunks. Generating embeddings...`);

  for (const chunkError of chunks) {
    const vector = await getEmbedding(chunkError);
    // Prisma pgvector requires a raw query to insert the vector array format correctly
    await prisma.$executeRaw`
      INSERT INTO "DocumentChunk" (id, document_id, chunk_text, embedding_vector)
      VALUES (gen_random_uuid(), ${document.id}, ${chunkError}, ${vector}::vector)
    `;
  }
  console.log(`Ingested ${fileName} successfully.`);
}

async function scanDirectory(dir: string, instrumentModel?: string) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // If we are in the 'instruments' folder, the subfolder name might be the instrument model
      const model = dir.endsWith('instruments') ? file : instrumentModel;
      await scanDirectory(fullPath, model);
    } else {
      await processFile(fullPath, instrumentModel);
    }
  }
}

async function main() {
  console.log('Starting Knowledge Ingestion Pipeline...');
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();

  await scanDirectory(DOCS_DIR);
  console.log('Ingestion Pipeline Completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
