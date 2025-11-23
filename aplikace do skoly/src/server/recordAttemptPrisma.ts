/**
 * Record attempt to Prisma and sync points to UserSubjectProgress
 */
import { prisma } from "./prisma";

export async function recordAttemptPrisma(data: {
  userId?: string | null;
  entryId: string;
  answer: string;
  correct: boolean;
  points: number;
  mode: "mc" | "write";
  dir: "de2cs" | "cs2de";
}) {
  if (!data.userId) {
    return null;
  }

  try {
    // Get entry with lesson to find subject
    const entry = await prisma.entry.findUnique({
      where: { id: data.entryId },
      include: { lesson: true },
    });

    const lesson = (entry as any)?.lesson;
    const subjectId = lesson?.subjectId;

    if (!entry || !subjectId) {
      return null;
    }

    const userId = data.userId;
    const pointsEarned = Math.max(0, data.points);

    // Create attempt record
    const attempt = await (prisma as any).attempt.create({
      data: {
        userId,
        entryId: data.entryId,
        answer: data.answer,
        correct: data.correct,
        mode: data.mode,
        dir: data.dir,
      },
    });

    // Update or create UserSubjectProgress
    const updatedProgress = await (prisma as any).userSubjectProgress.upsert({
      where: {
        userId_subjectId: {
          userId,
          subjectId,
        },
      },
      create: {
        userId,
        subjectId,
        totalPoints: pointsEarned,
        spendablePoints: pointsEarned,
        tokens: 0,
      },
      update: {
        totalPoints: { increment: pointsEarned },
        spendablePoints: { increment: pointsEarned },
      },
    });

    return { attempt, progress: updatedProgress };
  } catch (error) {
    console.error("[recordAttemptPrisma] Error:", error);
    return null;
  }
}

