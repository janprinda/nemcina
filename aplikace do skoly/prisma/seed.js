const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', passwordHash },
    create: { email: adminEmail, name: 'Admin', role: 'ADMIN', passwordHash },
  });

  const lesson = await prisma.lesson.upsert({
    where: { id: 'seed_lesson' },
    update: {},
    create: { id: 'seed_lesson', title: 'Pozdravy a základy', description: 'Základní fráze', languageFrom: 'DE', languageTo: 'CS', createdById: admin.id },
  });

  const entries = [
    { term: 'Guten Tag', translation: 'Dobrý den', type: 'PHRASE' },
    { term: 'Tschüss', translation: 'Ahoj (při loučení)', type: 'WORD' },
    { term: 'Bitte', translation: 'Prosím', type: 'WORD' },
    { term: 'Danke', translation: 'Děkuji', type: 'WORD' },
  ];

  for (const e of entries) {
    await prisma.entry.upsert({
      where: { id: `${lesson.id}_${e.term}` },
      update: {},
      create: { id: `${lesson.id}_${e.term}`, lessonId: lesson.id, term: e.term, translation: e.translation, type: e.type },
    });
  }
  console.log('Seed hotov. Přihlaš se jako admin@example.com / admin123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

