import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { HybridSearchService } from './hybrid-search.service';
import { GraphTraversalService } from './graph-traversal.service';

export class HybridSearchDto {
  query: string;
  instrumentId?: string;
  instrument_id?: string;
  limit?: number;
  lexicalWeight?: number;
  vectorWeight?: number;
  includeGraphContext?: boolean;
}

@Controller(['knowledge-search', 'search', 'api/v1/search'])
export class KnowledgeSearchController {
  constructor(
    private readonly hybridSearchService: HybridSearchService,
    private readonly graphTraversalService: GraphTraversalService,
  ) {}

  @Post()
  async legacySearch(
    @Body()
    body: {
      query: string;
      instrument_id?: string;
      instrumentId?: string;
      limit?: number;
    },
  ) {
    if (!body.query) {
      return { results: [] };
    }

    return this.hybridSearchService.search({
      query: body.query,
      instrumentId: body.instrumentId || body.instrument_id,
      limit: body.limit || 5,
    });
  }

  @Post('hybrid')
  async hybridSearch(@Body() options: HybridSearchDto) {
    if (!options.query) {
      return { query: '', totalResults: 0, results: [] };
    }

    return this.hybridSearchService.search({
      query: options.query,
      instrumentId: options.instrumentId || options.instrument_id,
      limit: options.limit,
      lexicalWeight: options.lexicalWeight,
      vectorWeight: options.vectorWeight,
      includeGraphContext: options.includeGraphContext,
    });
  }

  @Get('graph/traverse')
  async traverseGraph(
    @Query('rootId') rootId: string,
    @Query('depth') depth?: string,
  ) {
    const parsedDepth = depth ? parseInt(depth, 10) : 2;
    return this.graphTraversalService.traverse(rootId, parsedDepth);
  }
}
