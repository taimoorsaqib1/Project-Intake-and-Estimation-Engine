const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.estimateOverride.deleteMany();
  await p.briefNote.deleteMany();
  await p.briefEvent.deleteMany();
  await p.briefAnalysis.deleteMany();
  const { count } = await p.brief.deleteMany();
  console.log(`Deleted ${count} brief(s) and all related data.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
