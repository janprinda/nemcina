import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUsers, listClassesForUser, listMessages } from "@/server/store";
import PartyWidget from "@/components/PartyWidget";
import { joinByCodeAction, sendMessageAction } from "./actions";

export default async function ClassesPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Prosím přihlas se.</div>;
  const [classes, users] = await Promise.all([listClassesForUser(uid), getUsers()]);
  const c = classes[0];
  const msgs = c ? await listMessages(c.id) : [];
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="card">
        <div className="card-body grid md:grid-cols-2 gap-3">
          <form action={joinByCodeAction} className="space-y-2">
            <div>
              <label className="block text-sm">Připojit se ke třídě (kód)</label>
              <input name="code" className="input" placeholder="Zadej kód třídy" />
            </div>
            <button className="btn btn-primary">Připojit</button>
          </form>
          <div>
            <div className="font-medium">Moje třídy</div>
            <ul className="text-sm mt-1 space-y-1">
              {classes.map(cls => {
                const teacher = users.find(u=>u.id===cls.teacherId);
                const teacherName = teacher?.displayName || teacher?.name || teacher?.email || '—';
                return <li key={cls.id}><b>{cls.name}</b> <span className="muted">(učitel: {teacherName})</span></li>;
              })}
              {classes.length === 0 && <li className="muted">Zatím nejsi v žádné třídě.</li>}
            </ul>
          </div>
        </div>
      </div>
      {c && (
        <div className="card">
          <div className="card-body space-y-3">
            <div className="font-medium">Chat – {c.name}</div>
            <div className="space-y-2 max-h-72 overflow-auto">
              {msgs.map(m=>{
                const u = users.find(u=>u.id===m.userId);
                return <div key={m.id} className="text-sm"><b>{u?.displayName || u?.name || u?.email || '—'}</b>: {m.content} <span className="muted">{new Date(m.createdAt).toLocaleString()}</span></div>;
              })}
              {msgs.length === 0 && <div className="text-sm muted">Zatím žádné zprávy.</div>}
            </div>
            <form action={sendMessageAction.bind(null, c.id)} className="flex gap-2">
              <input className="input flex-1" name="content" placeholder="Napiš zprávu…" />
              <button className="btn btn-primary">Odeslat</button>
            </form>
          </div>
        </div>
      )}
      {c && <PartyWidget classId={c.id} />}
    </div>
  );
}
