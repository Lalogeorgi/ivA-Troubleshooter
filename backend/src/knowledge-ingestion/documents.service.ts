import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProvenanceIndexer, IngestionResult } from './provenance-indexer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly indexer: ProvenanceIndexer,
  ) {}

  /**
   * List all registered documents with page and chunk counts
   */
  async listDocuments() {
    return this.prisma.document.findMany({
      include: {
        instrument: {
          select: { id: true, model: true, manufacturer: true },
        },
        _count: {
          select: {
            pages: true,
            chunks: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Retrieve document metadata with page summaries
   */
  async getDocument(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        instrument: true,
        pages: {
          orderBy: { pageNumber: 'asc' },
          select: {
            id: true,
            pageNumber: true,
            width: true,
            height: true,
          },
        },
        _count: {
          select: { chunks: true },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return doc;
  }

  /**
   * Retrieve single page text and all chunks with bounding boxes
   */
  async getDocumentPage(documentId: string, pageNumber: number) {
    const page = await this.prisma.documentPage.findUnique({
      where: {
        documentId_pageNumber: {
          documentId,
          pageNumber,
        },
      },
    });

    if (!page) {
      throw new NotFoundException(`Page ${pageNumber} for document ${documentId} not found`);
    }

    const chunks = await this.prisma.documentChunk.findMany({
      where: {
        documentId,
        pageNumber,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        chunkText: true,
        sectionTitle: true,
        chunkType: true,
        boundingBox: true,
        tokenCount: true,
      },
    });

    return {
      documentId,
      pageNumber: page.pageNumber,
      width: page.width,
      height: page.height,
      rawText: page.rawText,
      chunks,
    };
  }

  /**
   * Get file path for PDF streaming
   */
  async getPdfFilePath(documentId: string): Promise<{ filePath: string; fileName: string }> {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    if (!fs.existsSync(doc.filePath)) {
      throw new NotFoundException(`PDF binary file not found on disk at ${doc.filePath}`);
    }

    return {
      filePath: doc.filePath,
      fileName: doc.title,
    };
  }

  /**
   * Scan and ingest all PDF manuals from documents directory
   */
  async ingestAll(): Promise<IngestionResult[]> {
    const docsDir = path.resolve(process.cwd(), '../documents');
    const fallbackDir = path.resolve(process.cwd(), 'documents');
    const targetDir = fs.existsSync(docsDir) ? docsDir : fallbackDir;

    this.logger.log(`Scanning documents in: ${targetDir}`);
    const results: IngestionResult[] = [];

    const scanAndIngest = async (currentDir: string, instrumentModel?: string) => {
      if (!fs.existsSync(currentDir)) return;
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          const model = entry.name.replace(/_/g, ' ');
          await scanAndIngest(fullPath, model);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
          const result = await this.indexer.ingestPdfDocument(fullPath, instrumentModel);
          results.push(result);
        }
      }
    };

    await scanAndIngest(targetDir);
    return results;
  }
}
