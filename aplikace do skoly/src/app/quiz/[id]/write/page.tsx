"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitAnswer } from "../actions";

type Entry = {
  id: string;
  term: string;
  translation: string;
  explanation?: string | null;
  partOfSpeech?: string | null;
  genders?: ("der" | "die" | "das")[] | null;
};

async function fetchEntries(lessonId: string): Promise<Entry[]> {
  const res = await fetch(`/api/lesson/${lessonId}/entries`);
  return res.json();
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizWritePage({ params }: { params: { id: string } }) {
  const search = useSearchParams();
  const dirParam =
    (search.get("dir") as "de2cs" | "cs2de" | "mix" | null) || "de2cs";
  const shuffleParam = search.get("shuffle") === "1";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<
    null | { correct: boolean; expected: string; points: number }
  >(null);
  const [genderChoice, setGenderChoice] = useState<"" | "der" | "die" | "das">(
    ""
  );
  const [dirs, setDirs] = useState<Array<"de2cs" | "cs2de">>([]);
  const [results, setResults] = useState<
    Array<{
      id: string;
      correct: boolean;
      expected: string;
      your: string;
      term: string;
      translation: string;
      dir: "de2cs" | "cs2de";
    }>
  >([]);

  useEffect(() => {
    fetchEntries(params.id).then((list) => {
      const base = shuffleParam ? shuffle(list) : list;
      const d = base.map(() =>
        dirParam === "mix"
          ? Math.random() < 0.5
            ? "de2cs"
            : "cs2de"
          : dirParam
      );
      setEntries(base);
      setDirs(d);
    });
  }, [params.id, dirParam, shuffleParam]);

  const current = entries[idx];
  const done = idx >= entries.length;
  const currentDir = dirs[idx] || "de2cs";
  const prompt =
    currentDir === "de2cs" ? "Přelož do češtiny" : "Přelož do němčiny";
  const shownBase =
    currentDir === "de2cs" ? current?.term : current?.translation;
  const shown =
    currentDir === "de2cs" &&
    current?.partOfSpeech === "noun" &&
    current?.genders?.length
      ? `${current.genders!.join("/")} ${shownBase}`
      : shownBase;

  const expectedNow = current
    ? currentDir === "de2cs"
      ? current.translation
      : current.term
    : "";

  const canSubmit = !!answer.trim();

  const totalPoints = useMemo(
    () => results.reduce((sum, r) => sum + (r.correct ? 1 : 0), 0),
    [results]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 text-center">
      {!entries.length ? (
        <div>Načítám… nebo v lekci nejsou slovíčka.</div>
      ) : !done ? (
        <>
          <div className="text-sm text-gray-400">
            {idx + 1} / {entries.length}
          </div>
          <div className="card">
            <div className="card-body">
              <div className="muted text-sm">{prompt}</div>
              <div className="mt-1 text-2xl font-semibold text-gray-100">
                {shown}
              </div>
              {current?.explanation && (
                <div className="mt-2 text-xs muted">{current.explanation}</div>
              )}
            </div>
          </div>

          {currentDir === "cs2de" &&
            current?.partOfSpeech === "noun" &&
            current.genders?.length && (
              <div className="space-y-2">
                <div className="text-sm muted">Vyber rod (der/die/das)</div>
                <div className="grid grid-cols-3 gap-2">
                  {(["der", "die", "das"] as const).map((g) => {
                    const active = genderChoice === g;
                    const colorClass =
                      g === "der"
                        ? "gender-der"
                        : g === "die"
                        ? "gender-die"
                        : "gender-das";
                    return (
                      <button
                        key={g}
                        type="button"
                        className={`btn ${
                          active ? colorClass : "btn-secondary"
                        }`}
                        onClick={() => setGenderChoice(g)}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          <div className="space-y-2">
            <input
              className="input w-full"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Sem napiš odpověď…"
            />
          </div>

          {!feedback ? (
            <div className="flex gap-2 justify-center">
              <button
                className="btn btn-primary"
                disabled={!canSubmit}
                onClick={async () => {
                  if (!current) return;
                  const res = await submitAnswer(
                    current.id,
                    answer,
                    currentDir,
                    genderChoice || null,
                    "write"
                  );
                  setFeedback({
                    correct: !!res.correct,
                    expected: res.expected,
                    points: res.points,
                  });
                  setResults((r) => [
                    ...r,
                    {
                      id: current.id,
                      correct: !!res.correct,
                      expected: res.expected,
                      your: answer,
                      term: current.term,
                      translation: current.translation,
                      dir: currentDir,
                    },
                  ]);
                }}
              >
                Potvrdit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={`card ${
                  feedback.correct ? "border-green-700" : "border-red-700"
                }`}
              >
                <div className="card-body">
                  <div
                    className={`text-sm ${
                      feedback.correct ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {feedback.correct ? "Správně!" : "Špatně."}{" "}
                    <span className="muted text-xs">
                      ({feedback.points} bodů)
                    </span>
                  </div>
                  {!feedback.correct && (
                    <div className="text-sm text-gray-300 mt-1">
                      Správně: <b>{feedback.expected}</b>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setFeedback(null);
                    setAnswer("");
                    setGenderChoice("");
                    setIdx((i) => i + 1);
                  }}
                >
                  Další
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="overlay">
          <div className="confetti-layer">
            {Array.from({ length: 48 }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${(i * 2.1) % 100}%`,
                  backgroundColor: ["#60a5fa", "#34d399", "#f87171", "#fbbf24", "#a78bfa"][i % 5],
                  animationDelay: `${(i % 10) * 0.12}s`,
                  animationDuration: `${1.8 + (i % 6) * 0.25}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 w-full max-w-3xl space-y-4">
            <div className="text-3xl font-semibold text-center">Hotovo!</div>
            <div className="text-center text-sm text-gray-400">
              Správně: {results.filter((r) => r.correct).length} / {entries.length}
            </div>
            <div className="flex gap-2 justify-center">
              <a className="btn btn-secondary" href={`/quiz/${params.id}`}>
                Zpět na volbu
              </a>
              <a
                className="btn btn-primary"
                href={`/quiz/${params.id}/write?shuffle=1&dir=${dirParam}`}
              >
                Zkusit znovu
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

