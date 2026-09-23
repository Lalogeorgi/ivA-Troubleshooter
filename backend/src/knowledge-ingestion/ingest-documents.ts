import { PrismaClient } from '@prisma/client';
import { ProvenanceIndexer } from './provenance-indexer';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const indexer = new ProvenanceIndexer(prisma as any);

const DOCS_DIR = path.resolve(__dirname, '../../../documents');

async function scanAndIngest(dir: string, instrumentModel?: string) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const model = entry.name.replace(/_/g, ' ');
      await scanAndIngest(fullPath, model);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      console.log(`[Provenance Pipeline] Ingesting layout-aware manual: ${entry.name}`);
      const res = await indexer.ingestPdfDocument(fullPath, instrumentModel);
      console.log(`  -> Document ID: ${res.documentId}`);
      console.log(`  -> Pages indexed: ${res.pageCount}`);
      console.log(`  -> Layout chunks: ${res.chunkCount}`);
      console.log(`  -> Chunks by type:`, res.chunksByType);
    }
  }
}

async function main() {
  console.log('=== Phase 3: Layout-Aware Document Intelligence Ingestion ===');
  await scanAndIngest(DOCS_DIR);
  console.log('=== Ingestion Pipeline Completed Successfully ===');
}

main()
  .catch((err) => {
    console.error('Fatal ingestion error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
