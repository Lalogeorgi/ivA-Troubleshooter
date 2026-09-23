---
id: "SYM-PRESSURE-ERRATIC"
title: "Erratic Pressure Readings or Premature Cycle Abort"
instrument: "[[Analyzer-X200]]"
subsystem: "[[Fluidics]]"
correlated_errors:
  - "[[E1045]]"
likely_components:
  - "[[Pump-P102]]"
  - "[[Pressure-Sensor-PS23]]"
failure_modes:
  - "[[FM-FLUIDICS-PRESSURE-DROP]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
---

# Symptom: Erratic Pressure Readings or Premature Cycle Abort

## Observation & Presentation
The operator observes test runs halting unpredictably during the pre-analytical wash or aspiration cycle. The on-screen status banner displays "Hydraulic System Fault" or warning code [[E1045]]. 

Physical manifestations may include:
- Syringe plunger stuttering or audible screeching during fast dispense.
- Micro-bubbles visible in the transparent FEP tubing leading to the flow cell.
- Inconsistent sample pipetting volumes, resulting in QC control outliers.

## Initial Field Triaging Questions
1. Did the error begin immediately following a batch change or reagent lot change?
2. Has the fluidics degassing unit pressure remained at `-80 kPa`?
3. Is fluid observed weeping around the plunger wiper of [[Pump-P102]]?

## Primary Diagnostic Route
1. Perform automated de-bubble and line prime.
2. If bubbles clear but pressure fluctuation continues, run zero check on [[Pressure-Sensor-PS23]].
3. Proceed with [[PROC-PUMP-CALIBRATION]] to isolate sensor electronic drift from hydraulic mechanical leakage.
