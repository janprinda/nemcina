import Link from "next/link";
import { getUsers, listTeacherCodes } from "@/server/store";
import { deleteCodeAction, generateAction, updateNoteAction, deleteCodesAction } from "./actions";
import CopyCode from "@/components/CopyCode";
import TableSelectAll from "@/components/TableSelectAll";

export default async function TeacherCodesPage({ searchParams }: { searchParams?: { status?: string; q?: string } }) {
  const [codes, users] = await Promise.all([listTeacherCodes(), getUsers()]);
  const status = (searchParams?.status || 'all').toLowerCase();
  const q = (searchParams?.q || '').toLowerCase();
  const filtered = codes.filter(c => {
    if (status === 'active' && !c.activated) return false;
    if (status === 'inactive' && c.activated) return false;
    if (q) {
      const teacher = users.find(u => u.id === c.activatedBy);
      const teacherName = teacher?.displayName || teacher?.name || teacher?.email || '';
      const hay = `${c.code} ${c.note||''} ${teacherName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kódy pro učitele</h1>
        <Link className="btn btn-secondary" href="/admin">Zpět</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form action={generateAction} className="card">
          <div className="card-body space-y-3">
            <div>
              <label className="block text-sm">Počet kódů</label>
              <input name="count" type="number" min={1} max={50} defaultValue={5} className="input input-lg" />
            </div>
            <button className="btn btn-primary">Vygenerovat</button>
          </div>
        </form>
        <form method="get" className="card">
          <div className="card-body grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm">Filtr stavu</label>
              <select name="status" defaultValue={status} className="select select-lg">
                <option value="all">Vše</option>
                <option value="active">Aktivované</option>
                <option value="inactive">Neaktivované</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Hledat</label>
              <input name="q" defaultValue={q} className="input input-lg" placeholder="kód, poznámka, učitel" />
            </div>
            <div className="md:col-span-2"><button className="btn btn-secondary">Aplikovat</button></div>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="w-full text-sm align-middle">
            <thead className="muted text-left">
              <tr>
                <th className="py-2 pr-3"><TableSelectAll /></th>
                <th className="py-2 pr-3">Kód</th>
                <th className="py-2 pr-3">Učitel</th>
                <th className="py-2 pr-3">Poznámka</th>
                <th className="py-2 pr-3">Stav</th>
                <th className="py-2 pr-3">Čas</th>
                <th className="py-2">Akce</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const teacher = users.find(u => u.id === c.activatedBy);
                const teacherName = teacher?.displayName || teacher?.name || teacher?.email || '';
                const statusEl = c.activated ? <b className="text-green-400">Aktivován</b> : <b className="text-red-400">Neaktivován</b>;
                return (
                  <tr key={c.id} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3"><input type="checkbox" name="ids" value={c.id} form="bulkDeleteForm" /></td>
                    <td className="py-2 pr-3"><CopyCode code={c.code} className="font-mono" /></td>
                    <td className="py-2 pr-3">{teacherName || '—'}</td>
                    <td className="py-2 pr-3">
                      <form action={updateNoteAction.bind(null, c.id)} className="flex items-center gap-2">
                        <input name="note" defaultValue={c.note||''} className="input" />
                        <button className="btn btn-secondary">Uložit</button>
                      </form>
                    </td>
                    <td className="py-2 pr-3">{statusEl}</td>
                    <td className="py-2 pr-3">{c.activatedAt ? <span>{new Date(c.activatedAt).toLocaleString()}</span> : '—'}</td>
                    <td className="py-2">
                      <form action={deleteCodeAction.bind(null, c.id)}><button className="btn btn-ghost text-red-400">Smazat</button></form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <form id="bulkDeleteForm" action={deleteCodesAction} className="mt-3">
            <button className="btn btn-ghost text-red-400" type="submit">Smazat vybrané</button>
          </form>

          <div className="mt-4 flex gap-2">
            <Link className="btn btn-secondary" href="/api/admin/teacher-codes/export-csv">Exportovat CSV</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

