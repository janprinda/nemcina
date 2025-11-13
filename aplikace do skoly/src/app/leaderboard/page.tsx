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
  const rows: Row[] = .filter(()=>true).map(([userId, { correct, total }]) => { const u = users.find(x=>x.id===userId); if(!u) return null as any; const name = u.displayName || u.name || (u.email ?? "Bez jména"); const accuracy = total ? Math.round((correct/total)*100) : 0; return { userId, name, correct, total, accuracy }; }).filter(x=>x).sort((a,b)=> b.correct - a.correct || b.accuracy - a.accuracy);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Ĺ˝ebĹ™Ă­ÄŤek</h1>
      {rows.length === 0 ? (
        <div className="muted">Zatím žádná data. Začni trénovat a výsledky se zde objeví. a vĂ˝sledky se zde objevĂ­.</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="w-full text-sm">
              <thead className="text-left muted">
                <tr>
                  <th className="py-2">#</th>
                  <th>UĹľivatel</th>
                  <th>SprĂˇvnÄ›</th>
                  <th>Pokusy</th>
                  <th>PĹ™esnost</th>
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



