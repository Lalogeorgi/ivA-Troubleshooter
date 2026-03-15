import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fw = parseFloat('5.5.5');
  const procedures = await prisma.procedure.findMany({
    include: {
      instrument: true,
      errorCodes: { include: { errorCode: true } }
    }
  });

  console.log('Total procedures:', procedures.length);

  const finalResults = procedures.filter(proc => {
    if (!proc.firmwareMin && !proc.firmwareMax) return true;
    const min = proc.firmwareMin ? parseFloat(proc.firmwareMin) : -Infinity;
    const max = proc.firmwareMax ? parseFloat(proc.firmwareMax) : Infinity;
    console.log(`Checking fw ${fw} against min ${min} and max ${max}`);
    return fw >= min && fw <= max;
  });

  console.log('Matching procedures:', JSON.stringify(finalResults, null, 2));
}

main().finally(() => prisma.$disconnect());
