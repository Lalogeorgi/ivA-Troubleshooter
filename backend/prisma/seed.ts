import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear all existing data to prevent duplicates
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

  const analyzerX200 = await prisma.instrument.upsert({
    where: { id: 'dummy-id-to-force-create-if-uniques-not-set' }, // Note: no unique besides id in schema currently, so we just clear DB first
    update: {},
    create: {
      manufacturer: 'Bio-Med Solutions',
      model: 'Analyzer X200',
      description: 'High-speed clinical chemistry analyzer',
    },
  });

  const opticalScanner = await prisma.instrument.create({
    data: {
      manufacturer: 'Precision Optic',
      model: 'OptiScanner Pro',
      description: 'Advanced optical scanning instrument',
    },
  });

  const pumpModule = await prisma.module.upsert({
    where: { name: 'Pump' },
    update: {},
    create: {
      name: 'Pump',
      description: 'Fluid management pump module',
    },
  });

  const opticalModule = await prisma.module.upsert({
    where: { name: 'Optical' },
    update: {},
    create: {
      name: 'Optical',
      description: 'High-precision optical assembly',
    },
  });

  const reagentModule = await prisma.module.upsert({
    where: { name: 'Reagent' },
    update: {},
    create: {
      name: 'Reagent',
      description: 'Temperature-controlled reagent unit',
    },
  });

  console.log('Seeding Phase 1 baseline data completed.');
  
  // PHASE 2 SEED DATA
  const errorCodeE1045 = await prisma.errorCode.create({
    data: {
      instrumentId: analyzerX200.id,
      code: 'E1045',
      description: 'Pressure instability detected in fluidics system.',
    },
  });

  const symptomPressure = await prisma.symptom.create({
    data: {
      instrumentId: analyzerX200.id,
      description: 'Irregular dispensing or fluid leakage',
    },
  });

  const pressureCalibrationProcedure = await prisma.procedure.create({
    data: {
      instrumentId: analyzerX200.id,
      title: 'Pump Pressure Calibration',
      description: 'Steps to recalibrate the main fluidics pump for stable pressure.',
      procedureType: 'troubleshooting',
      firmwareMin: '4.0',
      firmwareMax: '6.0',
    },
  });

  // Link Procedure to ErrorCode and Symptom
  await prisma.procedureErrorCode.create({
    data: {
      procedureId: pressureCalibrationProcedure.id,
      errorCodeId: errorCodeE1045.id,
    },
  });

  await prisma.procedureSymptom.create({
    data: {
      procedureId: pressureCalibrationProcedure.id,
      symptomId: symptomPressure.id,
    },
  });

  // Add Procedure Steps
  await prisma.procedureStep.createMany({
    data: [
      {
        procedureId: pressureCalibrationProcedure.id,
        stepNumber: 1,
        instruction: 'Enter service mode on the main display screen.',
      },
      {
        procedureId: pressureCalibrationProcedure.id,
        stepNumber: 2,
        instruction: 'Run pump purge routine for 3 minutes.',
        warning: 'Ensure a waste container is placed below the outlet.',
      },
      {
        procedureId: pressureCalibrationProcedure.id,
        stepNumber: 3,
        instruction: 'Perform calibration using the calibration tool widget.',
      },
      {
        procedureId: pressureCalibrationProcedure.id,
        stepNumber: 4,
        instruction: 'Verify pressure stability remains at 120kPa ± 5%.',
      },
    ],
  });

  const serviceBulletinTB = await prisma.serviceBulletin.create({
    data: {
      instrumentId: analyzerX200.id,
      bulletinCode: 'TB-2026-014',
      title: 'Updated Pump Calibration Standards',
      description: 'Revised acceptable pressure limits for firmware 4.2+.',
      releaseDate: new Date('2026-02-15T00:00:00Z'),
    },
  });

  // Link Service Bulletin to Procedure
  await prisma.serviceBulletinProcedure.create({
    data: {
      serviceBulletinId: serviceBulletinTB.id,
      procedureId: pressureCalibrationProcedure.id,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
