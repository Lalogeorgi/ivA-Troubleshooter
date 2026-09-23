# Phase 1: Domain Model & Medical Equipment Ontology

## 1. Objective
Design and implement the comprehensive Medical Device Equipment Ontology, transitioning from the simplistic flat `Instrument` -> `Machine` model to a multi-tiered hierarchy (InstrumentModel -> Subsystem -> Assembly -> Component -> Sensor/Actuator -> Consumable -> SparePart), along with Customer Site and Asset models.

## 2. Prerequisites
- Completion of Phase 0 (clean PostgreSQL database baseline).

## 3. Files & Modules Affected
- `backend/prisma/schema.prisma`
- `backend/src/ontology/` (New module replacing fragmented modules)
- `backend/src/ontology/dto/`
- `backend/src/ontology/entities/`
- `backend/src/ontology/ontology.service.ts`
- `backend/src/ontology/ontology.controller.ts`
- `backend/prisma/seed.ts` (Comprehensive synthetic medical device seeding)
- `frontend/app/lib/api.ts` (Typed ontology interfaces)

## 4. Database Changes
- Add models:
  - `InstrumentModel` (with modality, specifications, manufacturer)
  - `Subsystem` (Fluidics, Optics, Robotics, Thermal, Power, Reagent)
  - `Assembly` (e.g., Dispense Manifold, Photometer Carousel)
  - `Component` (with OEM Part Number, MTBF, Field Replaceable flag, 3D mesh node identifier)
  - `Sensor` and `Actuator` (telemetry keys, nominal ranges, units)
  - `SparePart` (part number, inventory info, unit cost)
  - `CustomerSite` and `InstalledAsset` (linking serial number to customer, site, and firmware version)
- Create foreign keys and recursive graph relationships.

## 5. API Changes
- `GET /api/v1/ontology/instruments` — List supported medical instruments
- `GET /api/v1/ontology/instruments/:id/tree` — Fetch complete subsystem/component physical hierarchy
- `GET /api/v1/ontology/components/:id` — Fetch component details, associated sensors, failure modes, and spare parts
- `GET /api/v1/assets/serial/:serialNumber` — Fetch installed asset configuration, firmware, and customer site info

## 6. UI Changes
- Update instrument selection to show modality, manufacturer, and detailed specifications.
- Provide a hierarchical equipment browser component for viewing subsystems and assemblies.

## 7. Architecture Changes
- Deprecate flat `Machine` and `Module` tables in favor of `InstalledAsset` and `Subsystem`/`Component`.
- Establish the physical equipment tree as a queryable domain core.

## 8. Dependencies
- No new external packages required; leverages Prisma and NestJS core.

## 9. Implementation Tasks
1. **Prisma Schema Update**:
   - Write out complete relational ontology models in `schema.prisma`.
   - Run `npx prisma migrate dev --name add_medical_equipment_ontology`.
2. **NestJS Ontology Module**:
   - Implement `OntologyModule`, `OntologyService`, and `OntologyController`.
   - Implement recursive tree query using Prisma or PostgreSQL recursive CTE for rapid tree retrieval.
3. **Comprehensive Synthetic Device Seed (`seed.ts`)**:
   - Seed *BioMed Analyzer X200* with 6 full subsystems:
     - Fluidics (Syringe Pump P-102, Pressure Sensor PS-23, 3-way Solenoid Valve V-04, Degasser DG-01, Waste Manifold WM-02)
     - Optics (Halogen Light Source LS-01, Diffraction Grating DG-10, Photodiode Array PDA-08, Flow Cell FC-01)
     - Robotics (Sample Pipettor Arm ARM-01, Reagent Pipettor Arm ARM-02, Stepper Motor M-101, Home Sensor HS-01)
     - Thermal (Reaction Carousel Incubation Bath IB-01, Peltier Cooler PC-02)
     - Power & Controls (24V SMPS PS-24, Main Controller Board MCB-01)
     - Consumables (Cuvette Loader CL-01, Barcode Scanner BC-01)
   - Seed 2 Customer Sites: *St. Jude Regional Hospital* and *Metropolitan Central Laboratory*.
   - Seed installed assets with active serial numbers (e.g., `AX-004812`).

## 10. Testing
- Unit tests for `OntologyService`: Verify hierarchy reconstruction, component lookup, and tree depth.
- API integration tests: Verify `/api/v1/ontology/instruments/:id/tree` returns full nested structure in < 50ms.

## 11. Acceptance Criteria
- [ ] Equipment ontology models migrated to PostgreSQL.
- [ ] Synthetic *BioMed Analyzer X200* seeded with 6 subsystems, 20+ components, and realistic part numbers.
- [ ] Hierarchical tree endpoint returns accurate parent-child equipment relationships.

## 12. Risks & Rollback Considerations
- **Risk**: Deeply nested queries could introduce latency.
- **Mitigation**: Add appropriate indexes on `instrumentModelId`, `subsystemId`, and `assemblyId`.
- **Rollback**: Revert Prisma migration and restore baseline schema if needed.

## 13. Documentation Updates
- Create `docs/ontology-dictionary.md` detailing every entity, attribute, and relationship in the ontology.
