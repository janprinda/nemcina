import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import {
  createClassAction,
  regenerateCodeAction,
  sendClassMessageAction,
  updateCooldownAction,
  renameClassAction,
} from "./actions";
import {
  getUsers,
  listClassMembers,
  listClassesForUser,
  listMessages,
  listAssignmentsForClass,
} from "@/server/store";
import CopyCode from "@/components/CopyCode";
import ClassChat from "@/components/ClassChat";
import Link from "next/link";

export default async function TeacherClassPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Prosím přihlas se.</div>;

  const myClasses = await listClassesForUser(uid);
  const users = await getUsers();
  const c = myClasses.find((x: any) => x.teacherId === uid) || null;

  if (!c) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">Učitelská třída</h1>
        <form action={createClassAction} className="card">
          <div className="card-body space-y-3">
            <div>
              <label className="block text-sm">Název třídy</label>
              <input
                className="input"
                name="name"
                placeholder="např. Němčina 7.A"
              />
            </div>
            <button className="btn btn-primary">Vytvořit třídu</button>
          </div>
        </form>
      </div>
    );
  }

  const members = await listClassMembers(c.id);
  const msgs = await listMessages(c.id);
  const assignments = await listAssignmentsForClass(c.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold">Učitelská třída</h1>

      {/* Základní informace o třídě */}
      <div className="card">
        <div className="card-body flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
          <form
            action={renameClassAction.bind(null, c.id)}
            className="space-y-1 max-w-sm"
          >
            <label className="block text-xs muted">Název třídy</label>
            <input
              name="name"
              defaultValue={c.name}
              className="input"
              placeholder="Název třídy"
            />
            <div className="text-xs muted mt-1">
              Kód pro připojení: <CopyCode code={c.code} />
            </div>
          </form>
          <form
            action={updateCooldownAction.bind(null, c.id)}
            className="flex items-center gap-2"
          >
            <label className="text-sm">Cooldown chatu (s)</label>
            <input
              name="chatCooldownSec"
              className="input w-24"
              type="number"
              min={0}
              max={600}
              defaultValue={c.chatCooldownSec ?? 0}
            />
            <button className="btn btn-ghost" type="submit">
              Uložit
            </button>
          </form>
          <form action={regenerateCodeAction.bind(null, c.id)}>
            <button className="btn btn-secondary" type="submit">
              Obnovit kód
            </button>
          </form>
        </div>
      </div>

      {/* Členové třídy */}
      <div className="card">
        <div className="card-body space-y-3">
          <div className="font-medium">Členové třídy</div>
          <div className="space-y-2 text-sm">
            {members.length === 0 && (
              <div className="text-sm muted">Zatím žádní členové.</div>
            )}
            {members.map((m: any) => {
              const u = users.find((u: any) => u.id === m.userId);
              const name =
                u?.displayName || u?.name || u?.email || "Bez jména";
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    {u ? (
                      <Link
                        href={`/teacher/student/${u.id}`}
                        className="underline hover:text-[var(--accent)]"
                      >
                        {name}
                      </Link>
                    ) : (
                      "Bez jména"
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="muted text-xs">{m.role}</span>
                    {m.role === "STUDENT" && (
                      <form
                        action={async () => {
                          "use server";
                          const { removeMember } = await import("@/server/store");
                          await removeMember(m.id);
                        }}
                      >
                        <button
                          className="btn btn-ghost text-red-400"
                          type="submit"
                        >
                          Vyhodit
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Třídní chat */}
      <div className="card">
        <div className="card-body space-y-3">
          <div className="font-medium">Třídní chat</div>
          <ClassChat classId={c.id} users={users as any} hideAvatars />
          <form
            action={sendClassMessageAction.bind(null, c.id)}
            className="flex gap-2"
          >
            <input
              className="input flex-1"
              name="content"
              placeholder="Napiš zprávu…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <input
              type="hidden"
              name="cooldownHint"
              value={String(c.chatCooldownSec ?? 0)}
            />
            <button className="btn btn-primary" type="submit">
              Odeslat
            </button>
          </form>
        </div>
      </div>

      {/* Úkoly */}
      <div className="card">
        <div className="card-body space-y-3">
          <div className="font-medium">Úkoly</div>
          <form
            action={async (formData: FormData) => {
              "use server";
              const { createAssignment } = await import("@/server/store");
              const title = String(formData.get("title") || "").trim();
              const description =
                String(formData.get("description") || "").trim() || null;
              const dueDate =
                String(formData.get("dueDate") || "").trim() || null;
              if (!title) return;
              await createAssignment(c.id, { title, description, dueDate });
            }}
            className="grid md:grid-cols-3 gap-2 items-end"
          >
            <div className="md:col-span-1">
              <label className="block text-sm">Název úkolu</label>
              <input
                name="title"
                className="input"
                placeholder="např. Slovíčka lekce 3"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm">Popis</label>
              <input
                name="description"
                className="input"
                placeholder="krátký popis"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm">Termín</label>
              <input name="dueDate" type="date" className="input" />
            </div>
            <div className="md:col-span-3">
              <button className="btn btn-primary" type="submit">
                Přidat úkol
              </button>
            </div>
          </form>

          <ul className="text-sm space-y-2 mt-2">
            {assignments.map((a: any) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 border border-[var(--border)] rounded px-3 py-2 bg-[var(--card)]/60"
              >
                <div>
                  <div className="font-medium">{a.title}</div>
                  {a.description && (
                    <div className="muted text-xs mt-0.5">{a.description}</div>
                  )}
                  {a.dueDate && (
                    <div className="text-xs text-yellow-300 mt-0.5">
                      Termín: {a.dueDate}
                    </div>
                  )}
                </div>
                <form
                  action={async () => {
                    "use server";
                    const { deleteAssignment } = await import("@/server/store");
                    await deleteAssignment(a.id);
                  }}
                >
                  <button
                    type="submit"
                    className="btn btn-ghost text-red-400 whitespace-nowrap"
                  >
                    Smazat
                  </button>
                </form>
              </li>
            ))}
            {assignments.length === 0 && (
              <li className="muted text-sm">Zatím žádné úkoly.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
