"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitAnswer } from "../actions";

type Entry = { id: string; term: string; translation: string; explanation?: string | null; partOfSpeech?: string | null; genders?: ('der'|'die'|'das')[]|null };

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
  const dirParam = (search.get('dir') as 'de2cs'|'cs2de'|'mix' | null) || 'de2cs';
  const shuffleParam = search.get('shuffle') === '1';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { correct: boolean; expected: string }>(null);
  const [genderChoice, setGenderChoice] = useState<''|'der'|'die'|'das'>('');
  const [genderRetry, setGenderRetry] = useState(false);
  const [hintLevel, setHintLevel] = useState<0|1|2>(0);
  const [dirs, setDirs] = useState<Array<'de2cs'|'cs2de'>>([]);
  const [results, setResults] = useState<Array<{ id: string; correct: boolean; expected: string; your: string; term: string; translation: string; dir: 'de2cs'|'cs2de' }>>([]);

  useEffect(() => {
    fetchEntries(params.id).then((list) => {
      const base = shuffleParam ? shuffle(list) : list;
      const d = base.map(() => dirParam === 'mix' ? (Math.random() < 0.5 ? 'de2cs' : 'cs2de') : dirParam);
      setEntries(base);
      setDirs(d);
    });
  }, [params.id, dirParam, shuffleParam]);

  // Reset noun gender UI when moving between items or directions
  // Depend on idx and dirs (the array that determines direction per item)
  useEffect(() => { setGenderChoice(''); setGenderRetry(false); }, [idx, dirs]);

  const current = entries[idx];
  const done = idx >= entries.length;
  const currentDir = dirs[idx] || 'de2cs';
  const prompt = currentDir === 'de2cs' ? 'Přelož do češtiny' : 'Přelož do němčiny';
  const shownBase = currentDir === 'de2cs' ? current?.term : current?.translation;
  const shown = (currentDir === 'de2cs' && current?.partOfSpeech === 'noun' && current?.genders?.length)
    ? `${current.genders!.join('/')} ${shownBase}`
    : shownBase;
  const expectedNow = current ? (currentDir === 'de2cs' ? current.translation : current.term) : '';
  const hint = useMemo(() => {
    if (!expectedNow) return '';
    if (hintLevel === 1) return expectedNow.slice(0, Math.max(1, Math.ceil(expectedNow.length*0.35))) + '…';
    if (hintLevel === 2) return expectedNow;
    return '';
  }, [expectedNow, hintLevel]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 text-center">
      {/* Keyboard: Enter submits or goes next */}
      <div className="hidden" aria-hidden="true" onKeyDownCapture={(e) => {
        if (e.key !== 'Enter') return;
        if (!done && !feedback) {
          e.preventDefault();
          (async () => {
            const res = await submitAnswer(current.id, answer, currentDir);
            setFeedback({ correct: !!res.correct, expected: res.expected });
            setResults((r) => [...r, { id: current.id, correct: !!res.correct, expected: res.expected, your: answer, term: current.term, translation: current.translation, dir: currentDir }]);
          })();
        } else if (!done && feedback) {
          e.preventDefault(); setFeedback(null); setAnswer(""); setIdx((i)=>i+1);
        }
      }} />
      {!entries.length ? (
        <div>Načítám… nebo v lekci nejsou slovíčka.</div>
      ) : !done ? (
        <>
          <div className="text-sm text-gray-400">{idx + 1} / {entries.length}</div>
          <div className="card"><div className="card-body">
            <div className="muted text-sm">{prompt}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-100">{shown}</div>
          </div></div>
          {/* Gender selection for nouns */}
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
            </div>
          )}
          <div className="text-xs muted text-left">Tip: ß lze psát jako "ss". Více překladů piš odděleně "," nebo ";".</div>
          <input className="w-full px-3 py-2" placeholder="Tvoje odpověď"
                  value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!feedback) {
                        (async () => {
                          const res = await submitAnswer(current.id, answer, currentDir, genderChoice || null);
                          if (!res.correct && res.textCorrect && currentDir === 'cs2de' && current?.partOfSpeech === 'noun' && !genderRetry) {
                            setGenderRetry(true);
                            return;
                          }
                          setFeedback({ correct: !!res.correct, expected: res.expected });
                          setResults((r) => [...r, { id: current.id, correct: !!res.correct, expected: res.expected, your: answer, term: current.term, translation: current.translation, dir: currentDir }]);
                        })();
                      } else {
                        setFeedback(null); setAnswer(""); setIdx((i)=>i+1);
                      }
                    }
                  }} />
          {!feedback ? (
            <div className="flex gap-2 justify-center">
              <button className="btn btn-primary"
                onClick={async () => {
                  const res = await submitAnswer(current.id, answer, currentDir, genderChoice || null);
                  if (!res.correct && res.textCorrect && currentDir === 'cs2de' && current?.partOfSpeech === 'noun' && !genderRetry) {
                    setGenderRetry(true);
                    return;
                  }
                  setFeedback({ correct: !!res.correct, expected: res.expected });
                  setResults((r) => [...r, { id: current.id, correct: !!res.correct, expected: res.expected, your: answer, term: current.term, translation: current.translation, dir: currentDir }]);
                }}>Odeslat</button>
              <button className="btn btn-secondary" onClick={() => setHintLevel(h => Math.min(2, (h+1)) as 0|1|2)}>Nápověda</button>
            </div>
          ) : null}
          {feedback && (
            <FeedbackPanel
              correct={feedback.correct}
              expected={feedback.expected}
              yourAnswer={answer}
              explanation={current?.explanation || null}
              expectedGenders={current?.genders ?? null}
              chosenGender={genderChoice || null}
              onNext={() => { setFeedback(null); setAnswer(""); setHintLevel(0); setIdx((i)=>i+1); }}
              onRetry={!feedback.correct ? () => { setFeedback(null); setHintLevel(0); setAnswer(""); } : undefined}
            />
          )}
          {genderRetry && (
            <div className="text-xs text-yellow-300 mt-2">Text je správně, oprav jen rod (der/die/das) a odešli znovu.</div>
          )}
          {hint && !feedback && (
            <div className="text-sm muted">Nápověda: <span className="text-gray-200">{hint}</span></div>
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
              <a className="btn btn-primary" href={`/quiz/${params.id}/write?shuffle=1&dir=${dirParam}`}>Zkusit znovu</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackPanel({ correct, expected, yourAnswer, explanation, expectedGenders, chosenGender, onNext, onRetry }: { correct: boolean; expected: string; yourAnswer: string; explanation: string | null; expectedGenders?: ('der'|'die'|'das')[]|null; chosenGender?: 'der'|'die'|'das'|null; onNext: () => void; onRetry?: () => void }) {
  const notes = computeMinorNotes(yourAnswer, expected);
  return (
    <div className={`mt-3 text-left ${correct ? 'border border-green-700' : 'border border-red-700'} rounded` }>
      <div className="p-4 space-y-2">
        <div className={`text-sm ${correct ? 'text-green-400' : 'text-red-400'}`}>{correct ? 'Správně' : 'Špatně'}</div>
        {!correct && (
          <div className="text-sm text-gray-300">Správná odpověď: <b>{expected}</b></div>
        )}
        {expectedGenders && expectedGenders.length > 0 && (
          <div className="text-xs muted flex items-center gap-2">
            <span>Rod:</span>
            {expectedGenders.map((g)=>(<span key={g} className={`chip chip-${g}`}>{g}</span>))}
            {chosenGender && !expectedGenders.includes(chosenGender) && (
              <span className="text-red-400">(tvůj výběr: {chosenGender})</span>
            )}
          </div>
        )}
        {notes.length > 0 && (
          <ul className="text-xs muted list-disc pl-5 space-y-1">
            {notes.map((n, i) => (<li key={i}>{n}</li>))}
          </ul>
        )}
        {(!correct && explanation) && (
          <div className="text-xs muted">Vysvětlení: {explanation}</div>
        )}
        <div className="flex gap-2 pt-2">
          <button className="btn btn-secondary" onClick={onNext}>Další</button>
          {onRetry && <button className="btn btn-ghost" onClick={onRetry}>Zkusit znovu</button>}
        </div>
      </div>
    </div>
  );
}

function computeMinorNotes(answer: string, expected: string): string[] {
  const notes: string[] = [];
  const a = answer.trim();
  const e = expected.trim();
  if (!a) return notes;
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const noDiaEqual = normalize(a) === normalize(e);
  if (noDiaEqual && a !== e) {
    // Differences may be diacritics, case or spacing
    if (a.toLowerCase() === e.toLowerCase() && a !== e) notes.push('Poznámka: velká/malá písmena.');
    const collapse = (s: string) => s.replace(/\s+/g, ' ');
    if (collapse(a) === collapse(e) && a !== e) notes.push('Poznámka: mezery nebo diakritika.');
    if (a.normalize('NFD').replace(/[\u0300-\u036f]/g, '') !== e.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
      // if after removing diacritics still differs, likely punctuation/order
    } else {
      notes.push('Pozor na diakritiku (háčky/čárky).');
    }
  }
  // punctuation hint
  const stripPunct = (s: string) => s.replace(/[.,!?:;\-]/g, '');
  if (stripPunct(a).toLowerCase() === stripPunct(e).toLowerCase() && a !== e) {
    notes.push('Interpunkce se nehodnotí, ale zkus ji psát správně.');
  }
  return Array.from(new Set(notes));
}
