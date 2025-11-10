import Link from "next/link";
import { getLessons } from "@/server/store";

export default async function HomePage() {
  const lessons = await getLessons();

  return (
    <div className="space-y-8">
      <section className="text-center space-y-1">
        <h1 className="text-3xl font-semibold">Němčina – lekce</h1>
        <p className="text-sm muted">Vyber lekci a začni trénovat.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => (
          <div key={l.id} className="card">
            <div className="card-body">
              <h2 className="font-medium text-gray-100">{l.title}</h2>
              <p className="text-sm muted">{l.description}</p>
              <div className="mt-3 flex gap-3 justify-center">
                <Link className="btn btn-primary" href={`/quiz/${l.id}`}>Spustit kvíz</Link>
                <Link className="btn btn-secondary" href={`/admin/lessons/${l.id}`}>Detail</Link>
              </div>
            </div>
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="text-sm muted text-center">Zatím žádné lekce. Vytvoř je v <Link href="/admin" className="underline">Admin</Link>.</div>
        )}
      </div>
    </div>
  );
}
