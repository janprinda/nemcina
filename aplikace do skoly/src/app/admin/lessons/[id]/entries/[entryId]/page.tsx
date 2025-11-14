import Link from "next/link";
import { getEntryById } from "@/server/store";
import PosGenderControls from "@/components/PosGenderControls";
import EntryScoringControls from "@/components/EntryScoringControls";
import SynonymInputs from "@/components/SynonymInputs";
import { updateEntryAction, deleteEntryAction } from "./actions";

export default async function EditEntryPage({
  params,
}: {
  params: { id: string; entryId: string };
}) {
  const entry = await getEntryById(params.entryId);
  if (!entry) return <div>Položka nenalezena</div>;

  const termSynonyms = entry.termSynonyms ?? [];
  const translationSynonyms = entry.translationSynonyms ?? [];
  const pluralDisplay = (entry.plural || "").replace(/^-/, "");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Upravit položku</h1>
        <Link className="btn btn-ghost" href={`/admin/lessons/${params.id}`}>
          Zpět na lekci
        </Link>
      </div>

      <form
        action={updateEntryAction.bind(null, params.id, params.entryId)}
        className="card max-w-xl"
      >
        <div className="card-body space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">DE (slovo/fráze)</label>
              <input
                name="term"
                defaultValue={entry.term}
                className="w-full px-3 py-2 input"
                required
              />
              <SynonymInputs
                name="termSynonyms"
                initial={termSynonyms}
                label="Synonyma v němčině"
                placeholder="Další varianta"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">CS (překlad)</label>
              <input
                name="translation"
                defaultValue={entry.translation}
                className="w-full px-3 py-2 input"
                required
              />
              <SynonymInputs
                name="translationSynonyms"
                initial={translationSynonyms}
                label="Synonyma v češtině"
                placeholder="Další varianta"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Vysvětlení (volitelné)</label>
            <textarea
              name="explanation"
              defaultValue={entry.explanation ?? ""}
              className="w-full px-3 py-2 input"
            />
          </div>

          <PosGenderControls
            defaultPos={entry.partOfSpeech ?? ""}
            defaultGenders={entry.genders ?? []}
            defaultType={entry.type}
            defaultVerbClass={entry.verbClass ?? null}
            defaultPlural={pluralDisplay || null}
          />

          <EntryScoringControls
            defaultCorrect={entry.pointsCorrect ?? null}
            defaultPartial={entry.pointsPartial ?? null}
            defaultWrong={entry.pointsWrong ?? null}
          />

          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">
              Uložit
            </button>
            <button
              className="btn btn-ghost text-red-400"
              formAction={deleteEntryAction.bind(
                null,
                params.id,
                params.entryId
              )}
              type="submit"
            >
              Smazat
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

