"use client";
import { useEffect, useState, useRef } from "react";
import { nextQuestionAction, endGameAction } from "../../actions";
import Link from "next/link";

interface Entry {
  id: string;
  term: string;
  translation: string;
}

interface Participant {
  userId: string;
  displayName: string;
  score: number;
  answeredCount: number;
}

interface GameSession {
  id: string;
  mode: string;
  timerSec: number;
  currentQuestionIdx: number;
  entries: Entry[];
}

export default function GameLivePage({
  params,
  gameSession,
  participants,
}: {
  params: { gameId: string };
  gameSession: GameSession;
  participants: Participant[];
}) {
  const [timeLeft, setTimeLeft] = useState(gameSession.timerSec);
  const [sortedParticipants, setSortedParticipants] = useState(
    participants.sort((a, b) => b.score - a.score)
  );
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timeLeft]);

  const currentEntry = gameSession.entries[gameSession.currentQuestionIdx] || null;

  // Generovat možnosti pro MC
  const generateOptions = () => {
    if (!currentEntry) return [];
    const options = [currentEntry.translation];
    const shuffled = gameSession.entries
      .filter((e) => e.id !== currentEntry.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...options, ...shuffled.map((e) => e.translation)]
      .sort(() => Math.random() - 0.5);
  };

  const options = generateOptions();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🎮 LIVE KVÍZ</h1>
          <div className="text-sm muted">
            Otázka {gameSession.currentQuestionIdx + 1} / {gameSession.entries.length}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
            {timeLeft}
          </div>
          <div className="text-xs muted">sekund</div>
        </div>
      </div>

      {/* Otázka */}
      {currentEntry && (
        <div className="card bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-500/50">
          <div className="card-body space-y-6">
            <div>
              <div className="text-sm muted mb-3">❓ Otázka</div>
              <div className="text-3xl font-bold leading-relaxed">{currentEntry.term}</div>
            </div>

            {gameSession.mode === "mc" ? (
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    className="p-4 bg-[var(--card)] border-2 border-[var(--border)] rounded-lg font-medium hover:border-blue-400 transition-all text-lg"
                  >
                    {String.fromCharCode(65 + idx)}: {option}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Napište odpověď..."
                  className="w-full px-4 py-3 text-lg input"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body space-y-4">
              <div className="font-bold text-lg">🏆 Vítězové</div>
              <div className="space-y-3">
                {sortedParticipants.slice(0, 3).map((p, idx) => (
                  <div
                    key={p.userId}
                    className={`flex items-center gap-3 p-3 rounded ${
                      idx === 0
                        ? "bg-yellow-500/20 border border-yellow-500/50"
                        : idx === 1
                        ? "bg-gray-400/10 border border-gray-400/30"
                        : "bg-orange-600/10 border border-orange-600/30"
                    }`}
                  >
                    <div className="text-2xl font-bold w-8">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.displayName}</div>
                      <div className="text-xs muted">{p.score} bodů</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Žebřáček */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body space-y-3">
              <div className="font-bold text-lg">📊 Celkový žebřáček</div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {sortedParticipants.map((p, idx) => (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between p-2 bg-[var(--card)]/50 rounded"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 text-center font-bold text-sm muted">
                        #{idx + 1}
                      </div>
                      <div className="font-medium text-sm">{p.displayName}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">{p.score}</div>
                      <div className="text-xs muted">{p.answeredCount} ✓</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ovládání */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={async () => {
            await nextQuestionAction(params.gameId);
            setTimeLeft(gameSession.timerSec);
          }}
          className="btn btn-primary"
        >
          Další otázka →
        </button>
        <form
          action={async () => {
            "use server";
            await endGameAction(params.gameId);
          }}
        >
          <button className="btn btn-secondary" type="submit">
            Ukončit hru
          </button>
        </form>
      </div>
    </div>
  );
}
