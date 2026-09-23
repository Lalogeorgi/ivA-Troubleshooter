# Phase 11: Security, Provenance & AI Safety Hardening

## 1. Objective
Harden the entire platform for enterprise healthcare and medical device regulatory standards: implement Role-Based Access Control (RBAC), end-to-end cryptographic audit trails, document provenance enforcement, prompt-injection defense, and strict AI hallucination controls.

## 2. Prerequisites
- Phases 1 through 10 completed.

## 3. Files & Modules Affected
- `backend/src/auth/` (Authentication & RBAC guards)
- `backend/src/security/` (Input sanitization & prompt defense)
- `backend/src/audit/` (Tamper-evident audit logging)
- `frontend/lib/auth/` (Session tokens & permissions)

## 4. Database Changes
- Add `User` and `Role` tables:
  - Roles: `FIELD_SERVICE_ENGINEER`, `REMOTE_SPECIALIST`, `SERVICE_MANAGER`, `ADMIN`.
- Add `AuditLogEntry` table:
  - `id`: UUID
  - `userId`: String
  - `action`: String
  - `resource`: String
  - `details`: Json
  - `sha256Hash`: String (hash of payload + previous log hash for blockchain-like tamper evidence)
  - `timestamp`: DateTime

## 5. API Changes
- Apply `@UseGuards(JwtAuthGuard, RolesGuard)` to all state-modifying and case endpoints.
- Add security headers (Helmet, strict CSP, CORS lockdown).

## 6. UI Changes
- Role-based UI view adaptation (read-only views for clinical customers, full interactive workspace for authorized FSEs).
- Display provenance badge and verification status on every diagnostic step.

## 7. Architecture Changes
- Endpoints require JWT Bearer authentication.
- Strict input validation via `class-validator` and `Zod`.
- LLM prompt defenses:
  - Wrap external document context in XML-style structural tags `<evidence_doc id="..." source="...">`.
  - System prompt instructions explicitly forbidding execution of instructions contained within retrieved text chunks (indirect prompt injection defense).

## 8. Dependencies
- `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`.

## 9. Implementation Tasks
1. **RBAC Infrastructure**:
   - Implement JWT authentication with role hierarchy.
2. **Tamper-Evident Audit Trail**:
   - Intercept all case status changes, measurement recordings, and approvals; compute SHA-256 chain hash.
3. **AI Safety & Hallucination Guardrails**:
   - If confidence is low or conflicting evidence exists, the agent must output an explicit uncertainty statement.
   - Forbid the agent from inventing part numbers, torque specifications, or safety procedures.
4. **Data Isolation Filters**:
   - Enforce customer-level and tenant-level data isolation on all database queries.

## 10. Testing
- Security audit test: Attempt SQL injection and indirect prompt injection attacks against search and agent endpoints.
- Access control test: Verify that unauthorized users cannot approve part replacements or modify equipment configurations.

## 11. Acceptance Criteria
- [ ] 100% of endpoints protected with authentication and RBAC.
- [ ] Immutable audit log records every diagnostic and repair event.
- [ ] Prompt injection attacks neutralized by structural delimitation.

## 12. Risks & Rollback Considerations
- **Risk**: Overly restrictive CSP breaking Three.js canvas or PDF worker scripts.
- **Mitigation**: Configure CSP headers to explicitly allow local WebGL and blob URLs for PDF.js.

## 13. Documentation Updates
- Update `docs/architecture/00-forensic-audit-and-architecture-assessment.md` with security compliance matrices.
