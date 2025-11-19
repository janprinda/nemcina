import { listSubjects } from "@/server/store";
import { createSubjectAction, updateSubjectAction, deleteSubjectAction } from "./actions";
import Link from "next/link";

export default async function AdminSubjectsPage() {
  const subjects = await listSubjects();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Předměty</h1>

      <form action={createSubjectAction} className="card max-w-xl">
        <div className="card-body space-y-3">
          <div className="text-sm muted">
            Vytvoř nový předmět (např. Němčina, Matematika...). Slug je část
            URL, např. <code>nemcina</code> → <code>/nemcina</code>.
          </div>
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm">Slug</label>
              <input
                name="slug"
                className="input"
                placeholder="např. nemcina"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Název</label>
              <input
                name="title"
                className="input"
                placeholder="např. Němčina"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm">Popis</label>
              <input
                name="description"
                className="input"
                placeholder="krátký popis předmětu"
              />
            </div>
          </div>
          <button className="btn btn-primary mt-2">Přidat předmět</button>
        </div>
      </form>

      <div className="card">
        <div className="card-body overflow-x-auto">
          {subjects.length === 0 ? (
            <div className="muted text-sm">
              Zatím žádné předměty. Vytvoř první nahoře.
            </div>
          ) : (
            <table className="w-full min-w-[640px] text-sm align-middle">
              <thead className="muted text-left">
                <tr>
                  <th className="py-2 pr-3">Slug</th>
                  <th className="py-2 pr-3">Název</th>
                  <th className="py-2 pr-3">Popis</th>
                  <th className="py-2 pr-3">Aktivní</th>
                  <th className="py-2">Akce</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-[var(--border)] align-top"
                  >
                    <td className="py-2 pr-3 font-mono text-xs">{s.slug}</td>
                    <td className="py-2 pr-3">
                      <form action={updateSubjectAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input
                          name="title"
                          defaultValue={s.title}
                          className="input"
                        />
                      </form>
                    </td>
                    <td className="py-2 pr-3">
                      <form action={updateSubjectAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input
                          name="description"
                          defaultValue={s.description || ""}
                          className="input"
                        />
                      </form>
                    </td>
                    <td className="py-2 pr-3">
                      <form
                        action={updateSubjectAction}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={s.id} />
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={s.active !== false}
                          className="checkbox"
                        />
                        <span className="text-xs muted">viditelný</span>
                      </form>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${s.slug}`}
                          className="btn btn-ghost text-xs"
                        >
                          Otevřít
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteSubjectAction(s.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="btn btn-ghost text-red-400 text-xs whitespace-nowrap"
                          >
                            Smazat
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

