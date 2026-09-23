# Phase 6: Structured Troubleshooting Engine

## 1. Objective
Transform troubleshooting from static linear lists of procedure steps into an interactive, stateful Diagnostic Decision Engine supporting decision trees, branching (Pass/Fail), loops, physical measurements, tolerance evaluation, required tools, and safety prerequisites.

## 2. Prerequisites
- Phase 1, 2, 4, and 5 completed.

## 3. Files & Modules Affected
- `backend/src/troubleshooting/` (Refactor existing service)
- `backend/src/troubleshooting/troubleshooting-engine.service.ts`
- `backend/src/troubleshooting/semver.util.ts` (Fix naive `parseFloat` semver bug)
- `backend/src/troubleshooting/dto/`
- `backend/prisma/schema.prisma` (Update `Procedure`, `ProcedureNode`, `DiagnosticBranch`)
- `frontend/app/intervention-session/[id]/troubleshooting/` (Interactive diagnostic tree UI)

## 4. Database Changes
- Add `DiagnosticStepNode` table:
  - `id`: UUID
  - `procedureId`: UUID
  - `nodeKey`: String (e.g., "STEP_01_PURGE", "CHECK_PRESSURE")
  - `nodeType`: String (ACTION, MEASUREMENT, DECISION, REPLACEMENT, SAFETY_CHECK)
  - `instruction`: String
  - `warning`: String?
  - `requiredTool`: String?
  - `measurementTarget`: String? (e.g., "Main Manifold Pressure")
  - `nominalMin`: Float?
  - `nominalMax`: Float?
  - `unit`: String?
  - `passNextNodeKey`: String?
  - `failNextNodeKey`: String?
  - `probableCauseOnFail`: String?

## 5. API Changes
- `POST /api/v1/troubleshooting/start` — Initialize a diagnostic session for an active case
- `POST /api/v1/troubleshooting/evaluate-step` — Submit measurement or action outcome:
  - `caseId`: UUID
  - `nodeKey`: String
  - `result`: `{ status: 'PASS' | 'FAIL', measuredValue?: number, notes?: string }`
  - Returns: Next recommended node, evaluated tolerances, and updated failure mode probabilities.
- `GET /api/v1/troubleshooting/tree/:procedureId` — Fetch entire visual decision tree graph.

## 6. UI Changes
- Replace the flat list of steps with an **Interactive Diagnostic Stepper**:
  - Highlights active step with clear safety warnings.
  - Interactive numeric input field for physical measurements with instant Pass/Fail tolerance indicator (green/red).
  - Dynamically renders branching paths based on test results.
  - Lists required tools and personal protective equipment (PPE).

## 7. Architecture Changes
- Eliminates naive `parseFloat` comparison. Replaces with standard `semver` library for multi-part version validation (e.g., `4.2.1` within range `>=4.0.0 <6.0.0`).
- Diagnostic state is stored authoritatively in the case session rather than volatile client state.

## 8. Dependencies
- `semver`: Robust semantic version range checking.

## 9. Implementation Tasks
1. **Semver Comparison Engine**:
   - Implement `semver.util.ts` to replace all `parseFloat` calls with `semver.satisfies(version, range)`.
2. **Prisma Schema Update**:
   - Model `DiagnosticStepNode` and relationships.
   - Run Prisma migration.
3. **Diagnostic Engine Service**:
   - Implement step evaluator: compares `measuredValue` against `[nominalMin, nominalMax]`, selects next node key, logs measurement.
4. **Seed Synthetic Diagnostic Tree**:
   - Create multi-branch decision tree for E1045 (Pressure Instability):
     - Step 1: Safety depressurization & PPE check.
     - Step 2: Measure line voltage to Pump P-102 (Expected: 24V ± 1.0V).
       - FAIL -> Power supply SMPS-24 fault.
       - PASS -> Proceed to Step 3.
     - Step 3: Run pump purge and read digital manometer pressure.
       - FAIL (< 114 kPa) -> Tubing leak or syringe seal failure.
       - PASS (114–126 kPa) -> Pressure sensor PS-23 recalibration.

## 10. Testing
- Unit tests: Test tolerance evaluator on edge cases (exact boundary values, missing units, out-of-range negative values).
- Branching logic test: Verify that a failing measurement reliably advances to the failure branch.

## 11. Acceptance Criteria
- [ ] Multi-component semantic version numbers correctly evaluated.
- [ ] Interactive measurement step validates tolerances dynamically.
- [ ] Diagnostic engine correctly branches on Pass vs Fail.

## 12. Risks & Rollback Considerations
- **Risk**: Infinite loops in circular diagnostic graphs.
- **Mitigation**: Track visited node keys in the session state and terminate if depth exceeds 25 steps.

## 13. Documentation Updates
- Update `docs/plans/phase-06-troubleshooting-engine.md` with state machine transition diagrams.
