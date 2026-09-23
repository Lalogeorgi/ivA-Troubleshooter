---
id: "COMP-SENSOR-PS23"
part_number: "948-510-23"
name: "Manifold Pressure Sensor PS-23"
subsystem: "[[Fluidics]]"
is_field_replaceable: true
expected_lifespan_hours: 12000
mesh_node_id: "SENSOR_PS23"
spare_parts:
  - "[[SP-948-510-23]]"
failure_modes:
  - "[[FM-FLUIDICS-PRESSURE-DROP]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
bulletins:
  - "[[SB-2026-014]]"
---

# Manifold Pressure Sensor PS-23

## Functional Role
The **PS-23 Pressure Sensor** is a stainless-steel diaphragm piezo-resistive transducer monitoring continuous hydraulic pressure across the central manifold block. It provides analog telemetry to the Main Controller Board to detect clot obstructions, syringe micro-leaks, and degasser failure.

## Engineering Specifications
- Part Number: `948-510-23`
- Telemetry Tag: `FL_PRESS_01`
- Nominal Range: `114.0 kPa` to `126.0 kPa` (Target: `120.0 kPa`)
- Output Signal: 4-20 mA current loop
- Connection: M8 4-pin female connector

## Diagnostic Indicators
- Signal `< 114 kPa`: Indicates hydraulic leak, air entrapment, or sensor zero-drift ([[E1045]]).
- Signal `> 135 kPa`: Indicates sample probe blockage or pinched outlet tubing.

> [!WARNING] Calibration Notice
> Per service bulletin [[SB-2026-014]], sensors installed before firmware 4.2 must be re-zeroed using digital calibration manometer `948-CAL-01`.
