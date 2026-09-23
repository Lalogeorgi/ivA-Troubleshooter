# Phase 0: Forensic Audit & Baseline Stabilization

## 1. Objective
Stabilize the existing codebase, resolve technical debt, fix compilation errors, synchronize database migrations for PostgreSQL 16 with pgvector, and establish clean workspace hygiene before new feature development.

## 2. Prerequisites
- Docker & Docker Compose installed.
- Node.js 20+ and npm 10+.

## 3. Files & Modules Affected
- `docker/docker-compose.yml` (Update PostgreSQL image to pgvector-enabled image `pgvector/pgvector:pg16`)
- `backend/prisma/schema.prisma` (Standardize PostgreSQL datasource and models)
- `backend/prisma/migrations/` (Regenerate clean PostgreSQL migration)
- `backend/prisma/dev.db` (Delete obsolete SQLite database file)
- `backend/test.ts` (Archive or remove scratch test script)
- `tracked_files.txt` (Delete 2.4MB dump file)
- `ai-agent/tsconfig.json` (Fix TS5095 compiler error: module resolution configuration)
- `backend/tsconfig.json` (Enable strict type checking)
- `frontend/app/lib/api.ts` (Fix TypeScript types and API signatures)
- `frontend/app/intervention-session/[id]/documentation/page.tsx` (Fix `localStorage` key mismatch)
- `frontend/app/intervention-session/[id]/procedures/[procedureId]/page.tsx` (Fix `step.referenceDocument` object-to-string crash)

## 4. Database Changes
- Switch database container from `postgres:16` to `pgvector/pgvector:pg16` on port 5432.
- Execute fresh `prisma migrate dev --name init_postgres_baseline`.
- Remove `migration_lock.toml` SQLite reference.

## 5. API Changes
- None (baseline stabilization only).

## 6. UI Changes
- Fix runtime crashes on documentation search and procedure detail view caused by `localStorage` key mismatches and invalid object rendering.

## 7. Architecture Changes
- Deprecate SQLite legacy artifacts.
- Restore monorepo clean compilation across all subdirectories.

## 8. Dependencies
- Update `docker-compose.yml` image to `pgvector/pgvector:pg16`.

## 9. Implementation Tasks
1. **Workspace Cleanup**:
   - Remove `tracked_files.txt` and `backend/prisma/dev.db`.
   - Update `.gitignore` to prevent database and log file tracking.
2. **Docker & Database Stabilization**:
   - Update `docker/docker-compose.yml` to use `pgvector/pgvector:pg16`.
   - Create and apply initial PostgreSQL migration via Prisma.
   - Verify `pgvector` extension initializes cleanly.
3. **Compiler & Type Safety Fixes**:
   - Fix `ai-agent/tsconfig.json` module configuration to resolve TS5095.
   - Correct `localStorage` key in `documentation/page.tsx` (`current_intervention_context`).
   - Fix `step.referenceDocument` rendering in `procedures/[procedureId]/page.tsx`.
4. **Backend Stubs Cleanup**:
   - Ensure all controller stubs return valid JSON empty arrays rather than plain text strings to prevent client and agent JSON parsing crashes.

## 10. Testing
- Run `npm run build` in `backend`, `ai-agent`, and `frontend` to verify 100% clean compilation.
- Verify PostgreSQL container startup and extension loading.

## 11. Acceptance Criteria
- [ ] All three sub-projects compile cleanly with zero TypeScript errors.
- [ ] PostgreSQL 16 container starts up with pgvector extension enabled.
- [ ] Prisma schema is synchronized with PostgreSQL with clean migrations.
- [ ] No obsolete files (`dev.db`, `tracked_files.txt`) in repository.

## 12. Risks & Rollback Considerations
- **Risk**: Database port conflicts with existing local PostgreSQL instances.
- **Rollback**: Revert `docker-compose.yml` port mapping if port 5432 is occupied.

## 13. Documentation Updates
- Update `backend/README.md` and root `README.md` with accurate setup and build instructions.
