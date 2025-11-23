import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/authOptions';
import { prisma } from '@/server/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { points, subjectId } = body || {};

    const session = await getServerSession(authOptions as any);
    const uid = (session as any)?.user?.id as string | undefined;

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!points || typeof points !== 'number' || points <= 0) {
      return NextResponse.json({ error: 'Invalid points' }, { status: 400 });
    }

    // Find user's progress record for the subject; if subjectId not provided, pick any
    let progress = null;
    if (subjectId) {
      progress = await prisma.userSubjectProgress.findUnique({
        where: { userId_subjectId: { userId: uid, subjectId } },
      });
    } else {
      progress = await prisma.userSubjectProgress.findFirst({ where: { userId: uid } });
    }

    if (!progress) {
      return NextResponse.json({ error: 'Progress record not found' }, { status: 404 });
    }

    if (progress.spendablePoints < points) {
      return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
    }

    const tokensGained = Math.floor(points / 10);

    // Update in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.userSubjectProgress.update({
        where: { id: progress.id },
        data: {
          spendablePoints: { decrement: points },
          tokens: { increment: tokensGained },
        },
      });
      return p;
    });

    return NextResponse.json({ success: true, tokensGained, pointsSpent: points, spendablePoints: updated.spendablePoints, tokens: updated.tokens });
  } catch (err) {
    console.error('Exchange route error', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
