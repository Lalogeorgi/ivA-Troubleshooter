import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RrfFusionService } from './rrf-fusion.service';
import { GraphTraversalService, GraphTraversalResult } from './graph-traversal.service';
import OpenAI from 'openai';

export interface SearchChunkItem {
  id: string;
  document_title: string;
  document_type: string;
  chunk_text: string;
  page_number: number | null;
  section_title: string | null;
  chunk_type: string;
  bounding_box: any;
  token_count: number | null;
  match_score?: number;
}

export interface HybridSearchOptions {
  query: string;
  instrumentId?: string;
  limit?: number;
  lexicalWeight?: number;
  vectorWeight?: number;
  includeGraphContext?: boolean;
}

export interface HybridSearchResponse {
  query: string;
  totalResults: number;
  results: Array<{
    document_title: string;
    document_type: string;
    chunk_text: string;
    page_number: number | null;
    section_title: string | null;
    chunk_type: string;
    bounding_box: any;
    rrf_score: number;
    lexical_rank?: number;
    vector_rank?: number;
    matched_by: 'EXACT_MATCH' | 'SEMANTIC_VECTOR' | 'HYBRID';
    similarity_score: number; // backward compatibility
  }>;
  graphContext?: {
    anchors: string[];
    traversals: GraphTraversalResult[];
  };
}

@Injectable()
export class HybridSearchService {
  private readonly logger = new Logger(HybridSearchService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly graphTraversal: GraphTraversalService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy_api_key_for_offline_validation',
    });
  }

  /**
   * Execute multi-stage Hybrid Retrieval (Lexical + Dense Vector + RRF + Graph Traversal)
   */
  async search(options: HybridSearchOptions): Promise<HybridSearchResponse> {
    const {
      query,
      instrumentId,
      limit = 5,
      lexicalWeight = 0.5,
      vectorWeight = 0.5,
      includeGraphContext = true,
    } = options;

    const candidateLimit = Math.max(limit * 3, 15);

    // 1. Lexical / Exact Match Candidates
    const lexicalCandidates = await this.executeLexicalSearch(query, instrumentId, candidateLimit);

    // 2. Dense Vector Semantic Candidates
    const vectorCandidates = await this.executeVectorSearch(query, instrumentId, candidateLimit);

    // 3. Reciprocal Rank Fusion
    const fusedResults = RrfFusionService.fuse<SearchChunkItem>(
      lexicalCandidates,
      vectorCandidates,
      {
        k: 60,
        lexicalWeight,
        vectorWeight,
        limit,
      }
    );

    // 4. Graph Traversal Context (Anchored by query keywords and top matches)
    let graphContext: HybridSearchResponse['graphContext'];
    if (includeGraphContext) {
      try {
        const anchors = await this.graphTraversal.findEntityAnchors(query);
        const traversals: GraphTraversalResult[] = [];

        for (const anchor of anchors.slice(0, 3)) {
          const trav = await this.graphTraversal.traverse(anchor, 2);
          traversals.push(trav);
        }

        graphContext = { anchors, traversals };
      } catch (err: any) {
        this.logger.warn(`Graph traversal enrichment skipped: ${err.message}`);
      }
    }

    // Format response
    const formattedResults = fusedResults.map((r) => ({
      document_title: r.item.document_title,
      document_type: r.item.document_type,
      chunk_text: r.item.chunk_text,
      page_number: r.item.page_number,
      section_title: r.item.section_title,
      chunk_type: r.item.chunk_type,
      bounding_box: r.item.bounding_box,
      rrf_score: r.rrfScore,
      lexical_rank: r.lexicalRank,
      vector_rank: r.vectorRank,
      matched_by: r.matchedBy,
      similarity_score: r.rrfScore, // compatibility for legacy frontend consumers
    }));

    return {
      query,
      totalResults: formattedResults.length,
      results: formattedResults,
      graphContext,
    };
  }

  private async executeLexicalSearch(
    query: string,
    instrumentId?: string,
    limit: number = 15
  ): Promise<SearchChunkItem[]> {
    try {
      const cleanQuery = query.trim();
      const likePattern = `%${cleanQuery}%`;

      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          dc.id, 
          dc.chunk_text, 
          dc.page_number, 
          dc.section_title, 
          dc.chunk_type, 
          dc.bounding_box, 
          dc.token_count, 
          d.title as "document_title", 
          d.document_type as "document_type",
          GREATEST(
            similarity(dc.chunk_text, ${cleanQuery}),
            CASE WHEN dc.chunk_text ILIKE ${likePattern} THEN 0.85 ELSE 0.0 END
          ) as "match_score"
        FROM "DocumentChunk" dc
        JOIN "Document" d ON d.id = dc.document_id
        WHERE (${instrumentId}::text IS NULL OR d.instrument_id = ${instrumentId})
          AND (dc.chunk_text ILIKE ${likePattern} OR similarity(dc.chunk_text, ${cleanQuery}) > 0.08)
        ORDER BY "match_score" DESC
        LIMIT ${limit};
      `;

      return rows.map((r) => ({
        id: r.id,
        document_title: r.document_title,
        document_type: r.document_type,
        chunk_text: r.chunk_text,
        page_number: r.page_number,
        section_title: r.section_title,
        chunk_type: r.chunk_type,
        bounding_box: r.bounding_box,
        token_count: r.token_count,
        match_score: Number(r.match_score),
      }));
    } catch (err: any) {
      this.logger.warn(`Lexical search fallback to ILIKE due to: ${err.message}`);
      // Fallback purely using Prisma findMany
      const chunks = await this.prisma.documentChunk.findMany({
        where: {
          chunkText: { contains: query, mode: 'insensitive' },
          document: instrumentId ? { instrumentId } : undefined,
        },
        include: { document: true },
        take: limit,
      });

      return chunks.map((c) => ({
        id: c.id,
        document_title: c.document.title,
        document_type: c.document.documentType,
        chunk_text: c.chunkText,
        page_number: c.pageNumber,
        section_title: c.sectionTitle,
        chunk_type: c.chunkType,
        bounding_box: c.boundingBox,
        token_count: c.tokenCount,
        match_score: 0.5,
      }));
    }
  }

  private async executeVectorSearch(
    query: string,
    instrumentId?: string,
    limit: number = 15
  ): Promise<SearchChunkItem[]> {
    let queryVector: number[];

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float',
      });
      queryVector = response.data[0].embedding;
    } catch (e: any) {
      queryVector = new Array(1536).fill(0.001);
    }

    try {
      const vectorString = `[${queryVector.join(',')}]`;

      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          dc.id, 
          dc.chunk_text, 
          dc.page_number, 
          dc.section_title, 
          dc.chunk_type, 
          dc.bounding_box, 
          dc.token_count, 
          d.title as "document_title", 
          d.document_type as "document_type",
          1 - (dc.embedding_vector <=> CAST(${vectorString} AS vector)) as "match_score"
        FROM "DocumentChunk" dc
        JOIN "Document" d ON d.id = dc.document_id
        WHERE (${instrumentId}::text IS NULL OR d.instrument_id = ${instrumentId})
        ORDER BY dc.embedding_vector <=> CAST(${vectorString} AS vector)
        LIMIT ${limit};
      `;

      return rows.map((r) => ({
        id: r.id,
        document_title: r.document_title,
        document_type: r.document_type,
        chunk_text: r.chunk_text,
        page_number: r.page_number,
        section_title: r.section_title,
        chunk_type: r.chunk_type,
        bounding_box: r.bounding_box,
        token_count: r.token_count,
        match_score: Number(r.match_score),
      }));
    } catch (err: any) {
      this.logger.error(`Vector search failed: ${err.message}`);
      return [];
    }
  }
}
