"use client";
import Link from "next/link";

interface Participant {
  userId: string;
  displayName: string;
  score: number;
  answeredCount: number;
}

export default function GameResultsPage({
  participants,
  questionCount,
}: {
  participants: Participant[];
  questionCount: number;
}) {
  const sorted = participants.sort((a, b) => b.score - a.score);
  const avgScore = participants.length
    ? Math.round(participants.reduce((s, p) => s + p.score, 0) / participants.length)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">🎉 Konec hry!</h1>
        <p className="text-lg muted">Zde jsou výsledky</p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-blue-900/20 border border-blue-500/50">
          <div className="card-body text-center space-y-1">
            <div className="text-sm muted">Účastníků</div>
            <div className="text-3xl font-bold">{participants.length}</div>
          </div>
        </div>
        <div className="card bg-purple-900/20 border border-purple-500/50">
          <div className="card-body text-center space-y-1">
            <div className="text-sm muted">Průměr bodů</div>
            <div className="text-3xl font-bold">{avgScore}</div>
          </div>
        </div>
        <div className="card bg-green-900/20 border border-green-500/50">
          <div className="card-body text-center space-y-1">
            <div className="text-sm muted">Otázek</div>
            <div className="text-3xl font-bold">{questionCount}</div>
          </div>
        </div>
      </div>

      {/* Finální pořadí */}
      <div className="card">
        <div className="card-body space-y-6">
          <div className="font-bold text-xl">🏆 Finální pořadí</div>

          <div className="space-y-3">
            {sorted.map((p, idx) => (
              <div
                key={p.userId}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  idx === 0
                    ? "bg-yellow-500/20 border-yellow-500/50"
                    : idx === 1
                    ? "bg-gray-400/20 border-gray-400/50"
                    : idx === 2
                    ? "bg-orange-600/20 border-orange-600/50"
                    : "bg-[var(--card)] border-[var(--border)]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold w-10 text-center">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{p.displayName}</div>
                    <div className="text-sm muted">{p.answeredCount} správných odpovědí</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{p.score}</div>
                  <div className="text-xs muted">bodů</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Akce */}
      <div className="flex gap-2 justify-center">
        <Link href="/teacher/class" className="btn btn-primary">
          Zpět na třídu
        </Link>
        <Link href="/teacher/class/game" className="btn btn-secondary">
          Spustit novou hru
        </Link>
      </div>
    </div>
  );
}
