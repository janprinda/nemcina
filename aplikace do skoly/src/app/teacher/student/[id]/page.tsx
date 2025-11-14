import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import {
  getUserById,
  getAttempts,
  getLessons,
  getAllEntries,
  listClassesForUser,
  listClassMembers,
} from "@/server/store";
import Link from "next/link";

export default async function TeacherStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions as any);
  const me = (session as any)?.user as any;

  if (!me?.id) {
    return <div>Prosím přihlas se.</div>;
  }

  const role = me.role as "USER" | "TEACHER" | "ADMIN" | undefined;
  const studentId = params.id;

  const [student, attempts, lessons, entries] = await Promise.all([
    getUserById(studentId),
    getAttempts(),
    getLessons(),
    getAllEntries(),
  ]);

  if (!student) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <p className="text-sm muted">Uživatel nebyl nalezen.</p>
        <Link href="/teacher/class" className="btn btn-secondary">
          Zpět na učitelskou třídu
        </Link>
      </div>
    );
  }

  if (role !== "ADMIN" && role !== "TEACHER") {
    return <div>Nemáš oprávnění zobrazit tuto stránku.</div>;
  }

  if (role === "TEACHER") {
    const myClasses = await listClassesForUser(me.id as string);
    const teacherClasses = myClasses.filter((c: any) => c.teacherId === me.id);
    let allowed = false;
    for (const cls of teacherClasses) {
      const members = await listClassMembers(cls.id);
      if (members.some((m: any) => m.userId === studentId)) {
        allowed = true;
        break;
      }
    }
    if (!allowed) {
      return (
        <div className="space-y-4 max-w-3xl mx-auto">
          <p className="text-sm muted">
            Tento žák není ve žádné z tvých tříd.
          </p>
          <Link href="/teacher/class" className="btn btn-secondary">
            Zpět na učitelskou třídu
          </Link>
        </div>
      );
    }
  }

  const userAttempts = attempts.filter((a: any) => a.userId === studentId);
  const totalAttempts = userAttempts.length;
  const correctAttempts = userAttempts.filter((a: any) => a.correct).length;
  const totalPoints = userAttempts.reduce(
    (sum: number, a: any) => sum + (a.points ?? 0),
    0
  );
  const accuracy = totalAttempts
    ? Math.round((correctAttempts / totalAttempts) * 100)
    : 0;

  const entriesById = new Map(
    entries.map((e: any) => [e.id as string, e] as const)
  );
  const lessonsById = new Map(
    lessons.map((l: any) => [l.id as string, l] as const)
  );
  const byLesson = new Map<
    string,
    { attempts: number; correct: number; points: number }
  >();

  for (const a of userAttempts) {
    const entry = entriesById.get(a.entryId as string);
    if (!entry) continue;
    const lid = entry.lessonId as string;
    const stat =
      byLesson.get(lid) || { attempts: 0, correct: 0, points: 0 };
    stat.attempts += 1;
    if (a.correct) stat.correct += 1;
    stat.points += a.points ?? 0;
    byLesson.set(lid, stat);
  }

  const lessonRows = Array.from(byLesson.entries())
    .map(([lessonId, s]) => {
      const lesson = lessonsById.get(lessonId);
      return {
        lessonId,
        lessonTitle: (lesson as any)?.title ?? "Neznámá lekce",
        attempts: s.attempts,
        correct: s.correct,
        points: s.points,
        accuracy: s.attempts
          ? Math.round((s.correct / s.attempts) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.points - a.points || b.accuracy - a.accuracy);

  const displayName =
    student.displayName || student.name || student.email || "Bez jména";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Přehled žáka</h1>
          <div className="text-sm muted">{displayName}</div>
        </div>
        <Link href="/teacher/class" className="btn btn-secondary">
          Zpět na učitelskou třídu
        </Link>
      </div>

      <div className="card">
        <div className="card-body grid md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="muted text-xs">Celkové body</div>
            <div className="text-lg font-semibold">{totalPoints}</div>
          </div>
          <div>
            <div className="muted text-xs">Správné odpovědi</div>
            <div className="text-lg font-semibold">
              {correctAttempts} / {totalAttempts || 0}
            </div>
          </div>
          <div>
            <div className="muted text-xs">Přesnost</div>
            <div className="text-lg font-semibold">{accuracy}%</div>
          </div>
          <div>
            <div className="muted text-xs">Počet pokusů</div>
            <div className="text-lg font-semibold">{totalAttempts}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="font-medium mb-3">Výsledky podle lekcí</h2>
          {lessonRows.length === 0 ? (
            <div className="muted text-sm">
              Žák zatím nemá žádné pokusy.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide muted border-b border-[var(--border)]">
                    <th className="py-2 pr-2">Lekce</th>
                    <th className="py-2 px-2 text-right">Body</th>
                    <th className="py-2 px-2 text-right">Správně</th>
                    <th className="py-2 px-2 text-right">Pokusy</th>
                    <th className="py-2 px-2 text-right">Přesnost</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonRows.map((row) => (
                    <tr
                      key={row.lessonId}
                      className="border-b border-[var(--border)]/40 hover:bg-[var(--card)]/40"
                    >
                      <td className="py-2 pr-2">
                        <div className="font-medium">
                          {row.lessonTitle}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right">
                        {row.points}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {row.correct}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {row.attempts}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {row.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
