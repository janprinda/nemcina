import { getLessons } from "@/server/store";
import { createLesson, deleteLesson } from "./actions";
import Link from "next/link";

export default async function LessonsAdminPage() {
  const lessons = await getLessons();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Lekce</h1>

      <form action={createLesson} className="card max-w-md">
        <div className="card-body space-y-3">
          <div>
            <label className="block text-sm">Název</label>
            <input name="title" className="w-full rounded border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm">Popis</label>
            <input name="description" className="w-full rounded border px-3 py-2" />
          </div>
          <button className="btn btn-primary">Přidat lekci</button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {lessons.map((l) => (
          <div key={l.id} className="card">
            <div className="card-body space-y-2">
              <div className="font-medium text-gray-100">{l.title}</div>
              <div className="text-sm text-gray-400">{l.description}</div>
              <div className="flex gap-3 text-sm">
                <Link className="btn btn-secondary" href={`/admin/lessons/${l.id}`}>Upravit/slovíčka</Link>
              <form action={async () => { "use server"; await deleteLesson(l.id); }}>
                <button className="btn btn-ghost text-red-400" type="submit">Smazat</button>
              </form>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
