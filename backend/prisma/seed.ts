import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Comprehensive Seed: Medical Equipment Ontology & Baseline Knowledge ---');

  // Clean existing operational and ontology tables
  await prisma.knowledgeEdge.deleteMany();
  await prisma.componentFailureMode.deleteMany();
  await prisma.failureMode.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.actuator.deleteMany();
  await prisma.component.deleteMany();
  await prisma.assembly.deleteMany();
  await prisma.subsystem.deleteMany();
  await prisma.installedAsset.deleteMany();
  await prisma.customerSite.deleteMany();

  // Clean procedure and bulletin relations
  await prisma.procedureStep.deleteMany();
  await prisma.procedureErrorCode.deleteMany();
  await prisma.procedureSymptom.deleteMany();
  await prisma.serviceBulletinProcedure.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.errorCode.deleteMany();
  await prisma.symptom.deleteMany();
  await prisma.serviceBulletin.deleteMany();
  await prisma.machineModule.deleteMany();
  await prisma.interventionSession.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.instrument.deleteMany();
  await prisma.module.deleteMany();

  // 1. Create Instrument Models
  const analyzerX200 = await prisma.instrument.create({
    data: {
      manufacturer: 'BioMed Diagnostics Inc.',
      model: 'Analyzer X200',
      modality: 'Clinical Chemistry',
      description: 'High-throughput random-access clinical chemistry analyzer processing up to 800 photometric tests/hour with dual pipettor arms, precision fluidics, and integrated wash station.',
    },
  });

  const optiScanner = await prisma.instrument.create({
    data: {
      manufacturer: 'Precision Optic AG',
      model: 'OptiScanner Pro',
      modality: 'Immunoassay',
      description: 'Chemiluminescence optical immunoassay analyzer with laser-induced fluorescence detection.',
    },
  });

  // 2. Create Customer Sites
  const siteMetro = await prisma.customerSite.create({
    data: {
      name: 'Metropolitan Central Laboratory',
      hospitalSystem: 'Metro Diagnostic Health',
      city: 'Chicago',
      country: 'USA',
      address: '750 N Michigan Ave, Suite 400',
    },
  });

  const siteStJude = await prisma.customerSite.create({
    data: {
      name: 'St. Jude Regional Medical Center',
      hospitalSystem: 'Regional Health Alliance',
      city: 'Memphis',
      country: 'USA',
      address: '262 Danny Thomas Pl',
    },
  });

  // 3. Create Installed Assets (Field Inventory)
  const assetMetro = await prisma.installedAsset.create({
    data: {
      serialNumber: 'AX-004812',
      instrumentId: analyzerX200.id,
      siteId: siteMetro.id,
      firmwareVersion: '4.2.1',
      installationDate: new Date('2024-06-15T09:00:00Z'),
      status: 'OPERATIONAL',
    },
  });

  const assetStJude = await prisma.installedAsset.create({
    data: {
      serialNumber: 'AX-005190',
      instrumentId: analyzerX200.id,
      siteId: siteStJude.id,
      firmwareVersion: '5.1.0',
      installationDate: new Date('2025-01-20T11:30:00Z'),
      status: 'OPERATIONAL',
    },
  });

  // Also maintain backward-compatible Machine record for legacy endpoints
  const machineMetro = await prisma.machine.create({
    data: {
      instrumentId: analyzerX200.id,
      serialNumber: 'AX-004812',
      firmwareVersion: '4.2.1',
      installationDate: new Date('2024-06-15T09:00:00Z'),
    },
  });

  // 4. Create Subsystems for Analyzer X200
  const subFluidics = await prisma.subsystem.create({
    data: {
      instrumentId: analyzerX200.id,
      name: 'Fluidics & Hydraulics',
      code: 'FLUIDICS',
      description: 'Precision aspiration, reagent dispensing, hydraulic degasser, and waste disposal manifold.',
    },
  });

  const subOptics = await prisma.subsystem.create({
    data: {
      instrumentId: analyzerX200.id,
      name: 'Optics & Photometry',
      code: 'OPTICS',
      description: 'Halogen source, holographic grating monochromator, flow cell, and 12-channel photodiode detector.',
    },
  });

  const subRobotics = await prisma.subsystem.create({
    data: {
      instrumentId: analyzerX200.id,
      name: 'Robotics & Motion Control',
      code: 'ROBOTICS',
      description: 'Dual XYZ pipettor arms, stepper motors, home optical flags, and collision sensor harness.',
    },
  });

  const subThermal = await prisma.subsystem.create({
    data: {
      instrumentId: analyzerX200.id,
      name: 'Thermal & Incubation',
      code: 'THERMAL',
      description: 'Precision 37.0°C reaction bath incubation with Peltier element and thermistor array.',
    },
  });

  const subPower = await prisma.subsystem.create({
    data: {
      instrumentId: analyzerX200.id,
      name: 'Power & Electronics',
      code: 'POWER',
      description: '24V industrial SMPS, motor drivers, CAN bus controller, and power distribution board.',
    },
  });

  const subConsumables = await prisma.subsystem.create({
    data: {
      instrumentId: analyzerX200.id,
      name: 'Consumables & Loader',
      code: 'CONSUMABLES',
      description: 'Reaction cuvette wheel, reagent carousel refrigeration, and tube barcode scanner.',
    },
  });

  // 5. Create Assemblies & Components
  // Assembly: Hydraulic Manifold Block
  const asmHydraulic = await prisma.assembly.create({
    data: {
      subsystemId: subFluidics.id,
      name: 'Hydraulic Manifold Block',
      locationCode: 'BAY-FL-01',
    },
  });

  // Component: Syringe Pump P-102
  const compPump = await prisma.component.create({
    data: {
      assemblyId: asmHydraulic.id,
      name: 'Syringe Dispense Pump P-102',
      partNumber: '948-230-01',
      isFieldReplaceable: true,
      expectedLifespanHours: 6000,
      meshNodeId: 'PUMP_P102',
    },
  });

  await prisma.actuator.create({
    data: {
      componentId: compPump.id,
      name: 'Syringe Plunger Stepper Motor',
      actuatorType: 'STEPPER_MOTOR',
      controlProtocol: 'CAN_BUS_NODE_12',
    },
  });

  await prisma.sparePart.create({
    data: {
      componentId: compPump.id,
      oemPartNumber: 'SP-948-230-01',
      description: 'Complete Syringe Dispense Pump P-102 Replacement Kit with Seals',
      unitCost: 1250.0,
      inventoryMin: 2,
    },
  });

  // Component: Pressure Sensor PS-23
  const compPressureSensor = await prisma.component.create({
    data: {
      assemblyId: asmHydraulic.id,
      name: 'Manifold Pressure Sensor PS-23',
      partNumber: '948-510-23',
      isFieldReplaceable: true,
      expectedLifespanHours: 12000,
      meshNodeId: 'SENSOR_PS23',
    },
  });

  await prisma.sensor.create({
    data: {
      componentId: compPressureSensor.id,
      name: 'Fluidics Line Pressure Transducer',
      telemetryTag: 'FL_PRESS_01',
      signalType: 'ANALOG_4_20MA',
      nominalMin: 114.0,
      nominalMax: 126.0,
      unit: 'kPa',
    },
  });

  await prisma.sparePart.create({
    data: {
      componentId: compPressureSensor.id,
      oemPartNumber: 'SP-948-510-23',
      description: 'Pressure Transducer PS-23 with O-Ring Calibrated Assembly',
      unitCost: 420.0,
      inventoryMin: 3,
    },
  });

  // Component: Solenoid Valve V-04
  const compValve = await prisma.component.create({
    data: {
      assemblyId: asmHydraulic.id,
      name: '3-Way Pinch Valve V-04',
      partNumber: '948-112-04',
      isFieldReplaceable: true,
      expectedLifespanHours: 8000,
      meshNodeId: 'VALVE_V04',
    },
  });

  await prisma.actuator.create({
    data: {
      componentId: compValve.id,
      name: 'Pinch Solenoid Driver',
      actuatorType: 'SOLENOID_VALVE',
      controlProtocol: 'GPIO_HIGH_SIDE',
    },
  });

  // Assembly: Photometer Optical Bench
  const asmOptics = await prisma.assembly.create({
    data: {
      subsystemId: subOptics.id,
      name: 'Photometer Optical Bench',
      locationCode: 'BAY-OP-01',
    },
  });

  const compLamp = await prisma.component.create({
    data: {
      assemblyId: asmOptics.id,
      name: 'Tungsten-Halogen Lamp Assembly LS-01',
      partNumber: '832-100-01',
      isFieldReplaceable: true,
      expectedLifespanHours: 2000,
      meshNodeId: 'LAMP_LS01',
    },
  });

  await prisma.sparePart.create({
    data: {
      componentId: compLamp.id,
      oemPartNumber: 'SP-832-100-01',
      description: '12V 20W Pre-Focused Halogen Lamp Module',
      unitCost: 185.0,
      inventoryMin: 5,
    },
  });

  const compFlowCell = await prisma.component.create({
    data: {
      assemblyId: asmOptics.id,
      name: 'Quartz Micro Flow Cell FC-01',
      partNumber: '832-340-02',
      isFieldReplaceable: true,
      expectedLifespanHours: 15000,
      meshNodeId: 'FLOWCELL_FC01',
    },
  });

  // Assembly: Robotic Pipetting Tower
  const asmRobotics = await prisma.assembly.create({
    data: {
      subsystemId: subRobotics.id,
      name: 'Sample Pipetting Tower',
      locationCode: 'BAY-RB-01',
    },
  });

  const compArm = await prisma.component.create({
    data: {
      assemblyId: asmRobotics.id,
      name: 'Sample Pipettor Arm ARM-01',
      partNumber: '720-410-01',
      isFieldReplaceable: true,
      expectedLifespanHours: 10000,
      meshNodeId: 'ARM_SAMPLE',
    },
  });

  await prisma.sensor.create({
    data: {
      componentId: compArm.id,
      name: 'Arm Home Optical Flag Sensor',
      telemetryTag: 'ARM_Z_HOME',
      signalType: 'DIGITAL',
      nominalMin: 0.0,
      nominalMax: 1.0,
      unit: 'logic',
    },
  });

  // 6. Failure Modes
  const fmPressureDrop = await prisma.failureMode.create({
    data: {
      code: 'FM-FLUIDICS-PRESSURE-DROP',
      title: 'Manifold Hydraulic Pressure Drop',
      description: 'Pressure oscillation or drop below 114 kPa caused by pump plunger seal degradation, tubing delamination, or valve seat obstruction.',
    },
  });

  const fmLampDrift = await prisma.failureMode.create({
    data: {
      code: 'FM-OPTICS-LAMP-DEGRADATION',
      title: 'Photometric Lamp Output Drift',
      description: 'Tungsten-halogen lamp emission decay at 340nm causing photometric calibration drift.',
    },
  });

  // Link Failure Modes to Components
  await prisma.componentFailureMode.create({
    data: {
      componentId: compPump.id,
      failureModeId: fmPressureDrop.id,
      historicalProbability: 0.65,
    },
  });

  await prisma.componentFailureMode.create({
    data: {
      componentId: compPressureSensor.id,
      failureModeId: fmPressureDrop.id,
      historicalProbability: 0.25,
    },
  });

  await prisma.componentFailureMode.create({
    data: {
      componentId: compLamp.id,
      failureModeId: fmLampDrift.id,
      historicalProbability: 0.90,
    },
  });

  // 7. Error Codes, Symptoms, Procedures, Bulletins
  const errE1045 = await prisma.errorCode.create({
    data: {
      instrumentId: analyzerX200.id,
      code: 'E1045',
      description: 'Pressure instability detected in fluidics system during aspiration cycle.',
    },
  });

  const errE1201 = await prisma.errorCode.create({
    data: {
      instrumentId: analyzerX200.id,
      code: 'E1201',
      description: 'Optical baseline absorbance at 340nm exceeds acceptable noise floor.',
    },
  });

  const symPressure = await prisma.symptom.create({
    data: {
      instrumentId: analyzerX200.id,
      description: 'Irregular dispensing volume, pressure error during startup, or fluid leakage near manifold.',
    },
  });

  const symOpticNoise = await prisma.symptom.create({
    data: {
      instrumentId: analyzerX200.id,
      description: 'Photometric calibration failure on reagent blank at 340nm.',
    },
  });

  // Procedures
  const procPumpCal = await prisma.procedure.create({
    data: {
      instrumentId: analyzerX200.id,
      title: 'Pump Pressure Calibration & Leak Verification',
      description: 'Comprehensive workflow to test hydraulic pressure stability, verify pump stroke volume, and bleed micro-bubbles from the manifold.',
      procedureType: 'troubleshooting',
      firmwareMin: '4.0.0',
      firmwareMax: '6.5.0',
    },
  });

  await prisma.procedureErrorCode.create({
    data: {
      procedureId: procPumpCal.id,
      errorCodeId: errE1045.id,
    },
  });

  await prisma.procedureSymptom.create({
    data: {
      procedureId: procPumpCal.id,
      symptomId: symPressure.id,
    },
  });

  await prisma.procedureStep.createMany({
    data: [
      {
        procedureId: procPumpCal.id,
        stepNumber: 1,
        instruction: 'Enter Service Mode on the main touch screen and navigate to Diagnostics > Hydraulics.',
      },
      {
        procedureId: procPumpCal.id,
        stepNumber: 2,
        instruction: 'Perform a 3-minute continuous pump purge routine with deionized water.',
        warning: 'Ensure a dedicated 500mL biohazard waste container is positioned below outlet line W-02.',
      },
      {
        procedureId: procPumpCal.id,
        stepNumber: 3,
        instruction: 'Connect digital manometer P/N 948-CAL-01 to test port TP-FL-01 on the Hydraulic Manifold Block.',
      },
      {
        procedureId: procPumpCal.id,
        stepNumber: 4,
        instruction: 'Execute automated pressure verification sequence: ensure manifold baseline stabilizes at 120 kPa ± 5% (114.0 kPa to 126.0 kPa).',
      },
      {
        procedureId: procPumpCal.id,
        stepNumber: 5,
        instruction: 'If pressure is below 114 kPa, inspect Syringe Pump P-102 seal and replace Pressure Sensor PS-23 if drift persists.',
      },
    ],
  });

  // Service Bulletin
  const sb2026014 = await prisma.serviceBulletin.create({
    data: {
      instrumentId: analyzerX200.id,
      bulletinCode: 'SB-2026-014',
      title: 'Updated Fluidics Pressure Calibration Standards for Firmware 4.2+',
      description: 'Defines updated acceptable manifold pressure limits (114-126 kPa) and mandates checking Syringe Pump P-102 plunger seal for batch 2024-Q3.',
      releaseDate: new Date('2026-02-15T00:00:00Z'),
    },
  });

  await prisma.serviceBulletinProcedure.create({
    data: {
      serviceBulletinId: sb2026014.id,
      procedureId: procPumpCal.id,
    },
  });

  // 8. Seed Knowledge Graph Edges (Preparing for Phase 2)
  await prisma.knowledgeEdge.createMany({
    data: [
      {
        sourceId: errE1045.id,
        sourceType: 'ERROR_CODE',
        targetId: compPump.id,
        targetType: 'COMPONENT',
        relationship: 'AFFECTS',
        weight: 0.85,
      },
      {
        sourceId: errE1045.id,
        sourceType: 'ERROR_CODE',
        targetId: compPressureSensor.id,
        targetType: 'COMPONENT',
        relationship: 'AFFECTS',
        weight: 0.75,
      },
      {
        sourceId: errE1045.id,
        sourceType: 'ERROR_CODE',
        targetId: procPumpCal.id,
        targetType: 'PROCEDURE',
        relationship: 'RESOLVES',
        weight: 1.0,
      },
      {
        sourceId: procPumpCal.id,
        sourceType: 'PROCEDURE',
        targetId: sb2026014.id,
        targetType: 'SERVICE_BULLETIN',
        relationship: 'REFERENCES',
        weight: 1.0,
      },
      {
        sourceId: compPump.id,
        sourceType: 'COMPONENT',
        targetId: subFluidics.id,
        targetType: 'SUBSYSTEM',
        relationship: 'MEMBER_OF',
        weight: 1.0,
      },
    ],
  });

  console.log('--- Comprehensive Seed Completed Successfully! ---');
  console.log('Instrument: BioMed Analyzer X200 with 6 subsystems, 6 components, sensors, actuators, and spare parts.');
  console.log('Sites: St. Jude Regional Medical Center, Metropolitan Central Laboratory.');
  console.log('Installed Assets: AX-004812, AX-005190.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
