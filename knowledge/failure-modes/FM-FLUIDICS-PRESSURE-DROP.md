---
id: "FM-FLUIDICS-PRESSURE-DROP"
code: "FM-FLUIDICS-PRESSURE-DROP"
title: "Fluidics Hydraulic Line Pressure Loss"
subsystem: "[[Fluidics]]"
instrument: "[[Analyzer-X200]]"
affected_components:
  - "[[Pump-P102]]"
  - "[[Pressure-Sensor-PS23]]"
  - "[[Valve-V04]]"
observable_symptoms:
  - "[[SYM-PRESSURE-ERRATIC]]"
correlated_errors:
  - "[[E1045]]"
associated_procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
spare_parts:
  - "[[SP-948-230-01]]"
  - "[[SP-948-510-23]]"
---

# Failure Mode: Fluidics Hydraulic Line Pressure Loss

## Definition & Physical Mechanism
A drop in continuous fluid line pressure below the operational threshold of `114.0 kPa` during active aspiration or dispensing cycles. 

This condition occurs through three primary root causes:
1. **Mechanical Seal Degradation**: Wear of the ceramic plunger washer in [[Pump-P102]] allows fluid bypass back into the wash wash-port.
2. **Pinch Valve Orifice Obstruction / Deterioration**: Accumulation of proteinaceous precipitate or fatigue in the fluoroelastomer diaphragm of [[Valve-V04]].
3. **Sensor Measurement Drift**: Piezo-resistive drift in transducer [[Pressure-Sensor-PS23]] caused by thermal hysteresis or micro-cracking in the diaphragm solder joint.

## FMEA Matrix
- **Severity (S)**: 7 (Stops instrument testing; incomplete clinical batches)
- **Occurrence (O)**: 4 (Moderately frequent in high-throughput environments > 5,000 tests/day)
- **Detection (D)**: 2 (High detection rate; immediately intercepted by firmware monitoring [[E1045]])
- **RPN (Risk Priority Number)**: 56

## Field Verification Steps
1. Visual inspection: Check for droplets beneath the pump bay and valve manifold.
2. Check physical manometer readings using [[PROC-PUMP-CALIBRATION]].
3. Run automated syringe hold test:
   - If line pressure decays while stationary, isolate [[Valve-V04]].
   - If decay continues with valve closed, suspect [[Pump-P102]] seal failure.
