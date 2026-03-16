import { Controller, Post, Body } from '@nestjs/common';
import { KnowledgeSearchService } from './knowledge-search.service';

@Controller('knowledge-search')
export class KnowledgeSearchController {
  constructor(
    private readonly knowledgeSearchService: KnowledgeSearchService,
  ) {}

  @Post()
  async search(
    @Body() searchRequest: { query: string; instrument_id?: string },
  ) {
    if (!searchRequest.query) {
      return { results: [] };
    }
    return await this.knowledgeSearchService.search(
      searchRequest.query,
      searchRequest.instrument_id,
    );
  }
}
