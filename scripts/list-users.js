#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Get all existing user IDs
  const existing = await prisma.user.findMany({ select: { id: true } });
  const ids = existing.map(u => u.id);

  if (ids.length > 0) {
    // 2. Remove FK dependencies before deleting users
    await prisma.estimateOverride.deleteMany({ where: { overriddenById: { in: ids } } });
    await prisma.briefNote.deleteMany({ where: { authorId: { in: ids } } });
    await prisma.briefEvent.deleteMany({ where: { userId: { in: ids } } });
    await prisma.brief.updateMany({ where: { assigneeId: { in: ids } }, data: { assigneeId: null } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${ids.length} existing user(s).`);
  }

  // 3. Create new users
  const password = await bcrypt.hash('1', 12);

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@veloce.dev', password, role: 'ADMIN' },
    select: { id: true, name: true, email: true, role: true },
  });

  const reviewer = await prisma.user.create({
    data: { name: 'Taimoor', email: 'taimoor@veloce.dev', password, role: 'REVIEWER' },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log('Created users:');
  console.log(JSON.stringify([admin, reviewer], null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
