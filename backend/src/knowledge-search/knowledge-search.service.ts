import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

interface SearchResultRow {
  document_title: string;
  document_type: string;
  chunk_text: string;
  similarity_score: number;
}

@Injectable()
export class KnowledgeSearchService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey:
        process.env.OPENAI_API_KEY || 'dummy_api_key_for_offline_validation',
    });
  }

  async search(query: string, instrumentId?: string) {
    let queryVector: number[];

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float',
      });
      queryVector = response.data[0].embedding;
    } catch (e) {
      console.warn(
        'Failed to generate embedding for search query, using dummy vector.',
        e.message,
      );
      queryVector = new Array(1536).fill(0.1); // dummy vector for fallback
    }

    try {
      // Execute a pgvector cosine similarity search (<=>)
      // We join DocumentChunk with Document to return the title and apply instrument filtering
      // pgvector requires the array formatted as '[1,2,3]' string explicitly.
      const vectorString = `[${queryVector.join(',')}]`;

      const results = instrumentId
        ? await this.prisma.$queryRaw<any[]>`
            SELECT 
              d.title as "document_title", 
              d.document_type as "document_type",
              dc.chunk_text as "chunk_text", 
              1 - (dc.embedding_vector <=> CAST(${vectorString} AS vector)) as "similarity_score"
            FROM "DocumentChunk" dc
            JOIN "Document" d ON d.id = dc.document_id
            WHERE d.instrument_id = ${instrumentId} OR d.instrument_id IS NULL
            ORDER BY dc.embedding_vector <=> CAST(${vectorString} AS vector)
            LIMIT 5;
          `
        : await this.prisma.$queryRaw<any[]>`
            SELECT 
              d.title as "document_title", 
              d.document_type as "document_type",
              dc.chunk_text as "chunk_text", 
              1 - (dc.embedding_vector <=> CAST(${vectorString} AS vector)) as "similarity_score"
            FROM "DocumentChunk" dc
            JOIN "Document" d ON d.id = dc.document_id
            ORDER BY dc.embedding_vector <=> CAST(${vectorString} AS vector)
            LIMIT 5;
          `;

      return {
        results: results.map((r) => ({
          document_title: r.document_title,
          document_type: r.document_type,
          chunk_text: r.chunk_text,
          similarity_score: Number(r.similarity_score),
        })),
      };
    } catch (e) {
      console.error('Vector search failed', e);
      throw new InternalServerErrorException('Semantic search failed');
    }
  }
}
