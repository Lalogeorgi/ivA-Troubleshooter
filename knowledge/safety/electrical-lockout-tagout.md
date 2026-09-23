---
id: "SAFE-LOTO"
title: "Electrical Lockout / Tagout (LOTO) and High Voltage Safety"
category: "Safety"
regulatory_standards:
  - "OSHA 29 CFR 1910.147 Control of Hazardous Energy"
  - "IEC 61010-1 Safety requirements for electrical equipment for measurement, control, and laboratory use"
instruments:
  - "[[Analyzer-X200]]"
subsystems:
  - "[[Power]]"
  - "[[Robotics]]"
---

# Electrical Lockout / Tagout (LOTO) and High Voltage Safety

## Scope
Applicable when performing internal maintenance, power supply servicing, servo drive replacement, or mains breaker troubleshooting on the [[Analyzer-X200]].

> [!WARNING] High Voltage Hazard
> The primary AC distribution box contains hazardous mains line voltages up to 240V AC. Lethal shock hazards exist if protective acrylic shrouds are removed while the AC mains plug is connected.

## Lockout / Tagout Sequence
1. **Notify Laboratory Personnel**: Inform the laboratory supervisor and lead technologist before shutting down the analyzer.
2. **Normal Shutdown**: Initiate orderly OS shutdown via the touchscreen interface (System Menu > Shutdown). Wait for LED indicators to extinguish.
3. **Mains Disconnection**: Switch the rear main circuit breaker to the OFF (0) position. Unplug the mains power cord from the wall receptacle.
4. **Lockout Device**: Attach a plug lockout clamshell over the male plug end and affix the Field Service Engineer padlock and danger tag.
5. **Stored Energy Dissipation**: Wait a minimum of **5 minutes** for primary DC bus filter capacitors (24V and 48V rails) to discharge below 5V DC before touching power harness terminals.
6. **Zero Energy Verification**: Measure with a calibrated digital multimeter across DC bus test points `TP_BUS_48V` and `GND` to verify residual voltage is less than 0.5V DC.
