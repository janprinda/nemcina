import Link from "next/link";

export default function QuizModePicker({ params }: { params: { id: string } }) {
  const id = params.id;
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Zvol režim kvízu</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card"><div className="card-body space-y-2">
          <div className="font-medium text-gray-100">Psaní odpovědi</div>
          <p className="text-sm text-gray-400">Toleruje háčky/čárky, volba směru i mix.</p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-primary" href={`/quiz/${id}/write?shuffle=1&dir=de2cs`}>DE → CS</Link>
            <Link className="btn btn-secondary" href={`/quiz/${id}/write?shuffle=1&dir=cs2de`}>CS → DE</Link>
            <Link className="btn btn-ghost" href={`/quiz/${id}/write?shuffle=1&dir=mix`}>Mix</Link>
          </div>
        </div></div>
        <div className="card"><div className="card-body space-y-2">
          <div className="font-medium text-gray-100">Multiple‑choice</div>
          <p className="text-sm text-gray-400">Možnosti se míchají, volba směru i mix.</p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-primary" href={`/quiz/${id}/mc?shuffle=1&dir=de2cs`}>DE → CS</Link>
            <Link className="btn btn-secondary" href={`/quiz/${id}/mc?shuffle=1&dir=cs2de`}>CS → DE</Link>
            <Link className="btn btn-ghost" href={`/quiz/${id}/mc?shuffle=1&dir=mix`}>Mix</Link>
          </div>
        </div></div>
      </div>
      <div>
        <Link href={`/admin/lessons/${id}`} className="btn btn-ghost">Správa slovíček</Link>
      </div>
    </div>
  );
}
