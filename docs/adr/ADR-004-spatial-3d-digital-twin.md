# ADR-004: 3D Spatial Digital Twin & Browser Visualization Architecture

## Status
Accepted

## Context
Complex medical diagnostics instruments (such as clinical chemistry analyzers, immunoassay systems, and hematology lines) contain hundreds of physical components, fluidic valves, peristaltic pumps, sensor arrays, and harness connectors packed tightly inside sheet-metal enclosures. FSEs frequently lose valuable time locating obscured components, understanding hydraulic access paths, or identifying the correct valve in a dense manifold.

The original prototype had zero spatial visualization capabilities.

## Decision
We introduce a **Browser-Native 3D Spatial Service Interface**:
1. **Technology Stack**:
   - **Three.js** as the core 3D rendering engine.
   - Standard **glTF 2.0 / GLB** binary format with Draco mesh compression.
   - Component tagging via glTF node metadata: each mesh node carries `extras.componentId` matching the component identifier in the medical device ontology.
2. **Interactive Capabilities**:
   - **Diagnostic Highlighting**: When the diagnostic engine flags a component (e.g., *Dispense Pump P-102*), the 3D viewport automatically rotates, zooms, and highlights the target mesh with an illuminated shader glow.
   - **Subsystem Isolation**: Allows the FSE to toggle visibility of outer chassis panels, covers, and adjacent assemblies.
   - **Exploded View**: Interactive slider explodes sub-assemblies along predefined disassembly vectors, visualizing fasteners and removal sequences.
   - **Bidirectional Linking**: Clicking any part in the 3D viewport opens the component inspector card with part numbers, service procedures, required tools, and failure history.
3. **Synthetic Device Baseline for Prototype**:
   - For the open-source prototype, we construct a synthetic clinical analyzer model (*BioMed Analyzer X200*) featuring the primary medical device subsystems: Fluidics, Optical Photometer, Robotic Pipettor Arm, Reagent Carousel, and Cuvette Loader.

## Consequences
### Positive
- Drastically reduces field diagnostic time and physical search errors.
- Bridge between technical literature (PDFs/manuals) and physical machine reality.
- Runs smoothly in modern evergreen desktop and mobile tablet browsers without specialized CAD software.

### Negative
- High-fidelity 3D CAD files require processing and Draco compression to ensure reasonable download sizes over mobile hotspots.
