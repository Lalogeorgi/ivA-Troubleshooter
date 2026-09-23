# Phase 4: Hybrid Search & Knowledge Graph Traversal

## 1. Objective
Replace the naive vector-only `$queryRawUnsafe` implementation with a secure, multi-stage Hybrid Retrieval Engine combining lexical/exact search (PostgreSQL `pg_trgm` / full-text), dense vector embeddings (`pgvector`), Reciprocal Rank Fusion (RRF), and Knowledge Graph traversal.

## 2. Prerequisites
- Phase 1, 2, and 3 completed.

## 3. Files & Modules Affected
- `backend/src/knowledge-search/` (Complete rewrite of search architecture)
- `backend/src/knowledge-search/hybrid-search.service.ts`
- `backend/src/knowledge-search/graph-traversal.service.ts`
- `backend/src/knowledge-search/rrf-fusion.service.ts`
- `backend/src/knowledge-search/knowledge-search.controller.ts`
- `backend/prisma/schema.prisma` (Add full-text indexes and Trigram extension)

## 4. Database Changes
- Enable PostgreSQL extension `pg_trgm`: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`.
- Add GIN index on `DocumentChunk.chunk_text` for fast trigram and full-text matching.
- Add HNSW index on `DocumentChunk.embedding_vector` using `vector_cosine_ops`.
- Parameterize all raw queries to completely eliminate SQL injection vulnerabilities.

## 5. API Changes
- `POST /api/v1/search/hybrid` — Execute hybrid search with parameters:
  - `query`: String
  - `instrumentId`: UUID?
  - `firmwareVersion`: String?
  - `subsystemId`: UUID?
  - `limit`: Int (default 5)
  - `weights`: `{ lexical: 0.4, vector: 0.6 }`
- `GET /api/v1/search/graph/traverse` — Traverse relations from a root entity (e.g. from ErrorCode E1045 to Subsystem, Components, Procedures, and Bulletins).

## 6. UI Changes
- Search results display matched keywords, similarity score, exact page number, section breadcrumb, and whether the result was surfaced via exact match, vector match, or graph edge.

## 7. Architecture Changes
- Eliminates single-point-of-failure reliance on vector embeddings for exact medical device codes (e.g., "E1045" vs "E1046").
- Implements Reciprocal Rank Fusion (RRF) to merge disparate result sets with normalized scoring.

## 8. Dependencies
- `@prisma/client`: Parameterized raw queries.
- `pgvector`: HNSW cosine distance (`<=>`).

## 9. Implementation Tasks
1. **PostgreSQL Search Optimizations**:
   - Add GIN and HNSW indexes in Prisma migration.
   - Write parameterized SQL queries using `$queryRaw` with typed arguments (preventing SQL injection).
2. **Implement Lexical Search**:
   - Query using `ts_rank` and trigram similarity (`similarity(chunk_text, $query)`).
3. **Implement Vector Search**:
   - Cosine distance query with instrument and metadata pre-filtering.
4. **Implement Reciprocal Rank Fusion (RRF)**:
   - Rank fusion formula: `RRF_Score(d) = sum(1 / (k + rank_i(d)))` with `k=60`.
5. **Implement Graph Traversal Service**:
   - Recursive CTE traversal exploring `KnowledgeEdge` table up to 3 hops (e.g., ErrorCode -> FailureMode -> Component -> Procedure -> Tool).

## 10. Testing
- Search accuracy test:
  - Query "E1045" must return ErrorCode E1045 document chunk in rank 1.
  - Query "pressure drop in pump lines" must return relevant procedure chunk even if error code is unmentioned.
- Benchmark latency: Verify hybrid retrieval executes in < 35ms on PostgreSQL.

## 11. Acceptance Criteria
- [ ] Parameterized SQL queries with zero SQL injection vulnerability.
- [ ] Hybrid search successfully combines exact error code matching and semantic concepts.
- [ ] Graph traversal returns related entities and components within 3 hops.

## 12. Risks & Rollback Considerations
- **Risk**: High memory usage from HNSW index builds on very large datasets.
- **Mitigation**: Adjust `m` and `ef_construction` parameters based on available RAM.

## 13. Documentation Updates
- Update `docs/architecture/00-forensic-audit-and-architecture-assessment.md` with hybrid search benchmarks.
