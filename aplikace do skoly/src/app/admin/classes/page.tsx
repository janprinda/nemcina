import Link from "next/link";
import { getUsers, listClasses } from "@/server/store";
import { adminCreateClassAction } from "./actions";

export default async function AdminClassesPage() {
  const [classes, users] = await Promise.all([listClasses(), getUsers()]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Třídy</h1>
        <Link className="btn btn-secondary" href="/admin">Zpět</Link>
      </div>

      <form action={adminCreateClassAction} className="card max-w-xl">
        <div className="card-body grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Název třídy</label>
            <input name="name" className="input" placeholder="např. Němčina 7.A" />
          </div>
          <div>
            <label className="block text-sm">Email učitele</label>
            <input name="teacherEmail" className="input" placeholder="teacher@example.com" />
          </div>
          <div className="md:col-span-2"><button className="btn btn-primary">Vytvořit</button></div>
        </div>
      </form>

      <div className="card"><div className="card-body">
        <table className="w-full text-sm align-middle">
          <thead className="muted text-left">
            <tr>
              <th className="py-2 pr-3">Název</th>
              <th className="py-2 pr-3">Učitel</th>
              <th className="py-2 pr-3">Kód</th>
              <th className="py-2 pr-3">Vytvořeno</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => {
              const t = users.find(u => u.id === c.teacherId);
              const teacherName = t?.displayName || t?.name || t?.email || '';
              return (
                <tr key={c.id} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3">{c.name}</td>
                  <td className="py-2 pr-3">{teacherName}</td>
                  <td className="py-2 pr-3">{c.code}</td>
                  <td className="py-2 pr-3">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}

