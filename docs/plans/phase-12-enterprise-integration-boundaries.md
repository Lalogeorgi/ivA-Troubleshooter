# Phase 12: Enterprise Integration Boundaries (FSM/ERP/CRM Adapters)

## 1. Objective
Establish clean integration boundaries and adapters for enterprise systems (ServiceNow, Salesforce Field Service, SAP ERP, Jira), enabling ivA to act as the specialized technical intelligence layer without unnecessarily attempting to duplicate standard enterprise dispatch, billing, or inventory platforms.

## 2. Prerequisites
- Phase 7 and Phase 11 completed.

## 3. Files & Modules Affected
- `backend/src/integrations/` (New Integrations Module)
- `backend/src/integrations/interfaces/fsm-adapter.interface.ts`
- `backend/src/integrations/interfaces/erp-adapter.interface.ts`
- `backend/src/integrations/adapters/servicenow.adapter.ts`
- `backend/src/integrations/adapters/salesforce.adapter.ts`
- `backend/src/integrations/adapters/jira.adapter.ts`
- `backend/src/integrations/webhooks/webhook.controller.ts`

## 4. Database Changes
- Add `ExternalIntegrationMapping` table:
  - `id`: UUID
  - `entityType`: String (CASE, ASSET, CUSTOMER)
  - `internalId`: UUID
  - `externalSystem`: String (SERVICENOW, SALESFORCE, JIRA, SAP)
  - `externalId`: String
  - `lastSyncTimestamp`: DateTime

## 5. API Changes
- `POST /api/v1/integrations/webhooks/:system` — Inbound webhook endpoint for external work order creation
- `POST /api/v1/cases/:id/export-to-fsm` — Synchronize case resolution and parts consumed to external FSM
- `POST /api/v1/cases/:id/escalate-to-jira` — File engineering bug ticket with diagnostic trace attached

## 6. UI Changes
- Export & Escalation buttons in Case Workspace:
  - "Sync to ServiceNow Work Order"
  - "Escalate to R&D (Jira)" with pre-filled technical telemetry

## 7. Architecture Changes
- Abstract adapter pattern: Core application interacts only with `IFsmAdapter` and `IErpAdapter`.
- External system failures do not block the FSE's on-site diagnostic workflow.

## 8. Dependencies
- No mandatory external dependencies; standard HTTPS REST / OAuth2 client.

## 9. Implementation Tasks
1. **Define Adapter Interfaces**:
   - `IFsmAdapter`: `fetchWorkOrder`, `syncCaseStatus`, `postLaborAndParts`.
   - `IErpAdapter`: `checkPartAvailability`, `requestStockTransfer`.
2. **Implement Mock & Reference Adapters**:
   - `MockFsmAdapter` for local testing and open-source demonstrations.
   - `ServiceNowAdapter` (REST Table API).
   - `JiraAdapter` (REST API v3 for R&D issue tracking).
3. **Inbound Webhook Controller**:
   - Process incoming work order creation payloads and initialize `ServiceCase`.

## 10. Testing
- Mock adapter test: Verify roundtrip conversion of an ivA Service Case into a ServiceNow Work Order payload.
- Resilience test: Verify that external API timeouts fail gracefully without stalling the diagnostic engine.

## 11. Acceptance Criteria
- [ ] Clean adapter boundaries with zero proprietary SDK lock-in.
- [ ] Successful export of case summary, parts replaced, and labor hours to external FSM format.
- [ ] R&D escalation files structured Jira ticket with diagnostic steps and logs.

## 12. Risks & Rollback Considerations
- **Risk**: External API schema variations across enterprise customer tenants.
- **Mitigation**: Use configurable JSON schema field mappers per tenant.

## 13. Documentation Updates
- Update `docs/plans/phase-12-enterprise-integration-boundaries.md` with integration sequence diagrams.
