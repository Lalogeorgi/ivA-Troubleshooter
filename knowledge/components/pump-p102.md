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

# Syringe Dispense Pump P-102

## Functional Role
The **P-102 Syringe Pump** drives sample and reagent aspiration through high-precision sapphire/ceramic plungers. Driven by an integrated bipolar stepper motor via a zero-backlash leadscrew, it delivers accurate volumetric displacement down to 0.05 µL.

## Engineering Specifications
- Part Number: `948-230-01`
- Replacement Kit: `SP-948-230-01`
- Displacement: 250 µL full stroke
- Stepper Drive: 200 steps/rev, 1/16 microstepping
- Plunger Material: High-purity Al2O3 ceramic

## Known Failure Signatures
1. **Plunger Seal Wear**: Leaks around the wash collar leading to loss of hydraulic pressure ([[E1045]]).
2. **Leadscrew Binding**: Audible grinding during prime cycle; leads to stepper position loss.

> [!TIP] Preventive Maintenance
> Inspect the wash wiper seal quarterly. Apply Krytox GPL-205 grease to the leadscrew every 2,000 operating hours.
