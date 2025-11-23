import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/authOptions';
import { getUserById, listSubjects, getLessons } from '@/server/store';
import Dashboard from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;

  if (!uid) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">Vyžaduje přihlášení</h1>
        <p className="text-sm muted">Prosím přihlas se pro přístup k dashboardu.</p>
      </div>
    );
  }

  // Fetch user data
  const user = await getUserById(uid);
  if (!user) {
    return <div>Uživatel nenalezen</div>;
  }

  // Fetch subjects
  const subjects = await listSubjects();
  const activeSubjects = subjects.filter((s) => s.active !== false);

  // Default to first subject or create default
  const currentSubject = activeSubjects.length > 0 
    ? activeSubjects[0] 
    : { id: '1', slug: 'nemcina', title: 'Němčina' };

  // Fetch lessons
  const lessons = await getLessons();

  // TODO: Fetch from UserSubjectProgress table
  // For now, using mock data
  const progress = {
    totalPoints: 1250,
    spendablePoints: 500,
    tokens: 50,
  };

  return (
    <Dashboard
      user={{
        name: user.displayName || user.name || 'Student',
        avatarUrl: user.avatarUrl || undefined,
      }}
      subjects={activeSubjects}
      currentSubject={currentSubject}
      progress={progress}
      lessons={lessons.map(l => ({ ...l, description: l.description || undefined, published: l.published || false }))}
      streakDays={0} // TODO: Fetch from user data
    />
  );
}
