# ivA-Troubleshooter Documentation Hub

This directory contains the complete technical architecture specifications, architecture decision records (ADRs), and phase-divided implementation plans for evolving **ivA-troubleshooter** into an **Open-Source, AI-Native Medical Device Service Intelligence Platform**.

## Contents

### 1. Architecture Assessments & Specifications (`docs/architecture/`)
- `00-forensic-audit-and-architecture-assessment.md`: Comprehensive forensic repository audit (Sections A–T), technical evaluation, domain ontology, security, and migration matrix.

### 2. Architecture Decision Records (`docs/adr/`)
- `ADR-001-hybrid-knowledge-architecture.md`: Hybrid architecture (Postgres + pgvector + Markdown Knowledge Vault + Graph Traversal).
- `ADR-002-model-agnostic-llm-provider-abstraction.md`: Provider abstraction supporting Local/Private LLMs (Ollama, vLLM) alongside Enterprise Cloud LLMs.
- `ADR-003-offline-first-field-packages.md`: Offline SQLite/PWA Field Package with conflict-free sync.
- `ADR-004-spatial-3d-digital-twin-threejs.md`: Browser-based Three.js + glTF spatial service interface connected to ontology.

### 3. Phase Implementation Plans (`docs/plans/`)
- `phase-00-audit-baseline.md`: Phase 0 — Forensic Audit, Workspace Hygiene & Environment Baseline
- `phase-01-domain-model-equipment-ontology.md`: Phase 1 — Domain Model & Medical Equipment Ontology
- `phase-02-enterprise-knowledge-vault.md`: Phase 2 — Enterprise Knowledge Vault (Markdown + Frontmatter + Wikilinks)
- `phase-03-document-intelligence-ingestion.md`: Phase 3 — Document Intelligence Pipeline (PDF, OCR, Layout, Provenance)
- `phase-04-hybrid-search-knowledge-graph.md`: Phase 4 — Hybrid Search (Lexical + Vector + Graph Traversal)
- `phase-05-agentic-retrieval-tool-architecture.md`: Phase 5 — Agentic Service Core & Tool Protocol (MCP Compatible)
- `phase-06-troubleshooting-engine.md`: Phase 6 — Structured Troubleshooting Engine (Branching, Measurements, Tolerances)
- `phase-07-fse-case-workspace.md`: Phase 7 — FSE Case Workspace & Human-in-the-Loop Governance
- `phase-08-equipment-digital-twin-3d-spatial.md`: Phase 8 — Equipment Digital Twin & 3D Spatial Service Interface
- `phase-09-offline-field-package.md`: Phase 9 — Offline Field Package Generator & Sync Engine
- `phase-10-service-history-case-intelligence.md`: Phase 10 — Service History Intelligence & Empirical Failure Analytics
- `phase-11-security-provenance-safety.md`: Phase 11 — Security, Provenance & AI Safety Hardening
- `phase-12-enterprise-integration-boundaries.md`: Phase 12 — Enterprise Integration Adapters (ServiceNow, Salesforce, SAP, Jira)
- `phase-13-evaluation-benchmarking.md`: Phase 13 — Evaluation Framework & Synthetic Medical Benchmark
- `phase-14-prototype-polish-demonstration.md`: Phase 14 — Synthetic Device Prototype Polish & End-to-End FSE Demo
