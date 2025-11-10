import { getAttempts, getUsers } from "@/server/store";

type Row = { userId: string; name: string; correct: number; total: number; accuracy: number };

export default async function LeaderboardPage() {
  const [users, attempts] = await Promise.all([getUsers(), getAttempts()]);
  const byUser = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    if (!a.userId) continue;
    const r = byUser.get(a.userId) ?? { correct: 0, total: 0 };
    r.total += 1; if (a.correct) r.correct += 1;
    byUser.set(a.userId, r);
  }
  const rows: Row[] = Array.from(byUser.entries()).map(([userId, { correct, total }]) => {
    const u = users.find(x => x.id === userId);
    const name = u?.name || (u?.email ?? "Bez jména");
    const accuracy = total ? Math.round((correct/total)*100) : 0;
    return { userId, name, correct, total, accuracy };
  }).sort((a,b)=> b.correct - a.correct || b.accuracy - a.accuracy);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Žebříček</h1>
      {rows.length === 0 ? (
        <div className="muted">Zatím žádná data. Začni trénovat a výsledky se zde objeví.</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="w-full text-sm">
              <thead className="text-left muted">
                <tr>
                  <th className="py-2">#</th>
                  <th>Uživatel</th>
                  <th>Správně</th>
                  <th>Pokusy</th>
                  <th>Přesnost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.userId} className="border-t border-[var(--border)]">
                    <td className="py-2">{i+1}</td>
                    <td>{r.name}</td>
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

