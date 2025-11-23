import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/authOptions';
import { prisma } from '@/server/prisma';

type SlotResult = {
  reels: string[];
  payout: number; // net tokens gained (can be negative if lost)
  won: boolean;
};

const symbols = ['🍎', '🍋', '🍒', '🔔', '⭐'];

function roll(): string[] {
  return [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { betTokens, subjectId } = body || {};

    const session = await getServerSession(authOptions as any);
    const uid = (session as any)?.user?.id as string | undefined;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!betTokens || typeof betTokens !== 'number' || betTokens <= 0) return NextResponse.json({ error: 'Invalid bet' }, { status: 400 });

    // find user's progress
    let progress = null;
    if (subjectId) {
      progress = await prisma.userSubjectProgress.findUnique({ where: { userId_subjectId: { userId: uid, subjectId } } });
    } else {
      progress = await prisma.userSubjectProgress.findFirst({ where: { userId: uid } });
    }
    if (!progress) return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    if (progress.tokens < betTokens) return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });

    // Perform the bet: deduct bet then determine payout
    const reels = roll();
    let payoutMultiplier = 0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) payoutMultiplier = 5; // triple
    else if (reels[0] === reels[1] || reels[0] === reels[2] || reels[1] === reels[2]) payoutMultiplier = 2; // pair
    else payoutMultiplier = 0;

    const payout = betTokens * payoutMultiplier; // tokens returned (not net)
    const netChange = payout - betTokens; // can be negative

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.userSubjectProgress.update({ where: { id: progress!.id }, data: { tokens: { decrement: betTokens } } });
      if (p) {
        if (p) {
          // award payout if any
          if (payout > 0) {
            await tx.userSubjectProgress.update({ where: { id: progress!.id }, data: { tokens: { increment: payout } } });
          }
        }
      }
      const after = await tx.userSubjectProgress.findUnique({ where: { id: progress!.id } });
      return after;
    });

    const result: SlotResult = {
      reels,
      payout: netChange,
      won: payout > 0,
    };

    return NextResponse.json({ success: true, result, tokens: updated?.tokens });
  } catch (err) {
    console.error('Slot route error', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
