import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/authOptions';
import CasinoLobby from '@/components/CasinoLobby';
import { prisma } from '@/server/prisma';

export const dynamic = 'force-dynamic';

export default async function CasinoPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;

  if (!uid) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">Vyžaduje přihlášení</h1>
        <p className="text-sm muted">Prosím přihlas se pro přístup k kasinu.</p>
      </div>
    );
  }

  // Fetch user's progress for a subject. Use first progress record as default.
  const progress = await prisma.userSubjectProgress.findFirst({ where: { userId: uid } });

  const spendablePoints = progress?.spendablePoints ?? 0;
  const tokens = progress?.tokens ?? 0;
  const subjectId = progress?.subjectId ?? null;

  return (
    <CasinoLobby
      spendablePoints={spendablePoints}
      tokens={tokens}
      subjectId={subjectId}
    />
  );
}
