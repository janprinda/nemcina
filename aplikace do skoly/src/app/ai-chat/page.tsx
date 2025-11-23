import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/authOptions';
import AIChat from '@/components/AIChat';

export const dynamic = 'force-dynamic';

export default async function AIChatPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;

  if (!uid) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">Vyžaduje přihlášení</h1>
        <p className="text-sm muted">Prosím přihlas se pro přístup k AI chatu.</p>
      </div>
    );
  }

  // TODO: Fetch AI characters from database
  const characters = [
    {
      id: 'hans',
      name: 'Hans the Baker',
      description: 'Pekař z Berlína',
      language: 'de',
      avatarUrl: '👨‍🍳',
    },
    {
      id: 'maria',
      name: 'Maria the Tourist',
      description: 'Turista z Vídně',
      language: 'de',
      avatarUrl: '👩‍🎓',
    },
  ];

  return (
    <AIChat
      characters={characters}
    />
  );
}
