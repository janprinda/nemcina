import Link from "next/link";
import { getEntryById } from "@/server/store";
import PosGenderControls from "@/components/PosGenderControls";
import { updateEntryAction, deleteEntryAction } from "./actions";

export default async function EditEntryPage({ params }: { params: { id: string; entryId: string } }) {
  const entry = await getEntryById(params.entryId);
  if (!entry) return <div>Položka nenalezena</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Upravit položku</h1>
        <Link className="btn btn-ghost" href={`/admin/lessons/${params.id}`}>Zpět na lekci</Link>
      </div>

      <form action={updateEntryAction.bind(null, params.id, params.entryId)} className="card max-w-xl">
        <div className="card-body space-y-3">
          <div>
            <label className="block text-sm">DE (slovo/fráze)</label>
            <input name="term" defaultValue={entry.term} className="w-full px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm">CS (překlad)</label>
            <input name="translation" defaultValue={entry.translation} className="w-full px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm">Vysvětlení (volit.)</label>
            <textarea name="explanation" defaultValue={entry.explanation ?? ''} className="w-full px-3 py-2" />
          </div>
          <PosGenderControls defaultPos={entry.partOfSpeech ?? ''} defaultGenders={entry.genders ?? []} defaultType={entry.type} />
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">Uložit</button>
            <button className="btn btn-ghost text-red-400" formAction={deleteEntryAction.bind(null, params.id, params.entryId)} type="submit">Smazat</button>
          </div>
        </div>
      </form>
    </div>
  );
}
