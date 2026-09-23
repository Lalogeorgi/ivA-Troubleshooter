import { Controller, Get, Post, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import * as fs from 'fs';

@Controller(['documents', 'api/v1/documents'])
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  listDocuments() {
    return this.documentsService.listDocuments();
  }

  @Post('ingest')
  ingestAll() {
    return this.documentsService.ingestAll();
  }

  @Get(':id')
  getDocument(@Param('id') id: string) {
    return this.documentsService.getDocument(id);
  }

  @Get(':id/pages/:pageNumber')
  getDocumentPage(
    @Param('id') id: string,
    @Param('pageNumber', ParseIntPipe) pageNumber: number,
  ) {
    return this.documentsService.getDocumentPage(id, pageNumber);
  }

  @Get(':id/pdf')
  async streamPdf(@Param('id') id: string, @Res() res: Response) {
    const { filePath, fileName } = await this.documentsService.getPdfFilePath(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
    });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
}
