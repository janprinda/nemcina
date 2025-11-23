import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/authOptions';
import Shop from '@/components/Shop';
import { prisma } from '@/server/prisma';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;

  if (!uid) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">Vyžaduje přihlášení</h1>
        <p className="text-sm muted">Prosím přihlas se pro přístup k obchodu.</p>
      </div>
    );
  }

  // Fetch user's progress and available shop items
  const progress = await prisma.userSubjectProgress.findFirst({ where: { userId: uid } });
  const spendablePoints = progress?.spendablePoints ?? 0;
  const tokens = progress?.tokens ?? 0;
  const subjectId = progress?.subjectId ?? null;

  const shopItems = await prisma.shopItem.findMany({ where: { OR: [{ isGlobal: true }, { subjectId }] } });
  const inventory = await prisma.userInventory.findMany({ where: { userId: uid } });

  return (
    <Shop
      items={shopItems.map(item => ({
        ...item,
        description: item.description ?? undefined,
        pricePoints: item.pricePoints ?? undefined,
        priceTokens: item.priceTokens ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
        config: item.config ?? undefined
      }))}
      spendablePoints={spendablePoints}
      tokens={tokens}
      inventory={inventory}
      subjectId={subjectId}
    />
  );
}
