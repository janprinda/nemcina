import { getLesson, getEntries } from "@/server/store";
import { addEntry, deleteEntry, updateLessonAction } from "./actions";
import Link from "next/link";
import PosGenderControls from "@/components/PosGenderControls";
import EntryScoringControls from "@/components/EntryScoringControls";
import SynonymInputs from "@/components/SynonymInputs";

export default async function LessonDetail({
  params,
}: {
  params: { id: string };
}) {
  const lesson = await getLesson(params.id);
  const entries = lesson ? await getEntries(lesson.id) : [];
  if (!lesson) return <div>Lekce nenalezena</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{lesson.title}</h1>
        <Link className="text-sm" href={`/quiz/${lesson.id}`}>
          Spustit kvíz
        </Link>
      </div>

      <form
        action={updateLessonAction.bind(null, lesson.id)}
        className="card w-full"
      >
        <div className="card-body grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="block text-sm">Název lekce</label>
            <input
              name="title"
              defaultValue={lesson.title}
              className="w-full px-3 py-2 input"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm">Popis</label>
            <input
              name="description"
              defaultValue={lesson.description ?? ""}
              className="w-full px-3 py-2 input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm">
              Body pro odemknutí (progress do další lekce)
            </label>
            <input
              name="unlockScore"
              type="number"
              defaultValue={lesson.unlockScore ?? ""}
              className="w-full px-3 py-2 input"
              placeholder="např. 100"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="btn btn-secondary">Uložit změny lekce</button>
          </div>
        </div>
      </form>

      <form action={addEntry.bind(null, lesson.id)} className="card w-full">
        <div className="card-body space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">DE (slovo/fráze)</label>
              <input
                name="term"
                className="w-full px-3 py-2 input"
                required
              />
              <SynonymInputs
                name="termSynonyms"
                label="Synonyma v němčině"
                placeholder="Další varianta"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">CS (překlad)</label>
              <input
                name="translation"
                className="w-full px-3 py-2 input"
                required
              />
              <SynonymInputs
                name="translationSynonyms"
                label="Synonyma v češtině"
                placeholder="Další varianta"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Vysvětlení (volitelné)</label>
            <textarea
              name="explanation"
              className="w-full px-3 py-2 input"
              placeholder="Krátké vysvětlení, např. gramatická poznámka"
            ></textarea>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PosGenderControls />
            <EntryScoringControls />
          </div>

          <button className="btn btn-primary">Přidat položku</button>
        </div>
      </form>

      <div className="grid gap-2">
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between card p-3 text-sm gap-2"
          >
            <div>
              <div className="font-medium text-gray-100">{e.term}</div>
              <div className="text-gray-400">{e.translation}</div>
              {(e.termSynonyms?.length || e.translationSynonyms?.length) && (
                <div className="text-xs muted mt-1">
                  {e.termSynonyms?.length ? (
                    <span>DE synonyma: {e.termSynonyms.join(", ")}</span>
                  ) : null}
                  {e.translationSynonyms?.length ? (
                    <span className="ml-2">
                      CS synonyma: {e.translationSynonyms.join(", ")}
                    </span>
                  ) : null}
                </div>
              )}
              <div className="text-xs muted mt-1 flex flex-wrap gap-2 items-center">
                {e.partOfSpeech && (
                  <span className="chip">{e.partOfSpeech}</span>
                )}
                {e.genders?.map((g) => (
                  <span key={g} className={`text-${g}`}>
                    {g}
                  </span>
                ))}
                {e.plural && <span>Pl.: {e.plural}</span>}
                {e.verbClass && (
                  <span>
                    Sloveso:{" "}
                    {e.verbClass === "regular" ? "pravidelné" : "nepravidelné"}
                  </span>
                )}
                {(e.pointsCorrect ?? null) !== null && (
                  <span>✓ {e.pointsCorrect} b</span>
                )}
                {(e.pointsPartial ?? null) !== null && (
                  <span>≈ {e.pointsPartial} b</span>
                )}
                {(e.pointsWrong ?? null) !== null && (
                  <span>✗ {e.pointsWrong} b</span>
                )}
              </div>
              {e.explanation && (
                <div className="text-xs muted mt-1">{e.explanation}</div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Link
                className="btn btn-secondary"
                href={`/admin/lessons/${lesson.id}/entries/${e.id}`}
              >
                Upravit
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteEntry(lesson.id, e.id);
                }}
              >
                <button className="btn btn-ghost text-red-400">Smazat</button>
              </form>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-sm text-gray-400">Zatím žádná slovíčka.</div>
        )}
      </div>
    </div>
  );
}

