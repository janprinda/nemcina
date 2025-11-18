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

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizMCPage({ params }: { params: { id: string } }) {
  const search = useSearchParams();
  const dirParam =
    (search.get("dir") as "de2cs" | "cs2de" | "mix" | null) || "de2cs";
  const shuffleParam = search.get("shuffle") === "1";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [dirs, setDirs] = useState<Array<"de2cs" | "cs2de">>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    | null
    | {
        correct: boolean;
        expected: string;
        points: number;
      }
  >(null);
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
  const [genderChoice, setGenderChoice] = useState<"" | "der" | "die" | "das">(
    ""
  );
  const [genderRetry, setGenderRetry] = useState(false);

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
      setIdx(0);
      setFeedback(null);
      setResults([]);
      setSelected(null);
      setGenderChoice("");
      setGenderRetry(false);
    });
  }, [params.id, dirParam, shuffleParam]);

  const current = entries[idx];
  const done = idx >= entries.length;
  const currentDir = dirs[idx] || "de2cs";
  const progress = entries.length
    ? Math.min(100, (idx / entries.length) * 100)
    : 0;

  const requiresGender =
    currentDir === "cs2de" &&
    current?.partOfSpeech === "noun" &&
    (current?.genders?.length || 0) > 0;

  const prompt =
    currentDir === "de2cs"
      ? "Vyber správný překlad do češtiny"
      : "Vyber správný překlad do němčiny";

  const shownBase =
    currentDir === "de2cs" ? current?.term : current?.translation;
  const shown =
    currentDir === "de2cs" &&
    current?.partOfSpeech === "noun" &&
    current?.genders?.length
      ? `${current.genders.join("/")} ${shownBase}`
      : shownBase;

  const options = useMemo(() => {
    if (!current) return [] as string[];
    const pool = entries.filter((e) => e.id !== current.id);
    const others =
      currentDir === "de2cs"
        ? pool.map((e) => e.translation)
        : pool.map((e) => e.term);
    const count = Math.min(4, 1 + others.length);
    const distractors = shuffle(others).slice(0, count - 1);
    const correct =
      currentDir === "de2cs" ? current.translation : current.term;
    return shuffle([correct, ...distractors]);
  }, [current, entries, currentDir]);

  // reset state between questions / directions
  useEffect(() => {
    setSelected(null);
    setGenderChoice("");
    setGenderRetry(false);
  }, [idx, currentDir]);

  // Keyboard shortcuts: 1–4 select, Enter confirm/next
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current || done) return;
      if (!feedback) {
        const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
        if (map[e.key] !== undefined && options[map[e.key]] !== undefined) {
          setSelected(options[map[e.key]]);
        } else if (e.key === "Enter" && selected) {
          handleConfirm();
        }
      } else if (e.key === "Enter") {
        handleNext();
      }
    }
    function handleConfirm() {
      if (!current || !selected) return;
      (async () => {
        const res = await submitAnswer(
          current.id,
          selected,
          currentDir,
          requiresGender ? genderChoice || null : null,
          "mc"
        );
        if (
          !res.correct &&
          res.textCorrect &&
          currentDir === "cs2de" &&
          current.partOfSpeech === "noun" &&
          !genderRetry
        ) {
          // jedna šance opravit jen rod
          setGenderRetry(true);
          return;
        }
        let expectedText = res.expected;
        if (
          !res.correct &&
          currentDir === "cs2de" &&
          current.partOfSpeech === "noun" &&
          current.genders?.length
        ) {
          expectedText = `${current.genders.join("/")} ${res.expected}`;
        }
        setFeedback({
          correct: !!res.correct,
          expected: expectedText,
          points: res.points,
        });
        setResults((r) => [
          ...r,
          {
            id: current.id,
            correct: !!res.correct,
            expected: expectedText,
            your: selected,
            term: current.term,
            translation: current.translation,
            dir: currentDir,
          },
        ]);
      })();
    }
    function handleNext() {
      setFeedback(null);
      setSelected(null);
      setGenderChoice("");
      setGenderRetry(false);
      setIdx((i) => i + 1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    current,
    currentDir,
    done,
    feedback,
    genderChoice,
    genderRetry,
    options,
    requiresGender,
    selected,
  ]);

  if (!entries.length) {
    return <div>Načítám… nebo v lekci nejsou slovíčka.</div>;
  }

  const handleConfirmClick = async () => {
    if (!current || !selected) return;
    const res = await submitAnswer(
      current.id,
      selected,
      currentDir,
      requiresGender ? genderChoice || null : null,
      "mc"
    );
    if (
      !res.correct &&
      res.textCorrect &&
      currentDir === "cs2de" &&
      current.partOfSpeech === "noun" &&
      !genderRetry
    ) {
      setGenderRetry(true);
      return;
    }
    let expectedText = res.expected;
    if (
      !res.correct &&
      currentDir === "cs2de" &&
      current.partOfSpeech === "noun" &&
      current.genders?.length
    ) {
      expectedText = `${current.genders.join("/")} ${res.expected}`;
    }
    setFeedback({
      correct: !!res.correct,
      expected: expectedText,
      points: res.points,
    });
    setResults((r) => [
      ...r,
      {
        id: current.id,
        correct: !!res.correct,
        expected: expectedText,
        your: selected,
        term: current.term,
        translation: current.translation,
        dir: currentDir,
      },
    ]);
  };

  const handleNextClick = () => {
    setFeedback(null);
    setSelected(null);
    setGenderChoice("");
    setGenderRetry(false);
    setIdx((i) => i + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {!done ? (
        <>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">
              {idx + 1} / {entries.length}
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-body space-y-2">
              <div className="text-gray-400 text-sm">{prompt}</div>
              <div className="mt-1 text-2xl font-semibold text-gray-100">
                {shown}
              </div>
              {current?.explanation && (
                <div className="mt-1 text-xs muted">{current.explanation}</div>
              )}
            </div>
          </div>

          {requiresGender && (
            <div className="space-y-2">
              <div className="text-sm muted">Vyber rod (der/die/das)</div>
              {genderRetry && (
                <div
                  className="text-sm bg-yellow-600/20 border border-yellow-600 rounded px-3 py-2 mt-2"
                  role="status"
                  aria-live="polite"
                >
                  Nesprávná odpověď — máš jednu šanci opravit jen rod a potvrdit
                  znovu.
                </div>
              )}
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
                      onClick={() =>
                        setGenderChoice((prev) => (prev === g ? "" : g))
                      }
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {options.map((opt) => {
              const isCorrectOption =
                currentDir === "de2cs"
                  ? opt === current?.translation
                  : opt === current?.term;
              const isSelected = selected === opt;
              return (
                <button
                  key={opt}
                  className={`btn text-left ${
                    isSelected ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() =>
                    setSelected((prev) => (prev === opt ? null : opt))
                  }
                >
                  {opt}
                  {feedback && isCorrectOption && (
                    <span className="ml-2 text-xs text-emerald-300">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {!feedback ? (
            <div className="mt-4 flex justify-center">
              <button
                className="btn w-full text-lg py-4 bg-emerald-500 hover:bg-emerald-400 border-none text-white disabled:bg-gray-600 disabled:text-gray-300"
                disabled={!selected || (requiresGender && !genderChoice)}
                onClick={handleConfirmClick}
              >
                {genderRetry ? "Potvrdit (opravit rod)" : "Potvrdit"}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
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
                    <div className="text-sm text-gray-300">
                      Správně: <b>{feedback.expected}</b>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  className="btn w-full md:w-auto text-base py-3"
                  onClick={handleNextClick}
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
                  left: `${((i * 2.1) % 100).toFixed(2)}%`,
                  backgroundColor: [
                    "#60a5fa",
                    "#34d399",
                    "#f87171",
                    "#fbbf24",
                    "#a78bfa",
                  ][i % 5],
                  animationDelay: `${(i % 10) * 0.12}s`,
                  animationDuration: `${1.8 + (i % 6) * 0.25}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 w-full max-w-3xl space-y-4">
            <div className="text-3xl font-semibold text-center">Hotovo!</div>
            <div className="text-center text-sm text-gray-400">
              Správně: {results.filter((r) => r.correct).length} /{" "}
              {entries.length}
            </div>
            {results.some((r) => !r.correct) && (
              <div className="card">
                <div className="card-body space-y-2 max-h-80 overflow-auto">
                  <div className="font-medium">Shrnutí chyb</div>
                  {results
                    .filter((r) => !r.correct)
                    .map((r) => (
                      <div key={r.id} className="text-sm text-gray-300">
                        {r.dir === "de2cs" ? (
                          <>
                            <b>{r.term}</b> → {r.expected}{" "}
                            <span className="text-red-400">
                              (tvoje: {r.your || "—"})
                            </span>
                          </>
                        ) : (
                          <>
                            <b>{r.translation}</b> → {r.expected}{" "}
                            <span className="text-red-400">
                              (tvoje: {r.your || "—"})
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <a className="btn btn-secondary" href={`/quiz/${params.id}`}>
                Zpět na volbu
              </a>
              <a
                className="btn btn-primary"
                href={`/quiz/${params.id}/mc?shuffle=1&dir=${dirParam}`}
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
