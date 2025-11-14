import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUsers, listClassesForUser } from "@/server/store";
import { joinByCodeAction } from "./actions";
import Link from "next/link";

export default async function ClassesPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Prosím přihlas se.</div>;

  const [classes, users] = await Promise.all([
    listClassesForUser(uid),
    getUsers(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="card">
        <div className="card-body grid md:grid-cols-2 gap-4">
          <form action={joinByCodeAction} className="space-y-2">
            <div>
              <label className="block text-sm">Připojit se ke třídě (kód)</label>
              <input
                name="code"
                className="input"
                placeholder="Zadej kód třídy"
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Připojit
            </button>
          </form>
          <div>
            <div className="font-medium mb-1">Třída</div>
            <div className="text-xs muted mb-1">Vyber si třídu:</div>
            <ul className="text-sm space-y-1">
              {classes.map((cls) => {
                const teacher = users.find((u) => u.id === cls.teacherId);
                const teacherName =
                  teacher?.displayName || teacher?.name || teacher?.email || "Bez učitele";
                return (
                  <li key={cls.id}>
                    <Link
                      href={`/classes/${encodeURIComponent(cls.id)}`}
                      className="inline-flex items-center justify-between w-full rounded px-3 py-2 text-left text-xs md:text-sm border border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--card)]/70"
                    >
                      <span className="font-medium mr-2 truncate">{cls.name}</span>
                      <span className="muted truncate">učitel: {teacherName}</span>
                    </Link>
                  </li>
                );
              })}
              {classes.length === 0 && (
                <li className="muted">Zatím nejsi v žádné třídě.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

