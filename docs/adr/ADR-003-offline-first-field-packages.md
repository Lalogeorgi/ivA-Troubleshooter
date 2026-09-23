# ADR-003: Offline-First Field Service Architecture & Field Packages

## Status
Accepted

## Context
Field Service Engineers frequently service medical devices in radio-frequency shielded hospital basements, sub-ground pathology suites, or rural clinics with zero cellular reception or Wi-Fi access. A cloud-dependent troubleshooting tool is useless in these critical clinical environments.

The original prototype attempted an ad-hoc offline fallback by returning a hardcoded static mock string in the AI agent when the API key was missing.

## Decision
We implement a **Deterministic Offline-First Architecture**:
1. **Targeted Field Service Packages (`.iva-pkg`)**:
   - Before departing for a customer site, the FSE generates and downloads a self-contained Field Package scoped to the specific target instrument and site.
   - The package contains:
     - SQLite snapshot of the instrument ontology, error codes, and symptoms.
     - Structured troubleshooting decision trees.
     - Markdown procedures and service bulletins.
     - Target PDF service manuals and high-resolution schematics.
     - glTF 3D model asset with Draco compression.
     - Installed asset configuration and prior service history.
2. **Client-Side Offline Engine**:
   - The client application operates as a Progressive Web App (PWA) with Service Workers caching the application shell.
   - Data is stored in client-side **IndexedDB** / **SQLite WASM via OPFS**.
   - Search runs locally using SQLite FTS5 (Full-Text Search) and structured SQL queries.
3. **Queue & Reconcile Sync Model**:
   - All offline actions (measurements taken, step completions, parts replaced, technician notes) are written to an append-only local change log.
   - When network connectivity is re-established, the sync worker transmits the delta log to the central hub, using conflict-free event sourcing.

## Consequences
### Positive
- 100% operational reliability in air-gapped or shielded hospital environments.
- Fast, instantaneous page loads and procedure lookups from local storage.
- FSE only downloads what is needed for their assigned machines, avoiding huge network payloads.

### Negative
- Requires robust schema synchronization and version tracking between the central PostgreSQL database and local SQLite field packages.
