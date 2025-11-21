// Seed skript: vezme data z data/db.json a nasype je do SQL databáze přes Prisma.
// Spusť např.:  node prisma/seed.js  (a předtím nainstaluj @prisma/client a nastav DATABASE_URL)

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const dbPath = path.join(process.cwd(), "data", "db.json");
  const raw = fs.readFileSync(dbPath, "utf8");
  const json = JSON.parse(raw);

  // ----- USERS -----
  for (const u of json.users || []) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email || null,
        name: u.name || null,
        displayName: u.displayName || null,
        nickname: u.nickname || null,
        passwordHash: u.passwordHash || null,
        role: u.role || "USER",
        birthDate: u.birthDate || null,
        phone: u.phone || null,
        desiredClassCode: u.desiredClassCode || null,
        avatarUrl: u.avatarUrl || null,
        rank: u.rank || null,
        scoreBonus:
          typeof u.scoreBonus === "number" ? u.scoreBonus : null,
        interests: Array.isArray(u.interests) ? u.interests : [],
      },
    });
  }

  // ----- SUBJECT: Němčina -----
  let nemcina = await prisma.subject.findUnique({
    where: { slug: "nemcina" },
  });
  if (!nemcina) {
    nemcina = await prisma.subject.create({
      data: {
        slug: "nemcina",
        title: "Němčina",
        description: "Slovíčka, kvízy, třídy a živé aktivity.",
        active: true,
      },
    });
  }

  // ----- LESSONS -----
  for (const l of json.lessons || []) {
    await prisma.lesson.create({
      data: {
        id: l.id,
        subjectId: nemcina.id,
        title: l.title,
        description: l.description || null,
        createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
        published: !!l.published,
        unlockScore:
          typeof l.unlockScore === "number" ? l.unlockScore : null,
      },
    });
  }

  // ----- ENTRIES -----
  for (const e of json.entries || []) {
    await prisma.entry.create({
      data: {
        id: e.id,
        lessonId: e.lessonId,
        term: e.term,
        translation: e.translation,
        type: e.type,
        partOfSpeech: e.partOfSpeech || null,
        genders: e.genders || [],
        explanation: e.explanation || null,
        termSynonyms: e.termSynonyms || [],
        translationSynonyms: e.translationSynonyms || [],
        plural: e.plural || null,
        verbClass: e.verbClass || null,
        pointsCorrect:
          typeof e.pointsCorrect === "number" ? e.pointsCorrect : null,
        pointsPartial:
          typeof e.pointsPartial === "number" ? e.pointsPartial : null,
        pointsWrong:
          typeof e.pointsWrong === "number" ? e.pointsWrong : null,
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      },
    });
  }

  // ----- ATTEMPTS -----
  for (const a of json.attempts || []) {
    await prisma.attempt.create({
      data: {
        id: a.id,
        userId: a.userId || null,
        entryId: a.entryId,
        answer: a.answer,
        correct: !!a.correct,
        points:
          typeof a.points === "number" ? a.points : null,
        mode: a.mode || null,
        dir: a.dir || null,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      },
    });
  }

  // ----- CLASSES -----
  for (const c of json.classes || []) {
    await prisma.classRoom.create({
      data: {
        id: c.id,
        name: c.name,
        code: c.code,
        teacherId: c.teacherId,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        chatCooldownSec:
          typeof c.chatCooldownSec === "number"
            ? c.chatCooldownSec
            : 0,
      },
    });
  }

  // ----- CLASS MEMBERSHIPS -----
  for (const m of json.classMemberships || []) {
    await prisma.classMembership.create({
      data: {
        id: m.id,
        classId: m.classId,
        userId: m.userId,
        role: m.role || "STUDENT",
      },
    });
  }

  // ----- CHAT MESSAGES -----
  for (const m of json.chatMessages || []) {
    await prisma.chatMessage.create({
      data: {
        id: m.id,
        classId: m.classId,
        userId: m.userId,
        content: m.content,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      },
    });
  }

  // ----- ASSIGNMENTS -----
  for (const a of json.assignments || []) {
    await prisma.assignment.create({
      data: {
        id: a.id,
        classId: a.classId,
        title: a.title,
        description: a.description || null,
        dueDate: a.dueDate ? new Date(a.dueDate) : null,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      },
    });
  }

  // ----- PARTY, PLAYERS, ANSWERS -----
  for (const p of json.parties || []) {
    await prisma.party.create({
      data: {
        id: p.id,
        classId: p.classId,
        lessonId: p.lessonId,
        mode: p.mode,
        timerSec: p.timerSec,
        status: p.status,
        createdBy: p.createdBy,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        entryIds: p.entryIds || [],
        dirs: p.dirs || [],
        currentIndex:
          typeof p.currentIndex === "number" ? p.currentIndex : -1,
      },
    });
  }

  for (const pl of json.partyPlayers || []) {
    await prisma.partyPlayer.create({
      data: {
        id: pl.id,
        partyId: pl.partyId,
        userId: pl.userId,
        displayName: pl.displayName,
        score: typeof pl.score === "number" ? pl.score : 0,
        joinedAt: pl.joinedAt ? new Date(pl.joinedAt) : new Date(),
      },
    });
  }

  for (const ans of json.partyAnswers || []) {
    await prisma.partyAnswer.create({
      data: {
        id: ans.id,
        partyId: ans.partyId,
        userId: ans.userId,
        entryId: ans.entryId,
        dir: ans.dir,
        answer: ans.answer,
        points: ans.points,
        textCorrect: !!ans.textCorrect,
        genderCorrect: !!ans.genderCorrect,
        createdAt: ans.createdAt ? new Date(ans.createdAt) : new Date(),
      },
    });
  }

  // ----- TEACHER CODES -----
  for (const tc of json.teacherCodes || []) {
    await prisma.teacherCode.create({
      data: {
        id: tc.id,
        code: tc.code,
        note: tc.note || null,
        activated: !!tc.activated,
        activatedAt: tc.activatedAt
          ? new Date(tc.activatedAt)
          : null,
        activatedBy: tc.activatedBy || null,
        createdAt: tc.createdAt ? new Date(tc.createdAt) : new Date(),
      },
    });
  }

  console.log("Prisma seed hotový – data z db.json nahraná do SQL DB.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

