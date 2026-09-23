# Knowledge Vault Specification & Authoring Standard

## 1. Overview
The **ivA Knowledge Vault** is an Obsidian-compatible Markdown repository designed to store structured, human-readable, and machine-actionable medical device service intelligence.

Every knowledge object is an individual Markdown file located within the `knowledge/` root directory. Knowledge objects use YAML frontmatter for machine-readable attributes and GitHub Flavored Markdown (GFM) with `[[wikilinks]]` for human readability, technical descriptions, and bidirectional relational linking.

---

## 2. Directory Hierarchy

```
knowledge/
├── instruments/             # Root instrument definitions (e.g. Analyzer X200)
├── subsystems/              # Core functional engineering subsystems (Fluidics, Optics, etc.)
├── components/              # Physical components, sensors, actuators, and assemblies
├── errors/                  # Firmware and instrument alarm codes (e.g. E1045)
├── symptoms/                # Field-observed symptoms and operator complaints
├── procedures/              # Standard operating & calibration procedures (SOPs)
├── service-bulletins/       # Mandatory and advisory field service bulletins (SBs)
├── failure-modes/           # Failure mode and effects analysis (FMEA) records
├── parts/                   # Replacement spare parts and repair kits
└── safety/                  # Biohazard, electrical LOTO, and chemical safety protocols
```

---

## 3. Frontmatter Schemas

Every file begins and ends with triple dashes `---`.

### 3.1. Instrument (`knowledge/instruments/`)
```yaml
---
id: "INST-ANALYZER-X200"
model: "Analyzer X200"
manufacturer: "BioMed Diagnostics Inc."
modality: "Clinical Chemistry"
firmware_current: "4.2.1"
subsystems:
  - "[[Fluidics]]"
  - "[[Optics]]"
safety_protocols:
  - "[[Biohazard-Precautions]]"
---
```

### 3.2. Subsystem (`knowledge/subsystems/`)
```yaml
---
id: "SUB-FLUIDICS"
code: "FLUIDICS"
name: "Fluidics & Hydraulics Subsystem"
instrument: "[[Analyzer-X200]]"
components:
  - "[[Pump-P102]]"
  - "[[Pressure-Sensor-PS23]]"
failure_modes:
  - "[[FM-FLUIDICS-PRESSURE-DROP]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
---
```

### 3.3. Component / Sensor / Actuator (`knowledge/components/`)
```yaml
---
id: "COMP-PUMP-P102"
part_number: "948-230-01"
name: "Syringe Dispense Pump P-102"
subsystem: "[[Fluidics]]"
is_field_replaceable: true
expected_lifespan_hours: 6000
mesh_node_id: "PUMP_P102"
spare_parts:
  - "[[SP-948-230-01]]"
failure_modes:
  - "[[FM-FLUIDICS-PRESSURE-DROP]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
---
```

### 3.4. Error Code (`knowledge/errors/`)
```yaml
---
id: "ERR-E1045"
code: "E1045"
title: "Fluidics Pressure Instability"
severity: "WARNING"
subsystem: "[[Fluidics]]"
instrument: "[[Analyzer-X200]]"
affected_components:
  - "[[Pump-P102]]"
  - "[[Pressure-Sensor-PS23]]"
likely_failure_modes:
  - "[[FM-FLUIDICS-PRESSURE-DROP]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
bulletins:
  - "[[SB-2026-014]]"
---
```

### 3.5. Procedure (`knowledge/procedures/`)
```yaml
---
id: "PROC-PUMP-CALIBRATION"
title: "Syringe Pump P-102 Calibration & Pressure Sensor Zeroing"
instrument: "[[Analyzer-X200]]"
subsystem: "[[Fluidics]]"
procedure_type: "calibration"
firmware_min: "4.0.0"
firmware_max: "6.5.0"
estimated_time_minutes: 30
required_tools:
  - "Digital Manometer (P/N 948-CAL-01)"
required_parts:
  - "[[SP-948-230-01]]"
safety_protocols:
  - "[[Biohazard-Precautions]]"
---
```

### 3.6. Service Bulletin (`knowledge/service-bulletins/`)
```yaml
---
id: "SB-2026-014"
bulletin_code: "SB-2026-014"
title: "Updated Manifold Pressure Calibration Standards for FW 4.2+"
instrument: "[[Analyzer-X200]]"
subsystem: "[[Fluidics]]"
release_date: "2026-03-15"
severity: "MANDATORY"
affected_components:
  - "[[Pump-P102]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
---
```

---

## 4. Wikilink Syntax & Relationship Resolution

Wikilinks follow standard Obsidian syntax:
- Direct: `[[TargetName]]`
- Aliased: `[[TargetName|Display Text]]`

### Relationship Derivation Matrix
| Context / Frontmatter Key | Inferred Relationship |
| :--- | :--- |
| `procedures` in Error/Symptom | `RESOLVES` / `PROCEDURE_FOR` |
| `affected_components` / `components` | `AFFECTS` / `CONTAINS` |
| `spare_parts` / `parts` | `USES_PART` / `REPLACES` |
| `failure_modes` | `CAUSED_BY` / `FAILS_WITH` |
| `safety_protocols` | `REQUIRES_SAFETY` |
| `subsystem` | `BELONGS_TO` |
| `instrument` | `PART_OF` |
| Markdown Body Wikilinks | `REFERENCES` |

---

## 5. Synchronization API

- `POST /vault/sync` or `POST /api/v1/vault/sync`:
  Initiates a full recursive scan of `knowledge/`, parses frontmatter and AST links, reconciles entity aliases, updates the PostgreSQL `KnowledgeEdge` graph table, and reports any broken or dangling wikilinks.
- `GET /vault/entities/:id`:
  Returns parsed entity with frontmatter, body, inbound edges, and outbound edges.
- `GET /vault/graph`:
  Returns the complete node and edge graph for network visualization.
