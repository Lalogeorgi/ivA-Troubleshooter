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
  - "Precision Hex Driver 2.5mm"
  - "Deionized Water Flush Kit (P/N 948-CLN-12)"
  - "Lint-Free Optical Wipes"
required_parts:
  - "[[SP-948-230-01]]"
  - "[[SP-948-510-23]]"
safety_protocols:
  - "[[Biohazard-Precautions]]"
  - "[[Electrical-Lockout-Tagout]]"
bulletins:
  - "[[SB-2026-014]]"
error_codes:
  - "[[E1045]]"
---

# Syringe Pump P-102 Calibration & Pressure Sensor Zeroing

## Purpose
This standard operating procedure instructs the Field Service Engineer on verifying, recalibrating, and zeroing the [[Pump-P102]] hydraulic displacement and the [[Pressure-Sensor-PS23]] manifold transducer following error [[E1045]] or component replacement.

> [!CAUTION] Biohazard Safety Warning
> Fluidic lines may contain residual human serum, plasma, or chemical reagents. Put on personal protective equipment (gloves, goggles, lab coat) in accordance with [[Biohazard-Precautions]]. Ensure waste lines are securely directed into a biohazard receptacle.

## Prerequisites & Tools
1. BioMed Diagnostic Service Tool v4.2+ connected via service port ETH1.
2. Calibrated NIST-traceable Digital Manometer `948-CAL-01`.
3. 2.5 mm ball-end hex driver.
4. Purified deionized water (Type II clinical laboratory grade).

---

## Step-by-Step Procedure

### Step 1: System Isolation and Depressurization
- Navigate to Service Utilities > Fluidics Diagnostics > Hydraulic Depressurization.
- Verify software line pressure displays `0.0 kPa ± 1.0 kPa`.
- Place absorbent pad under the [[Pump-P102]] mounting bay.

### Step 2: Manometer Connection
- Disconnect Quick-Disconnect test line `TP-FL-01` on the fluidics manifold.
- Connect the digital manometer `948-CAL-01` to `TP-FL-01` using the quick-release Luer lock fitting.
- Power on the manometer and zero the atmospheric reading.

### Step 3: Zero-Offset Verification of [[Pressure-Sensor-PS23]]
- In the diagnostic console, select `Calibrate Sensor PS-23 > Zero Calibration`.
- With line open to atmospheric vent, ensure digital readout is `0.00 kPa`.
- If offset exceeds `± 1.2 kPa`, adjust calibration gain parameter `P_ZERO_OFFSET` in EEPROM.

### Step 4: Dynamic Pressure Test & Pump Sweep
- Command [[Pump-P102]] to perform 5 consecutive full-stroke dispenses (250 µL at 50 µL/s).
- Record physical manometer pressure: Target range is **114.0 kPa to 126.0 kPa**.
- Record telemetry pressure on sensor [[Pressure-Sensor-PS23]].
- If variance between physical manometer and software reading exceeds `2.0 kPa`, re-run calibration curve per [[SB-2026-014]].

### Step 5: High-Pressure Leakage Test
- Command [[Valve-V04]] to isolate position (closed).
- Drive pump to 130 kPa hold pressure for 60 seconds.
- Acceptable pressure decay: Less than `1.5 kPa` over 60 seconds.
- If pressure drops > 1.5 kPa, inspect [[Pump-P102]] plunger wash seal and replace with [[SP-948-230-01]].

### Step 6: Post-Calibration Verification & Purge
- Disconnect manometer and reconnect original hydraulic line to `TP-FL-01`.
- Execute automated system de-bubble and prime sequence (3 cycles of DI water).
- Verify error [[E1045]] is cleared and instrument returns to Standby status.
