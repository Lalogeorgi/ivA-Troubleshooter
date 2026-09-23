# Phase 3: Document Intelligence & PDF Provenance Pipeline

## 1. Objective
Replace the naive `pdf-parse` monolithic text dump with a layout-aware document intelligence ingestion pipeline that preserves page numbers, sections, tables, warnings, figures, and bounding box coordinates, guaranteeing exact clinical provenance back to the authoritative source PDF.

## 2. Prerequisites
- Phase 1 and Phase 2 completed.

## 3. Files & Modules Affected
- `backend/src/knowledge-ingestion/` (Refactored layout-aware ingestion engine)
- `backend/src/knowledge-ingestion/pdf-layout-parser.ts`
- `backend/src/knowledge-ingestion/table-extractor.ts`
- `backend/src/knowledge-ingestion/provenance-indexer.ts`
- `backend/prisma/schema.prisma` (Update `DocumentChunk` and `DocumentPage`)
- `documents/instruments/Analyzer_X200/` (Generate synthetic realistic PDF service manuals)
- `frontend/components/DocumentViewer.tsx` (True page-exact PDF rendering with bounding-box overlays)

## 4. Database Changes
- Add `DocumentPage` table:
  - `id`: UUID
  - `documentId`: String (FK to Document)
  - `pageNumber`: Int
  - `width`: Float
  - `height`: Float
  - `rawText`: String
  - `thumbnailUrl`: String?
- Update `DocumentChunk` table:
  - Add `pageNumber`: Int
  - Add `sectionTitle`: String?
  - Add `boundingBox`: Json? (format: `[x0, y0, x1, y1]`)
  - Add `chunkType`: String (TEXT, TABLE, WARNING, FIGURE_CAPTION, PROCEDURE_STEP)
  - Add `tokenCount`: Int

## 5. API Changes
- `POST /api/v1/documents/upload` — Upload PDF manual or technical bulletin
- `GET /api/v1/documents/:id/pages/:pageNumber` — Retrieve page text, dimensions, and bounding-box chunks
- `GET /api/v1/documents/:id/pdf` — Stream original binary PDF for in-browser PDF.js rendering

## 6. UI Changes
- Overhaul `DocumentViewer.tsx`:
  - Integrate `pdfjs-dist` / `react-pdf` to display the actual high-resolution PDF page.
  - Render an amber highlight rectangle over the retrieved bounding box coordinates.
  - Support multi-page navigation, zoom, and text selection.

## 7. Architecture Changes
- Deprecate sliding-window character chunking.
- Ingestion operates on structural boundaries (paragraphs, tables, callout blocks, step lists) preserving document layout and hierarchy.

## 8. Dependencies
- Backend: `pdfjs-dist` or layout-aware Python parser worker (`PyMuPDF / pdfplumber`).
- Frontend: `pdfjs-dist` or `@react-pdf-viewer/core`.

## 9. Implementation Tasks
1. **Prisma Schema Update**:
   - Update `DocumentChunk` schema with page number, bounding box coordinates, and structural chunk type.
   - Run Prisma migration.
2. **Layout-Aware PDF Extractor**:
   - Implement page-by-page text block extraction with coordinates `[x0, y0, x1, y1]`.
   - Implement table recognition (detect grid structure and convert to structured markdown tables within chunks).
   - Implement callout/warning detector (detect "WARNING", "CAUTION", "BIOHAZARD").
3. **Synthetic Manual Generation**:
   - Create a realistic multi-page PDF manual for *Analyzer X200 Service & Troubleshooting Manual* (covering hydraulic specs, sensor tolerances, wiring schematics, and error code E1045 procedures).
4. **PDF Viewer Client Component**:
   - Update `DocumentViewer.tsx` to render the genuine PDF page canvas and draw the bounding-box highlight overlay dynamically.

## 10. Testing
- Test extraction against the synthetic manual: Verify that page numbers, section headers, tables, and bounding boxes are correctly indexed.
- Bounding-box visual test: Verify that highlighted areas align precisely with the relevant text on the PDF canvas.

## 11. Acceptance Criteria
- [ ] Multi-page PDF ingested with 100% preservation of page numbers.
- [ ] Chunks stored with structural metadata (`pageNumber`, `sectionTitle`, `boundingBox`).
- [ ] UI renders source PDF page side-by-side with bounding-box highlight on search match.

## 12. Risks & Rollback Considerations
- **Risk**: Scanned PDF pages without digital text layers require OCR.
- **Mitigation**: Detect empty digital text pages and trigger OCR via Tesseract.js or Python worker.

## 13. Documentation Updates
- Update `docs/architecture/00-forensic-audit-and-architecture-assessment.md` with PDF parser benchmarks.
