"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { startGameAction } from "../actions";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
}

export default function GameSetupPage({
  lessons,
}: {
  lessons: Lesson[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timerValue, setTimerValue] = useState(30);

  const handleStartGame = async (formData: FormData) => {
    setLoading(true);
    try {
      const gameId = await startGameAction(formData);
      if (gameId) {
        router.push(`/teacher/class/game/${gameId}`);
      }
    } catch (err) {
      console.error("Chyba při spuštění hry:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link href="/teacher/class" className="text-sm underline mb-2 block">
          ← Zpět na třídu
        </Link>
        <h1 className="text-3xl font-bold">Spustit hru</h1>
        <p className="text-sm muted mt-1">Nastavte parametry a spusťte interaktivní kvíz pro celou třídu</p>
      </div>

      <form action={handleStartGame} className="card space-y-6">
        <div className="card-body space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Lekce</label>
            <select name="lessonId" className="select w-full" required>
              <option value="">Vyberte lekci...</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Režim hry</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded cursor-pointer hover:bg-[var(--card)]">
                <input
                  type="radio"
                  name="mode"
                  value="mc"
                  defaultChecked
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Rozhodovačka</div>
                  <div className="text-xs muted">Hráči vybírají z 4 možností</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded cursor-pointer hover:bg-[var(--card)]">
                <input
                  type="radio"
                  name="mode"
                  value="write"
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Psaní</div>
                  <div className="text-xs muted">Hráči napíší odpověď volně</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Čas na odpověď (sekundy)</label>
            <input
              name="timerSec"
              type="range"
              min="5"
              max="120"
              step="5"
              value={timerValue}
              onChange={(e) => setTimerValue(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm muted mt-2 text-center">
              <span>{timerValue}</span> sekund
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-lg"
          >
            {loading ? "Spouštím..." : "Spustit hru 🎮"}
          </button>
        </div>
      </form>
    </div>
  );
}
