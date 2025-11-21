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
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Třída</h1>
        <p className="text-sm muted">
          Připoj se do třídy pomocí kódu a pak si vyber, ve které třídě chceš pracovat.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Připojení pomocí kódu */}
        <div className="card">
          <div className="card-body space-y-3">
            <div>
              <div className="font-medium">Připojit se do třídy</div>
              <div className="text-xs muted">
                Zadej kód třídy, který ti dal učitel.
              </div>
            </div>
            <form action={joinByCodeAction} className="space-y-2">
              <div>
                <label className="block text-sm">Kód třídy</label>
                <input
                  name="code"
                  className="input"
                  placeholder="např. AB12CD"
                />
              </div>
              <button className="btn btn-primary w-full md:w-auto" type="submit">
                Připojit
              </button>
            </form>
          </div>
        </div>

        {/* Výběr třídy */}
        <div className="card">
          <div className="card-body space-y-3">
            <div>
              <div className="font-medium">Moje třídy</div>
              <div className="text-xs muted">
                Vyber si třídu, do které chceš vstoupit.
              </div>
            </div>
            <ul className="text-sm space-y-2">
              {classes.map((cls) => {
                const teacher = users.find((u) => u.id === cls.teacherId);
                const teacherName =
                  teacher?.displayName || teacher?.name || teacher?.email || "Bez učitele";
                return (
                  <li key={cls.id}>
                    <Link
                      href={`/classes/${encodeURIComponent(cls.id)}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)]"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{cls.name}</div>
                        <div className="text-[11px] muted truncate">
                          Učitel: {teacherName}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
              {classes.length === 0 && (
                <li className="muted text-xs">
                  Zatím nejsi v žádné třídě. Použij kód od učitele a připoj se.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

