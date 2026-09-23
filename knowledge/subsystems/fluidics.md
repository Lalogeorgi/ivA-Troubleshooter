---
id: "SUB-FLUIDICS"
code: "FLUIDICS"
name: "Fluidics & Hydraulics Subsystem"
instrument: "[[Analyzer-X200]]"
components:
  - "[[Pump-P102]]"
  - "[[Pressure-Sensor-PS23]]"
  - "[[Valve-V04]]"
failure_modes:
  - "[[FM-FLUIDICS-PRESSURE-DROP]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
service_bulletins:
  - "[[SB-2026-014]]"
---

# Fluidics & Hydraulics Subsystem

## Description
The Fluidics subsystem is responsible for precise micro-volume aspiration (1.5 µL to 35.0 µL), reagent dispensing, syringe wash cycles, and high-velocity waste evacuation. It operates under closed-loop pressure monitoring via [[Pressure-Sensor-PS23]].

> [!CAUTION] Biohazard Hazard
> The fluidics lines carry biological patient samples (serum, plasma, urine). Always initiate a full line bleach flush before disconnecting hydraulic fittings.

## Hydraulic Specifications
- Operating Pressure: `120 kPa` (Nominal)
- Low Pressure Alarm Threshold: `< 114 kPa` (Triggers [[E1045]])
- High Pressure Alarm Threshold: `> 135 kPa` (Overpressure Relief)
- Syringe Stroke Resolution: `0.025 µL/step`
- Degasser Vacuum Setpoint: `-80 kPa`

## Critical Components
- **[[Pump-P102]]**: Dual-acting ceramic plunger syringe pump.
- **[[Pressure-Sensor-PS23]]**: Manifold-mounted piezo-resistive pressure transducer.
- **[[Valve-V04]]**: High-speed PTFE 3-way solenoid pinch valve.
