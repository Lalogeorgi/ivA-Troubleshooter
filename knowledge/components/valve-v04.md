---
id: "COMP-VALVE-V04"
part_number: "948-310-04"
name: "3-Way Solenoid Pinch Valve V-04"
subsystem: "[[Fluidics]]"
is_field_replaceable: true
expected_lifespan_hours: 8000
mesh_node_id: "VALVE_V04"
failure_modes:
  - "[[FM-FLUIDICS-PRESSURE-DROP]]"
procedures:
  - "[[PROC-PUMP-CALIBRATION]]"
---

# 3-Way Solenoid Pinch Valve V-04

## Functional Role
The **V-04 Solenoid Pinch Valve** switches hydraulic paths between the reagent aspiration port, the DI wash buffer supply, and the analytical flow cell. It uses an inert PTFE wetted body and high-speed 24V DC solenoid actuator.

## Engineering Specifications
- Part Number: `948-310-04`
- Actuation Voltage: 24V DC (Pulse-width modulated hold: 9V DC)
- Response Time: < 15 ms
- Wetted Materials: PTFE, Kalrez
- Port Fittings: 1/4-28 UNF flat-bottom flangeless

## Diagnostic Indicators & Failure Modes
- Sluggish response or failure to seal leads to back-leakage, reducing manifold pressure and contributing to failure mode [[FM-FLUIDICS-PRESSURE-DROP]].
- Inspect valve coil resistance: Nominal is `38.5 Ω ± 5%`. If reading is open or shorted, replace valve assembly.
