# Phase 8: Equipment Digital Twin & 3D Spatial Service Interface

## 1. Objective
Design and integrate an interactive, browser-based 3D Spatial Digital Twin of the medical device using Three.js and glTF 2.0. Allow the FSE to visually explore the instrument, isolate subsystems, highlight components flagged by the diagnostic agent, view exploded assemblies, and inspect physical access and removal sequences.

## 2. Prerequisites
- Phase 1 and Phase 7 completed.

## 3. Files & Modules Affected
- `frontend/components/spatial/` (New Three.js spatial visualization module)
- `frontend/components/spatial/InstrumentViewport.tsx`
- `frontend/components/spatial/SubsystemFilter.tsx`
- `frontend/components/spatial/ExplodeSlider.tsx`
- `frontend/components/spatial/ComponentInspectorCard.tsx`
- `frontend/public/models/` (Synthetic glTF 3D model assets)
- `backend/src/ontology/entities/component.entity.ts` (Ensure `meshNodeId` linkage)

## 4. Database Changes
- None (uses existing `Component.meshNodeId` from Phase 1).

## 5. API Changes
- `GET /api/v1/spatial/models/:instrumentModelId` — Return metadata and CDN/static path for glTF binary asset and mesh-to-component mappings.

## 6. UI Changes
- Embed an interactive WebGL 3D Canvas in the FSE Case Workspace:
  - OrbitControls (rotate, pan, zoom).
  - Subsystem toggle buttons (Chassis, Fluidics, Optics, Robotics, Reagents).
  - Disassembly / Explode slider (0% to 100%).
  - Hover tooltip and click selection: highlights component with an amber/blue emissive shader glow and opens the Component Inspector card.
  - Diagnostic Hook: When the AI agent flags `Pump-P102` or `Pressure-Sensor-PS23`, the camera smoothly animates and zooms to focus on that component with an pulsing indicator.

## 7. Architecture Changes
- Connects the browser 3D rendering context directly to the medical device ontology.
- Pure client-side WebGL rendering without requiring heavy server-side GPU rendering pipelines.

## 8. Dependencies
- `three`: 3D rendering engine.
- `@types/three`: TypeScript definitions.

## 9. Implementation Tasks
1. **Synthetic 3D Medical Device Model**:
   - Construct a procedural or glTF asset for *BioMed Analyzer X200*:
     - Outer chassis covers (translucent or hideable).
     - Fluidics manifold with Syringe Pump P-102 and Pressure Sensor PS-23.
     - Optical assembly with photometer flow cell.
     - Robotic sample pipettor arm.
     - Reagent carousel.
   - Tag mesh objects with `userData.componentId`.
2. **Three.js Viewport Component**:
   - Set up WebGL renderer, perspective camera, ambient & directional lighting, and OrbitControls.
   - Implement Raycaster for mouse/touch component picking.
3. **Explode Assembly Controller**:
   - Interpolate mesh positions along predefined radial or linear offset vectors when slider moves.
4. **Agent Integration Event**:
   - Listen for `highlight-component` events from the diagnostic stepper and animate camera to target mesh.

## 10. Testing
- Performance test: Verify 60 FPS rendering on standard laptop integrated GPUs.
- Raycasting accuracy: Verify clicking mesh node `Pump_P102` triggers inspection card for Component `Pump-P102`.

## 11. Acceptance Criteria
- [ ] 3D model loads and renders smoothly in Chrome, Edge, and Safari.
- [ ] Subsystems can be isolated or hidden.
- [ ] Explode slider separates assembly parts cleanly.
- [ ] Suspected components pulse/highlight automatically during troubleshooting.

## 12. Risks & Rollback Considerations
- **Risk**: Low-end tablets struggling with large polygon counts.
- **Mitigation**: Use low-poly meshes (< 150k polygons total) and Draco mesh compression. Provide a 2D schematic fallback if WebGL is unsupported.

## 13. Documentation Updates
- Update `docs/plans/phase-08-equipment-digital-twin-3d-spatial.md` with mesh tagging specifications.
