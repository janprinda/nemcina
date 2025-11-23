import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/authOptions';
import { prisma } from '@/server/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, useTokens, subjectId } = body || {};

    const session = await getServerSession(authOptions as any);
    const uid = (session as any)?.user?.id as string | undefined;

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    // Resolve user's progress record for subject scope
    let progress = null;
    if (subjectId) {
      progress = await prisma.userSubjectProgress.findUnique({ where: { userId_subjectId: { userId: uid, subjectId } } });
    } else {
      progress = await prisma.userSubjectProgress.findFirst({ where: { userId: uid } });
    }

    if (!progress) return NextResponse.json({ error: 'Progress not found' }, { status: 404 });

    // Determine payment method and availability
    if (useTokens) {
      const price = item.priceTokens ?? 0;
      if (price <= 0) return NextResponse.json({ error: 'Item not purchasable with tokens' }, { status: 400 });
      if (progress.tokens < price) return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });

      // Transaction: deduct tokens, add inventory
      const updated = await prisma.$transaction(async (tx) => {
        const p = await tx.userSubjectProgress.update({ where: { id: progress.id }, data: { tokens: { decrement: price } } });
        const inv = await tx.userInventory.upsert({
          where: { userId_itemId_subjectId: { userId: uid, itemId: item.id, subjectId: subjectId ?? null } },
          update: { quantity: { increment: 1 } },
          create: { userId: uid, itemId: item.id, subjectId: subjectId ?? null, quantity: 1 },
        });
        return { p, inv };
      });

      return NextResponse.json({ success: true, spendablePoints: updated.p.spendablePoints, tokens: updated.p.tokens, inventoryItem: updated.inv });
    }

    // Pay with points
    const pricePoints = item.pricePoints ?? 0;
    if (pricePoints <= 0) return NextResponse.json({ error: 'Item not purchasable with points' }, { status: 400 });
    if (progress.spendablePoints < pricePoints) return NextResponse.json({ error: 'Not enough points' }, { status: 400 });

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.userSubjectProgress.update({ where: { id: progress.id }, data: { spendablePoints: { decrement: pricePoints } } });
      const inv = await tx.userInventory.upsert({
        where: { userId_itemId_subjectId: { userId: uid, itemId: item.id, subjectId: subjectId ?? null } },
        update: { quantity: { increment: 1 } },
        create: { userId: uid, itemId: item.id, subjectId: subjectId ?? null, quantity: 1 },
      });
      return { p, inv };
    });

    return NextResponse.json({ success: true, spendablePoints: updated.p.spendablePoints, tokens: updated.p.tokens, inventoryItem: updated.inv });
  } catch (err) {
    console.error('Purchase route error', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

