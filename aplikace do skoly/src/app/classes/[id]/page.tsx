import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import {
  getUsers,
  listClassesForUser,
  listMessages,
  listAssignmentsForClass,
} from "@/server/store";
import ClassChat from "@/components/ClassChat";
import CopyCode from "@/components/CopyCode";
import { sendMessageAction } from "../actions";
import Link from "next/link";

export default async function ClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Prosím přihlas se.</div>;

  const [classes, users] = await Promise.all([
    listClassesForUser(uid),
    getUsers(),
  ]);

  const c = classes.find((cls) => cls.id === params.id) || null;
  if (!c) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <p className="text-sm muted">
          Tuto třídu nemáš mezi svými třídami.
        </p>
        <Link className="btn btn-secondary" href="/classes">
          Zpět na výběr tříd
        </Link>
      </div>
    );
  }

  const [msgs, assignments] = await Promise.all([
    listMessages(c.id),
    listAssignmentsForClass(c.id),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{c.name}</h1>
          <div className="text-xs muted">
            Kód třídy: <CopyCode code={c.code} />
          </div>
        </div>
        <Link className="btn btn-secondary" href="/classes">
          Zpět na třídy
        </Link>
      </div>

      <div className="card">
        <div className="card-body space-y-3">
          <div className="font-medium mb-1">Třídní chat</div>
          <ClassChat classId={c.id} users={users as any} />
          <form
            action={sendMessageAction.bind(null, c.id)}
            className="flex gap-2 mt-2"
          >
            <input
              className="input flex-1"
              name="content"
              placeholder="Napiš zprávu..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <button className="btn btn-primary" type="submit">
              Odeslat
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-2">
          <div className="font-medium">Úkoly</div>
          <ul className="text-sm space-y-2 mt-1">
            {assignments.map((a: any) => (
              <li
                key={a.id}
                className="border border-[var(--border)] rounded px-3 py-2 bg-[var(--card)]/60"
              >
                <div className="font-medium">{a.title}</div>
                {a.description && (
                  <div className="muted text-xs mt-0.5">{a.description}</div>
                )}
                {a.dueDate && (
                  <div className="text-xs text-yellow-300 mt-0.5">
                    Termín: {a.dueDate}
                  </div>
                )}
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
