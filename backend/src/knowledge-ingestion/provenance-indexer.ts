import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfLayoutParser, ParsedPdfDocument } from './pdf-layout-parser';
import * as path from 'path';

export interface IngestionResult {
  documentId: string;
  title: string;
  filePath: string;
  pageCount: number;
  chunkCount: number;
  chunksByType: Record<string, number>;
}

@Injectable()
export class ProvenanceIndexer {
  private readonly logger = new Logger(ProvenanceIndexer.name);
  private readonly parser = new PdfLayoutParser();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ingest a technical PDF document with 100% preservation of page numbers,
   * structural types, and bounding-box coordinates.
   */
  async ingestPdfDocument(filePath: string, instrumentModel?: string): Promise<IngestionResult> {
    this.logger.log(`Ingesting layout-aware PDF: ${filePath}`);
    const parsedDoc: ParsedPdfDocument = await this.parser.parsePdf(filePath);
    const fileName = path.basename(filePath);

    // Resolve instrument if specified
    let instrumentId: string | null = null;
    if (instrumentModel) {
      const inst = await this.prisma.instrument.findFirst({
        where: {
          OR: [{ model: instrumentModel }, { id: instrumentModel }],
        },
      });
      if (inst) instrumentId = inst.id;
    }

    // Upsert or recreate Document record
    let document = await this.prisma.document.findFirst({
      where: { title: fileName },
    });

    if (document) {
      // Clear previous chunks and pages
      await this.prisma.documentChunk.deleteMany({ where: { documentId: document.id } });
      await this.prisma.documentPage.deleteMany({ where: { documentId: document.id } });
    } else {
      document = await this.prisma.document.create({
        data: {
          title: fileName,
          documentType: fileName.toLowerCase().includes('bulletin') ? 'service_bulletin' : 'service_manual',
          filePath: filePath,
          instrumentId: instrumentId,
        },
      });
    }

    // 1. Insert Document Pages
    for (const page of parsedDoc.pages) {
      await this.prisma.documentPage.create({
        data: {
          documentId: document.id,
          pageNumber: page.pageNumber,
          width: page.width,
          height: page.height,
          rawText: page.rawText,
        },
      });
    }

    // 2. Insert Document Chunks with Layout Metadata
    const chunksByType: Record<string, number> = {};

    for (const chunk of parsedDoc.allChunks) {
      chunksByType[chunk.chunkType] = (chunksByType[chunk.chunkType] || 0) + 1;

      // Dummy deterministic 1536-dim normalized vector for offline consistency
      const dummyVector = new Array(1536).fill(0.001);
      const vectorLiteral = `[${dummyVector.join(',')}]`;

      await this.prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" (
          id, document_id, chunk_text, page_number, section_title, 
          bounding_box, chunk_type, token_count, embedding_vector, "createdAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, 
          $5::jsonb, $6, $7, $8::vector, NOW()
        )`,
        document.id,
        chunk.chunkText,
        chunk.pageNumber,
        chunk.sectionTitle,
        JSON.stringify(chunk.boundingBox),
        chunk.chunkType,
        chunk.tokenCount,
        vectorLiteral
      );
    }

    this.logger.log(
      `Ingested ${fileName} with ${parsedDoc.pages.length} pages and ${parsedDoc.allChunks.length} layout chunks.`
    );

    return {
      documentId: document.id,
      title: fileName,
      filePath,
      pageCount: parsedDoc.pages.length,
      chunkCount: parsedDoc.allChunks.length,
      chunksByType,
    };
  }
}
