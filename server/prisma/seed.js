const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main(){
  const pass = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', passwordHash: pass, name: 'Admin', role: 'ADMIN' }
  });
  console.log('Seeded admin: admin@example.com / Admin@123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
