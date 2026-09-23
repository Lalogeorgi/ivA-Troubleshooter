# Phase 10: Service History Intelligence & Empirical Failure Analytics

## 1. Objective
Leverage historical service case data and technician notes to provide empirical diagnostic intelligence. Enable the system to correlate symptoms, error codes, and firmware versions with historical component failure rates and successful resolutions—clearly distinguishing statistical evidence from deterministic facts.

## 2. Prerequisites
- Phase 1, 4, 5, and 7 completed.

## 3. Files & Modules Affected
- `backend/src/analytics/` (New NestJS Service Intelligence Module)
- `backend/src/analytics/case-intelligence.service.ts`
- `backend/src/analytics/failure-clustering.service.ts`
- `backend/prisma/seed.ts` (Seed historical service records)
- `frontend/components/HistoricalPatternCard.tsx`

## 4. Database Changes
- Add `HistoricalCase` table (or enrich `ServiceCase` with historical flags):
  - `assetModelId`: UUID
  - `serialNumber`: String
  - `firmwareVersion`: String
  - `reportedSymptom`: String
  - `errorCode`: String
  - `rootCauseComponentId`: UUID
  - `partsReplaced`: String[]
  - `resolutionTimeHours`: Float
  - `recurrenceDays`: Int?
  - `technicianObservations`: String

## 5. API Changes
- `POST /api/v1/analytics/case-patterns` — Query historical case failure distribution for a given context:
  - Input: `{ instrumentModelId, errorCode?, symptom?, firmwareVersion? }`
  - Output:
    - `totalMatchingCases`: Int
    - `topResolutions`: Array of `{ componentName, resolutionType, count, percentage, meanLaborHours }`
    - `relevantTechnicianTips`: Array of verified observations

## 6. UI Changes
- **Historical Case Intelligence Widget**:
  - Displays empirical resolution breakdown:
    - *"Historically for E1045 on FW 4.2+: 17 recorded cases (65% resolved by Pressure Sensor PS-23 replacement, 24% resolved by tubing bleed & degasser cleaning, 11% unresolved/escalated)."*
  - Clearly styled with an **Empirical Observation** badge (never presented as deterministic truth).

## 7. Architecture Changes
- AI agent tool `query_historical_failures` queries this service directly to substantiate hypotheses with empirical fleet data.
- Strict guardrails: synthetic statistics are strictly prohibited in production; data must derive from recorded cases.

## 8. Dependencies
- No new external packages.

## 9. Implementation Tasks
1. **Seed Historical Case Data**:
   - Seed 50 realistic historical cases across Analyzer X200 machines covering various failure modes (hydraulic leaks, optical lamp degradation, pipettor stepper stall).
2. **Implement Case Intelligence Aggregator**:
   - Aggregate resolutions grouped by component, error code, and firmware.
   - Extract recurring technician keywords and tips.
3. **Agent Integration**:
   - Equip agent with tool to fetch historical failure distributions and cite them as contextual evidence.

## 10. Testing
- Aggregation test: Verify calculation of failure percentages and average resolution times.
- Evidence labeling test: Verify the UI and agent output explicitly label historical data as statistical, not absolute.

## 11. Acceptance Criteria
- [ ] Historical service patterns correctly aggregated from database records.
- [ ] Agent successfully references historical precedent during diagnosis.
- [ ] Zero fabrication of statistics; clear visual disclaimer shown in UI.

## 12. Risks & Rollback Considerations
- **Risk**: Small sample sizes leading to misleading percentages (e.g. 1 out of 1 case = 100%).
- **Mitigation**: Require minimum threshold (e.g. n >= 5) before displaying percentage distributions; otherwise display raw count.

## 13. Documentation Updates
- Document statistical aggregation methodology in `docs/plans/phase-10-service-history-case-intelligence.md`.
