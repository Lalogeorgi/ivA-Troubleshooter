import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const analyzerX200 = await prisma.instrument.create({
    data: {
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

  const pumpModule = await prisma.module.create({
    data: {
      name: 'Pump',
      description: 'Fluid management pump module',
    },
  });

  const opticalModule = await prisma.module.create({
    data: {
      name: 'Optical',
      description: 'High-precision optical assembly',
    },
  });

  const reagentModule = await prisma.module.create({
    data: {
      name: 'Reagent',
      description: 'Temperature-controlled reagent unit',
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
