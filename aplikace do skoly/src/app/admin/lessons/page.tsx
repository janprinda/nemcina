import { getLessons } from "@/server/store";
import { createLesson, deleteLesson, publishLesson, unpublishLesson } from "./actions";
import Link from "next/link";

export default async function LessonsAdminPage() {
  const lessons = await getLessons();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Lekce</h1>

      <form action={createLesson} className="card max-w-lg">
        <div className="card-body space-y-4">
          <div>
            <label className="block text-sm">Název</label>
            <input name="title" className="input" required />
          </div>
          <div>
            <label className="block text-sm">Popis</label>
            <input name="description" className="input" />
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
              <div className="text-xs muted">Stav: {l.published ? 'Publikováno' : 'Koncept'}</div>
              <div className="mt-2 flex flex-wrap gap-3 items-center">
                <Link className="btn btn-secondary" href={`/admin/lessons/${l.id}`}>Upravit/slovíčka</Link>
                {l.published ? (
                  <form action={async () => { "use server"; await unpublishLesson(l.id); }}>
                    <button className="btn btn-ghost" type="submit">Skrýt</button>
                  </form>
                ) : (
                  <form action={async () => { "use server"; await publishLesson(l.id); }}>
                    <button className="btn btn-primary" type="submit">Publikovat</button>
                  </form>
                )}
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

