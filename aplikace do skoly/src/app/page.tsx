import Link from "next/link";
import { listSubjects } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function SubjectsHomePage() {
  const fromDb = await listSubjects();
  const subjects =
    fromDb.length > 0
      ? fromDb.filter((s) => s.active !== false)
      : [
          {
            slug: "nemcina",
            title: "Němčina",
            description: "Slovíčka, kvízy, třídy a živé aktivity.",
          },
        ];

  return (
    <div className="space-y-8">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-semibold">Předměty</h1>
        <p className="text-sm muted">
          Vyber si předmět, ve kterém chceš procvičovat.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <div key={s.slug} className="card">
            <div className="card-body space-y-2">
              <h2 className="font-medium text-gray-100">{s.title}</h2>
              <p className="text-sm muted">{s.description}</p>
              <div className="mt-3 flex justify-center">
                <Link className="btn btn-primary" href={`/${s.slug}`}>
                  Otevřít
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

