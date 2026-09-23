# Phase 7: FSE Case Workspace & Human-in-the-Loop Governance

## 1. Objective
Build the dedicated, end-to-end Field Service Engineer (FSE) Case Workspace. Provide an integrated operating environment where the FSE can manage the intervention lifecycle (site arrival, symptoms, measurements, diagnostic steps, spare parts consumed, repair summary, and sign-off), with mandatory Human-in-the-Loop approval gates for consequential actions.

## 2. Prerequisites
- Phase 1, 5, and 6 completed.

## 3. Files & Modules Affected
- `backend/src/cases/` (New NestJS Service Case Module)
- `backend/src/cases/cases.service.ts`
- `backend/src/cases/cases.controller.ts`
- `frontend/app/workspace/` (New primary FSE Case Workspace layout)
- `frontend/app/workspace/[caseId]/page.tsx`
- `frontend/components/CaseTimeline.tsx`
- `frontend/components/ApprovalGateModal.tsx`
- `frontend/components/MeasurementInput.tsx`

## 4. Database Changes
- Add `ServiceCase` table with rich operational fields:
  - `caseNumber`: String (unique, e.g. "CASE-2026-0941")
  - `assetId`: UUID (FK to InstalledAsset)
  - `engineerId`: String
  - `status`: Enum (ARRIVED, DIAGNOSING, AWAITING_PARTS, REPAIRING, VERIFYING, COMPLETED, ESCALATED)
  - `symptomDescription`: String
  - `initialErrorCode`: String?
  - `partsReplaced`: Json?
  - `finalDiagnosis`: String?
  - `resolutionNotes`: String?
  - `customerSignOff`: String?
- Add `CaseApprovalRequest` table:
  - `id`: UUID
  - `caseId`: UUID
  - `actionType`: String (REPLACE_PART, CHANGE_CONFIG, CLOSE_CASE, ESCALATE_R_AND_D)
  - `justification`: String
  - `status`: Enum (PENDING, APPROVED, REJECTED)
  - `approvedBy`: String?
  - `timestamp`: DateTime

## 5. API Changes
- `POST /api/v1/cases` — Initialize a new field service case
- `GET /api/v1/cases/:id` — Fetch complete case workspace state
- `PATCH /api/v1/cases/:id/status` — Transition case status
- `POST /api/v1/cases/:id/approvals` — Request or grant human approval for consequential action
- `POST /api/v1/cases/:id/generate-report` — Generate formal Service Report PDF/Markdown

## 6. UI Changes
- **FSE Case Workspace Hub**:
  - Unified multi-panel dashboard:
    - **Left Panel**: Asset Identity (Model, S/N, Site, Firmware, Service Contract, Past Interventions).
    - **Center Panel**: Active Diagnostic Stepper & Agent Interaction Feed.
    - **Right Panel**: Contextual Knowledge (Side-by-side PDF Viewer, 3D Spatial Model, Required Spare Parts & Tools).
  - **Approval Gate Modal**: Pops up whenever the system or AI recommends replacing a component, modifying calibration offsets, or generating the customer report.

## 7. Architecture Changes
- Eliminates fragile `localStorage` session state across pages.
- Server-side authoritative case state with optimistic client-side updates.
- Explicit governance: AI recommendations cannot alter machine configuration or order parts without documented FSE approval.

## 8. Dependencies
- `@tanstack/react-query`: Robust server state synchronization.

## 9. Implementation Tasks
1. **Prisma Case Model Migration**:
   - Model `ServiceCase` and `CaseApprovalRequest`.
   - Run migration.
2. **Implement NestJS Cases Module**:
   - CRUD and state transition endpoints with RBAC validation.
3. **Build FSE Workspace UI**:
   - Responsive multi-column layout optimized for tablets and laptops.
   - Live activity timeline recording all measurements, test passes/fails, and technician notes.
4. **Build Approval Gate Mechanism**:
   - Intercept consequential AI actions and render explicit confirmation modal.

## 10. Testing
- State transition test: Verify case cannot jump from ARRIVED to COMPLETED without verification tests.
- Approval test: Verify that a `REPLACE_PART` action remains pending until approved.

## 11. Acceptance Criteria
- [ ] FSE can initialize a case by selecting asset S/N and entering initial symptoms.
- [ ] All measurements, steps, and notes are logged in real-time.
- [ ] Consequential actions require explicit human confirmation.
- [ ] End-of-service summary report generated with one click.

## 12. Risks & Rollback Considerations
- **Risk**: FSE accidentally closing browser losing unsaved notes.
- **Mitigation**: Auto-save draft notes to local IndexedDB every 5 seconds.

## 13. Documentation Updates
- Update user manual with FSE Workspace workflow diagrams.
