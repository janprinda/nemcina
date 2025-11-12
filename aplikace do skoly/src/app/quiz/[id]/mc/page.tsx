"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitAnswer } from "../actions";

type Entry = { id: string; term: string; translation: string; partOfSpeech?: string | null; genders?: ('der'|'die'|'das')[]|null };

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

export default function QuizMCPage({ params }: { params: { id: string } }) {
  const search = useSearchParams();
  const dirParam = (search.get('dir') as 'de2cs'|'cs2de'|'mix' | null) || 'de2cs';
  const shuffleParam = search.get('shuffle') === '1';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { correct: boolean; expected: string }>(null);
  const [dirs, setDirs] = useState<Array<'de2cs'|'cs2de'>>([]);
  const [results, setResults] = useState<Array<{ id: string; correct: boolean; expected: string; your: string; term: string; translation: string; dir: 'de2cs'|'cs2de' }>>([]);
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [genderChoice, setGenderChoice] = useState<''|'der'|'die'|'das'>('');
  const [genderRetry, setGenderRetry] = useState(false);

  // shuffle() defined above at module scope

  useEffect(() => {
    fetchEntries(params.id).then((list) => {
      const base = shuffleParam ? shuffle(list) : list;
      const d = base.map(() => dirParam === 'mix' ? (Math.random() < 0.5 ? 'de2cs' : 'cs2de') : dirParam);
      setEntries(base);
      setDirs(d);
    });
  }, [params.id, dirParam, shuffleParam]);

  const current = entries[idx];
  const done = idx >= entries.length;

  const currentDir = dirs[idx] || 'de2cs';
  const prompt = currentDir === 'de2cs' ? 'Vyber správný překlad (CZ)' : 'Vyber správný překlad (DE)';
  const shownBase = currentDir === 'de2cs' ? current?.term : current?.translation;
  const shown = (currentDir === 'de2cs' && current?.partOfSpeech === 'noun' && current?.genders?.length)
    ? `${current.genders!.join('/')} ${shownBase}`
    : shownBase;
  const options = useMemo(() => {
    if (!current) return [] as string[];
    const pool = entries.filter(e => e.id !== current.id);
    const others = currentDir === 'de2cs' ? pool.map(e => e.translation) : pool.map(e => e.term);
    const count = Math.min(4, 1 + others.length);
    const distractors = shuffle(others).slice(0, count - 1);
    const correct = currentDir === 'de2cs' ? current.translation : current.term;
    return shuffle([correct, ...distractors]);
  }, [current, entries, currentDir]);
  useEffect(() => { setEliminated(new Set()); setSelected(null); setGenderChoice(''); setGenderRetry(false); }, [idx, currentDir]);
  // Keyboard shortcuts: 1-4 select option, Enter confirm/next
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (!feedback) {
        const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
        if (map[e.key] !== undefined && options[map[e.key]] !== undefined) {
          setSelected(options[map[e.key]]);
        } else if (e.key === 'Enter' && selected) {
          (async () => {
            const res = await submitAnswer(current.id, selected, currentDir, genderChoice || null);
            if (!res.correct && res.textCorrect && currentDir === 'cs2de' && current?.partOfSpeech === 'noun' && !genderRetry) {
              // allow one retry to fix only gender
              setGenderRetry(true);
              return;
            }
            setFeedback({ correct: !!res.correct, expected: res.expected });
            setResults((r) => [...r, { id: current.id, correct: !!res.correct, expected: res.expected, your: selected, term: current.term, translation: current.translation, dir: currentDir }]);
          })();
        }
      } else if (e.key === 'Enter') {
        setFeedback(null); setSelected(null); setIdx((i)=>i+1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, feedback, options, selected, currentDir, genderChoice, genderRetry]);

  if (!entries.length) return <div>Načítám… nebo v lekci nejsou slovíčka.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {!done ? (
        <>
          <div className="text-sm text-gray-400">{idx + 1} / {entries.length}</div>
          <div className="card"><div className="card-body">
            <div className="text-gray-400 text-sm">{prompt}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-100">{shown}</div>
          </div></div>
          <div className="text-xs muted text-left">Tip: ß lze psát jako "ss".</div>
          {currentDir === 'cs2de' && current?.partOfSpeech === 'noun' && (
            <div className="space-y-2">
              <div className="text-sm muted">Vyber rod (der/die/das)</div>
              <div className="grid grid-cols-3 gap-2">
                {(['der','die','das'] as const).map(g => {
                  const active = genderChoice === g;
                  const colorClass = g==='der' ? 'gender-der' : g==='die' ? 'gender-die' : 'gender-das';
                  return (
                    <button key={g} type="button" className={`btn ${active ? colorClass : 'btn-secondary'}`} onClick={()=> setGenderChoice(g)}>{g}</button>
                  );
                })}
              </div>
              {genderRetry && (
                <div className="text-xs text-yellow-300">Text je správně, oprav jen rod (der/die/das) a potvrď znovu.</div>
              )}
            </div>
          )}
          <div className="grid gap-2">
            {options.map((opt, i) => (
              <button key={opt}
                      className={`btn ${selected === opt ? 'btn-primary' : 'btn-secondary'} ${eliminated.has(opt) || genderRetry ? 'opacity-40 pointer-events-none' : ''}`}
                      onClick={() => { if (!genderRetry) setSelected(opt); }}>
                <span className="opacity-70 mr-1 text-xs">{i+1}.</span> {opt}
              </button>
            ))}
          </div>
          {!feedback ? (
            <div className="flex gap-2 justify-center">
              <button className="btn btn-primary" disabled={!selected}
                      onClick={async () => {
                        if (!selected) return;
                        const res = await submitAnswer(current.id, selected, currentDir, genderChoice || null);
                        if (!res.correct && res.textCorrect && currentDir === 'cs2de' && current?.partOfSpeech === 'noun' && !genderRetry) {
                          setGenderRetry(true);
                          return;
                        }
                        setFeedback({ correct: !!res.correct, expected: res.expected });
                        setResults((r) => [...r, { id: current.id, correct: !!res.correct, expected: res.expected, your: selected, term: current.term, translation: current.translation, dir: currentDir }]);
                      }}>Potvrdit</button>
              <button className="btn btn-secondary" onClick={() => {
                const wrong = options.filter(o => o !== (currentDir === 'de2cs' ? current!.translation : current!.term) && !eliminated.has(o));
                const toRemove = wrong.slice(0, Math.max(0, Math.min(2, wrong.length)));
                if (!genderRetry) setEliminated(prev => new Set([...Array.from(prev), ...toRemove]));
              }}>Nápověda (50/50)</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`card ${feedback.correct ? 'border-green-700' : 'border-red-700'}`}>
                <div className="card-body">
                  <div className={`text-sm ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {feedback.correct ? 'Správně!' : 'Špatně.'}
                  </div>
                  {!feedback.correct && (
                    <div className="text-sm text-gray-300">Správně: <b>{feedback.expected}</b></div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary" onClick={() => { setFeedback(null); setSelected(null); setIdx((i)=>i+1); }}>Další</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="overlay">
          <div className="confetti-layer">
            {Array.from({ length: 48 }).map((_, i) => (
              <span key={i} className="confetti-piece" style={{
                left: `${(i*2.1)%100}%`,
                backgroundColor: ["#60a5fa","#34d399","#f87171","#fbbf24","#a78bfa"][i%5],
                animationDelay: `${(i%10)*0.12}s`,
                animationDuration: `${1.8 + (i%6)*0.25}s`
              }} />
            ))}
          </div>
          <div className="relative z-10 w-full max-w-3xl space-y-4">
            <div className="text-3xl font-semibold text-center">Hotovo!</div>
            <div className="text-center text-sm text-gray-400">Správně: {results.filter(r=>r.correct).length} / {entries.length}</div>
            {results.some(r=>!r.correct) && (
              <div className="card">
                <div className="card-body space-y-2 max-h-80 overflow-auto">
                  <div className="font-medium">Shrnutí chyb</div>
                  {results.filter(r=>!r.correct).map(r => (
                    <div key={r.id} className="text-sm text-gray-300">
                      {r.dir === 'de2cs' ? (<>
                        <b>{r.term}</b> → {r.expected} <span className="text-red-400">(tvé: {r.your || '—'})</span>
                      </>) : (<>
                        <b>{r.translation}</b> → {r.expected} <span className="text-red-400">(tvé: {r.your || '—'})</span>
                      </>)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <a className="btn btn-secondary" href={`/quiz/${params.id}`}>Zpět na volbu</a>
              <a className="btn btn-primary" href={`/quiz/${params.id}/mc?shuffle=1&dir=${dirParam}`}>Zkusit znovu</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
