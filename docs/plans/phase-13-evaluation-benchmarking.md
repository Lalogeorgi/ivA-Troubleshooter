# Phase 13: Evaluation Framework & Synthetic Medical Benchmark

## 1. Objective
Establish an automated evaluation framework to measure the technical accuracy, retrieval quality, safety compliance, and diagnostic efficiency of the platform against a synthetic clinical device benchmark suite with verified ground truth.

## 2. Prerequisites
- Phases 1 through 12 completed.

## 3. Files & Modules Affected
- `benchmark/` (New root benchmark suite)
- `benchmark/scenarios/` (25 synthetic clinical failure scenarios)
- `benchmark/runner.ts` (Evaluation harness)
- `benchmark/metrics/` (Precision, Recall, Factuality, Hallucination scoring)
- `backend/package.json` (Add evaluation run scripts)

## 4. Database Changes
- None (runs against test database or isolated test tenant).

## 5. API Changes
- None.

## 6. UI Changes
- None (automated CLI and reporting dashboard).

## 7. Architecture Changes
- Continuous benchmark evaluation pipeline for AI diagnostic accuracy and retrieval regression prevention.

## 8. Dependencies
- `@types/jest`, `vitest` or standalone Node.js benchmark runner.

## 9. Implementation Tasks
1. **Curate Synthetic Clinical Benchmark Scenarios**:
   - 25 clinically realistic medical device scenarios:
     - 10 Fluidics issues (pressure drops, degasser failures, syringe motor stalls, clot obstructions).
     - 5 Optical issues (lamp output drift, filter wheel misalignment, dark current anomaly).
     - 5 Robotics issues (pipettor arm z-home failure, reagent probe crash, barcode misalignment).
     - 5 Thermal/Incubation issues (carousel temperature drift, Peltier overload).
2. **Implement Evaluation Metrics**:
   - **Retrieval Precision@k & Recall@k**: Percentage of ground-truth manual pages retrieved in top 3 and 5 chunks.
   - **Diagnostic Accuracy**: Percentage of cases where ground-truth root cause component is identified in top-2 recommendations.
   - **Next-Step Accuracy**: Correctness of next suggested physical action or measurement.
   - **Hallucination Rate**: Count of non-existent part numbers, out-of-spec tolerances, or unverified procedures claimed by the agent.
   - **Human Governance Compliance**: Verification that 100% of destructive or consequential actions triggered an approval request.
3. **Automated Runner & Markdown Report Generator**:
   - Execute benchmark suite across both Local LLM (Ollama) and Cloud LLM configurations; output comparison table.

## 10. Testing
- Run benchmark runner against baseline vector retrieval vs. hybrid retrieval: verify measurable uplift in Precision and Recall.

## 11. Acceptance Criteria
- [ ] 25 synthetic benchmark scenarios executed automatically.
- [ ] Ground-truth retrieval recall > 90% on top-5 results.
- [ ] 0% hallucination rate on safety-critical procedures and part numbers.
- [ ] 100% compliance on human approval gates.

## 12. Risks & Rollback Considerations
- **Risk**: High latency executing full LLM benchmark suite.
- **Mitigation**: Support mock provider for fast regression checks in CI/CD, running full LLM evaluation on nightly builds.

## 13. Documentation Updates
- Publish benchmark results to `docs/architecture/00-forensic-audit-and-architecture-assessment.md`.
