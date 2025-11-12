import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createClassAction, regenerateCodeAction, sendClassMessageAction } from "./actions";
import { getUsers, listClassMembers, listClassesForUser, listMessages, getLessons } from "@/server/store";
import PartyWidget from "@/components/PartyWidget";
import CopyCode from "@/components/CopyCode";

export default async function TeacherClassPage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Prosím přihlas se.</div>;
  const myClasses = await listClassesForUser(uid);
  const users = await getUsers();
  const c = myClasses.find(x => x.teacherId === uid) || null;
  if (!c) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-semibold">Třída učitele</h1>
        <form action={createClassAction} className="card">
          <div className="card-body space-y-3">
            <div>
              <label className="block text-sm">Název třídy</label>
              <input className="input" name="name" placeholder="např. Němčina 7.A" />
            </div>
            <button className="btn btn-primary">Vytvořit třídu</button>
          </div>
        </form>
      </div>
    );
  }
  const members = await listClassMembers(c.id);
  const msgs = await listMessages(c.id);
  const lessons = await getLessons();
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="card">
        <div className="card-body flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-100">{c.name}</div>
            <div className="text-sm muted">Kód pro připojení: <CopyCode code={c.code} /></div>
          </div>
          <form action={regenerateCodeAction.bind(null, c.id)}><button className="btn btn-secondary">Obnovit kód</button></form>
        </div>
      </div>
      {/* Start activity */}
      <div className="card">
        <div className="card-body grid md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm">Lekce</label>
            <select id="party_lesson" className="select w-full">
              {lessons.map((l:any) => (<option key={l.id} value={l.id}>{l.title}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Režim</label>
            <select id="party_mode" className="select w-full">
              <option value="mc">Rozhodovačka</option>
              <option value="write">Psaní</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Čas (s)</label>
            <input id="party_timer" className="input" type="number" min={5} max={120} defaultValue={30} />
          </div>
          <div className="md:col-span-4">
            <button className="btn btn-primary" onClick={async(e)=>{
              e.preventDefault();
              const lessonId = (document.getElementById('party_lesson') as HTMLSelectElement)?.value;
              const mode = (document.getElementById('party_mode') as HTMLSelectElement)?.value;
              const timerSec = parseInt((document.getElementById('party_timer') as HTMLInputElement)?.value||'30',10);
              await fetch('/api/party/create', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ classId: c.id, lessonId, mode, timerSec }) });
            }}>Spustit aktivitu</button>
          </div>
        </div>
      </div>
      <PartyWidget classId={c.id} canControl />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card"><div className="card-body space-y-2">
          <div className="font-medium">Členové</div>
          {members.length === 0 && <div className="text-sm muted">Zatím žádní členové.</div>}
          {members.map(m => {
            const u = users.find(u=>u.id===m.userId);
            return (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <div>{u?.displayName || u?.name || u?.email || '—'}</div>
                <div className="muted">{m.role}</div>
              </div>
            );
          })}
        </div></div>
        <div className="card"><div className="card-body space-y-3">
          <div className="font-medium">Třídní chat</div>
          <div className="space-y-2 max-h-72 overflow-auto">
            {msgs.map(m => {
              const u = users.find(u=>u.id===m.userId);
              return (
                <div key={m.id} className="text-sm"><b>{u?.displayName || u?.name || u?.email || '—'}</b>: {m.content} <span className="muted">{new Date(m.createdAt).toLocaleString()}</span></div>
              );
            })}
            {msgs.length === 0 && <div className="text-sm muted">Zatím žádné zprávy.</div>}
          </div>
          <form action={sendClassMessageAction.bind(null, c.id)} className="flex gap-2">
            <input className="input flex-1" name="content" placeholder="Napiš zprávu…" />
            <button className="btn btn-primary">Odeslat</button>
          </form>
        </div></div>
      </div>
    </div>
  );
}
