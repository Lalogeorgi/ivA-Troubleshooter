# Phase 2: Enterprise Knowledge Vault & Markdown Knowledge Model

## 1. Objective
Design and implement an Obsidian-compatible Markdown Knowledge Vault containing structured, versionable, and interconnected knowledge objects (Instruments, Subsystems, Components, Error Codes, Symptoms, Procedures, Service Bulletins, Failure Modes) with YAML frontmatter, `[[wikilinks]]`, and automated synchronization into the database graph.

## 2. Prerequisites
- Phase 1 completed (ontology database schema in place).

## 3. Files & Modules Affected
- `knowledge/` (Root directory for the Markdown Vault)
- `backend/src/vault/` (New NestJS module for Vault parsing & synchronization)
- `backend/src/vault/vault-parser.service.ts`
- `backend/src/vault/vault-watcher.service.ts`
- `backend/src/vault/vault.controller.ts`
- `backend/package.json` (Add `gray-matter` for YAML frontmatter parsing)

## 4. Database Changes
- Add `KnowledgeEdge` table to capture parsed `[[wikilink]]` relationships between markdown entities:
  - `sourceEntityId`: String
  - `sourceType`: String (e.g., "ERROR_CODE", "PROCEDURE")
  - `targetEntityId`: String
  - `targetType`: String
  - `relationship`: String (e.g., "RESOLVES", "AFFECTS", "CAUSED_BY")
  - `weight`: Float

## 5. API Changes
- `POST /api/v1/vault/sync` — Trigger manual re-index of the Markdown vault
- `GET /api/v1/vault/entities/:id` — Retrieve rendered Markdown object with frontmatter and outbound links
- `GET /api/v1/vault/graph` — Retrieve interactive network graph of entities and wikilinks

## 6. UI Changes
- Markdown viewer supporting standard GitHub Flavored Markdown, alerts (`[!WARNING]`, `[!CAUTION]`), and clickable `[[wikilinks]]` that navigate directly to related knowledge objects.

## 7. Architecture Changes
- Technical service procedures and bulletins are authored and versioned directly as Markdown in `knowledge/`.
- Vault parser dynamically creates and updates relational database records from Markdown files.

## 8. Dependencies
- `gray-matter`: Frontmatter parser.
- `remark` / `rehype`: Markdown AST generation.

## 9. Implementation Tasks
1. **Initialize Vault Structure**:
   - Create directories under `knowledge/`:
     - `instruments/analyzer-x200/`
     - `subsystems/`
     - `components/`
     - `errors/`
     - `symptoms/`
     - `procedures/`
     - `failure-modes/`
     - `service-bulletins/`
     - `parts/`
     - `safety/`
2. **Draft Baseline Knowledge Objects for Analyzer X200**:
   - Create `E1045.md` (Fluidics Pressure Instability) with links to `[[Pump-P102]]`, `[[Pressure-Sensor-PS23]]`, `[[PROC-PUMP-CALIBRATION]]`, `[[SB-2026-014]]`.
   - Create `PROC-PUMP-CALIBRATION.md` with step sequence, safety warnings, and required tools.
   - Create `SB-2026-014.md` (Service Bulletin: Updated Pump Calibration Standards for FW 4.2+).
   - Create `FM-FLUIDICS-PRESSURE-DROP.md` (Failure Mode: Tubing Delamination).
3. **Build Vault Parser Service**:
   - Scan all `.md` files, parse frontmatter, extract `[[wikilink]]` tags using regex/AST.
   - Upsert records into PostgreSQL tables (`ErrorCode`, `Procedure`, `ServiceBulletin`, `KnowledgeEdge`).
4. **Build Vault Watcher**:
   - Optional file watcher for local development auto-sync.

## 10. Testing
- Unit test `vault-parser.service.ts` against sample markdown files. Verify frontmatter extraction, link resolution, and circular link handling.
- Verify graph edge creation in `KnowledgeEdge`.

## 11. Acceptance Criteria
- [ ] Vault directory structure created with 15+ rich synthetic knowledge objects.
- [ ] Frontmatter and wikilinks parsed cleanly into PostgreSQL entities and edges.
- [ ] UI can render markdown knowledge objects with working bidirectional links.

## 12. Risks & Rollback Considerations
- **Risk**: Broken wikilinks pointing to non-existent markdown documents.
- **Mitigation**: Parser validates target links and flags broken references as warnings in the sync report.

## 13. Documentation Updates
- Create `docs/knowledge-vault-spec.md` with frontmatter schemas and authoring rules.
