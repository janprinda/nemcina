import { getAttempts, getUsers } from "@/server/store";

type Row = {
  userId: string;
  name: string;
  correct: number;
  total: number;
  accuracy: number;
  points: number;
};

export default async function LeaderboardPage() {
  const [users, attempts] = await Promise.all([getUsers(), getAttempts()]);

  const byUser = new Map<
    string,
    { correct: number; total: number; points: number }
  >();

  for (const a of attempts) {
    if (!a.userId) continue;
    const r = byUser.get(a.userId) ?? { correct: 0, total: 0, points: 0 };
    r.total += 1;
    if (a.correct) r.correct += 1;
    r.points += a.points ?? 0;
    byUser.set(a.userId, r);
  }

  const rows: Row[] = Array.from(byUser.entries())
    .map(([userId, { correct, total, points }]) => {
      const u = users.find((x) => x.id === userId);
      if (!u) return null as any;
      const name = u.displayName || u.name || u.email || "Bez jména";
      const bonus = u.scoreBonus ?? 0;
      const totalPoints = points + bonus;
      const accuracy = total ? Math.round((correct / total) * 100) : 0;
      return { userId, name, correct, total, accuracy, points: totalPoints };
    })
    .filter((x): x is Row => !!x)
    .sort((a, b) => b.points - a.points || b.correct - a.correct);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Žebříček</h1>
      {rows.length === 0 ? (
        <div className="muted">
          Zatím žádná data. Začni trénovat a výsledky se zde objeví.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="w-full text-sm">
              <thead className="text-left muted">
                <tr>
                  <th className="py-2">#</th>
                  <th>Uživatel</th>
                  <th>Body</th>
                  <th>Správně</th>
                  <th>Pokusy</th>
                  <th>Přesnost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.userId}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="py-2">{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.points}</td>
                    <td>{r.correct}</td>
                    <td>{r.total}</td>
                    <td>{r.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
