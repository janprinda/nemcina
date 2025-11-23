const { PrismaClient, Role, EntryType, GameMode, ClassMemberRole, PartyType } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Cleaning database...");
  
  // Delete order matters due to Foreign Keys
  await prisma.aIChatMessage.deleteMany();
  await prisma.aIChatSession.deleteMany();
  await prisma.aICharacter.deleteMany();
  
  await prisma.userInventory.deleteMany();
  await prisma.shopItem.deleteMany();
  
  await prisma.userSubjectProgress.deleteMany();
  
  await prisma.partyAnswer.deleteMany();
  await prisma.partyPlayer.deleteMany();
  await prisma.party.deleteMany();
  
  await prisma.assignment.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.classMembership.deleteMany();
  await prisma.classRoom.deleteMany();
  
  await prisma.attempt.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.subject.deleteMany();
  
  await prisma.teacherCode.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.rank.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Reading db.json...");
  const dbPath = path.join(process.cwd(), "data", "db.json"); // Check this path matches your folder structure!
  const raw = fs.readFileSync(dbPath, "utf8");
  const json = JSON.parse(raw);

  // 1. ----- SUBJECTS -----
  console.log(`📚 Creating default Subject (German)...`);
  const nemcina = await prisma.subject.create({
    data: {
      slug: "nemcina",
      title: "Němčina",
      description: "Slovíčka, kvízy, třídy a živé aktivity.",
      active: true,
    }
  });

  // 2. ----- USERS & PROGRESS -----
  console.log(`👤 Importing ${json.users?.length || 0} users...`);
  for (const u of json.users || []) {
    // Map Role String to Enum
    let role = Role.USER;
    if (u.role === "ADMIN") role = Role.ADMIN;
    if (u.role === "TEACHER") role = Role.TEACHER;

    // Create User (Global Profile)
    const user = await prisma.user.create({
      data: {
        id: u.id,
        email: u.email || null,
        name: u.name || null,
        displayName: u.displayName || null,
        nickname: u.nickname || null,
        role: role,
        passwordHash: u.passwordHash || null,
        birthDate: u.birthDate || null,
        phone: u.phone || null,
        desiredClassCode: u.desiredClassCode || null,
        avatarUrl: u.avatarUrl || null,
        interests: Array.isArray(u.interests) ? u.interests : [],
        // Global Streak starts at 0
        streakDays: 0, 
      },
    });

    // Create Subject Progress (Economy for German)
    // We move the old 'scoreBonus' to this specific subject
    const oldScore = typeof u.scoreBonus === "number" ? u.scoreBonus : 0;
    
    await prisma.userSubjectProgress.create({
      data: {
        userId: user.id,
        subjectId: nemcina.id,
        totalPoints: oldScore,      
        spendablePoints: oldScore,  
        tokens: 0,                  
      }
    });
  }

  // 3. ----- LESSONS -----
  console.log(`📖 Importing ${json.lessons?.length || 0} lessons...`);
  for (const l of json.lessons || []) {
    await prisma.lesson.create({
      data: {
        id: l.id,
        subjectId: nemcina.id, // Link all existing lessons to German
        title: l.title,
        description: l.description || null,
        createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
        published: !!l.published,
        unlockScore: typeof l.unlockScore === "number" ? l.unlockScore : null,
      },
    });
  }

  // 4. ----- ENTRIES (Words) -----
  console.log(`🔤 Importing ${json.entries?.length || 0} entries...`);
  for (const e of json.entries || []) {
    let type = EntryType.WORD;
    if (e.type === "PHRASE") type = EntryType.PHRASE;

    await prisma.entry.create({
      data: {
        id: e.id,
        lessonId: e.lessonId,
        term: e.term,
        translation: e.translation,
        type: type,
        partOfSpeech: e.partOfSpeech || null,
        genders: e.genders || [],
        explanation: e.explanation || null,
        plural: e.plural || null,
        verbClass: e.verbClass || null,
        pointsCorrect: e.pointsCorrect || 35,
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      },
    });
  }

  // 5. ----- ATTEMPTS -----
  const validAttempts = (json.attempts || []).filter(a => a.userId);
  console.log(`🎯 Importing ${validAttempts.length} attempts...`);
  
  for (const a of validAttempts) {
    const userExists = await prisma.user.findUnique({ where: { id: a.userId }});
    const entryExists = await prisma.entry.findUnique({ where: { id: a.entryId }});

    if (userExists && entryExists) {
      let mode = GameMode.MC;
      if (a.mode === "write") mode = GameMode.WRITE;

      await prisma.attempt.create({
        data: {
          id: a.id,
          userId: a.userId,
          entryId: a.entryId,
          answer: a.answer || "",
          correct: !!a.correct,
          points: typeof a.points === "number" ? a.points : 0,
          mode: mode,
          dir: a.dir || "de2cs",
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        },
      });
    }
  }

  // 6. ----- CLASSES -----
  console.log(`🏫 Importing ${json.classes?.length || 0} classes...`);
  for (const c of json.classes || []) {
    const teacherExists = await prisma.user.findUnique({ where: { id: c.teacherId }});
    if(!teacherExists) continue;

    await prisma.classRoom.create({
      data: {
        id: c.id,
        name: c.name,
        code: c.code,
        teacherId: c.teacherId,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        chatCooldownSec: c.chatCooldownSec || 0,
      },
    });
  }

  // 7. ----- CLASS MEMBERSHIPS -----
  if (json.classMemberships) {
    console.log(`👥 Importing memberships...`);
    for (const m of json.classMemberships) {
        let role = ClassMemberRole.STUDENT;
        if (m.role === "TEACHER") role = ClassMemberRole.TEACHER;
        if (m.role === "ADMIN") role = ClassMemberRole.ADMIN;

        const uExists = await prisma.user.findUnique({ where: { id: m.userId }});
        const cExists = await prisma.classRoom.findUnique({ where: { id: m.classId }});

        if(uExists && cExists) {
            await prisma.classMembership.create({
                data: {
                id: m.id,
                classId: m.classId,
                userId: m.userId,
                role: role,
                },
            });
        }
    }
  }

  // 8. ----- ASSIGNMENTS -----
  if (json.assignments) {
    console.log(`📝 Importing assignments...`);
    for (const a of json.assignments) {
      const cExists = await prisma.classRoom.findUnique({ where: { id: a.classId } });
      if(cExists) {
        await prisma.assignment.create({
            data: {
                id: a.id,
                classId: a.classId,
                title: a.title,
                description: a.description || null,
                dueDate: a.dueDate ? new Date(a.dueDate) : null,
                createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
            }
        });
      }
    }
  }

  // 9. ----- CHAT MESSAGES -----
  if (json.chatMessages) {
    console.log(`💬 Importing chat messages...`);
    for (const m of json.chatMessages) {
        const uExists = await prisma.user.findUnique({ where: { id: m.userId }});
        const cExists = await prisma.classRoom.findUnique({ where: { id: m.classId }});

        if(uExists && cExists) {
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
    }
  }

  // 10. ----- PARTIES -----
  if (json.parties) {
    console.log(`🎉 Importing parties...`);
    for (const p of json.parties) {
        const cExists = await prisma.classRoom.findUnique({ where: { id: p.classId }});
        const lExists = await prisma.lesson.findUnique({ where: { id: p.lessonId }});

        if(cExists && lExists) {
            let pMode = GameMode.MC;
            if (p.mode === "write") pMode = GameMode.WRITE;

            await prisma.party.create({
                data: {
                    id: p.id,
                    classId: p.classId,
                    lessonId: p.lessonId,
                    mode: pMode,
                    type: PartyType.CLASSIC, // Default old parties to CLASSIC
                    timerSec: p.timerSec || 30,
                    status: p.status || "ended",
                    createdById: p.createdBy, 
                    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
                    entryIds: p.entryIds || [],
                    dirs: p.dirs || [],
                    currentIndex: p.currentIndex ?? -1
                }
            });
        }
    }
  }

  // 11. ----- PARTY PLAYERS -----
  if (json.partyPlayers) {
    for (const pp of json.partyPlayers) {
        const pExists = await prisma.party.findUnique({ where: { id: pp.partyId }});
        const uExists = await prisma.user.findUnique({ where: { id: pp.userId }});

        if(pExists && uExists) {
            await prisma.partyPlayer.create({
                data: {
                    id: pp.id,
                    partyId: pp.partyId,
                    userId: pp.userId,
                    displayName: pp.displayName || "Player",
                    score: pp.score || 0,
                    joinedAt: pp.joinedAt ? new Date(pp.joinedAt) : new Date(),
                }
            });
        }
    }
  }

  // 12. ----- PARTY ANSWERS -----
  if (json.partyAnswers) {
    for (const pa of json.partyAnswers) {
        const pExists = await prisma.party.findUnique({ where: { id: pa.partyId }});
        const uExists = await prisma.user.findUnique({ where: { id: pa.userId }});
        const eExists = await prisma.entry.findUnique({ where: { id: pa.entryId }});

        if(pExists && uExists && eExists) {
            await prisma.partyAnswer.create({
                data: {
                    id: pa.id,
                    partyId: pa.partyId,
                    userId: pa.userId,
                    entryId: pa.entryId,
                    dir: pa.dir || "de2cs",
                    answer: pa.answer || "",
                    points: pa.points || 0,
                    textCorrect: !!pa.textCorrect,
                    genderCorrect: !!pa.genderCorrect,
                    createdAt: pa.createdAt ? new Date(pa.createdAt) : new Date(),
                }
            });
        }
    }
  }

  // 13. ----- TEACHER CODES -----
  if (json.teacherCodes) {
    console.log(`🔑 Importing teacher codes...`);
    for (const tc of json.teacherCodes) {
        await prisma.teacherCode.create({
            data: {
                id: tc.id,
                code: tc.code,
                note: tc.note || null,
                activated: !!tc.activated,
                activatedAt: tc.activatedAt ? new Date(tc.activatedAt) : null,
                activatedBy: tc.activatedBy || null,
                createdAt: tc.createdAt ? new Date(tc.createdAt) : new Date()
            }
        });
    }
  }

  console.log("✅ Prisma seed finished successfully! Database is live.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });