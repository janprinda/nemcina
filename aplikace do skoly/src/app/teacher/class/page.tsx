import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { createClassAction, regenerateCodeAction, sendClassMessageAction, startPartyAction, updateCooldownAction } from "./actions";
import { getUsers, listClassMembers, listClassesForUser, listMessages, getLessons } from "@/server/store";
import PartyWidget from "@/components/PartyWidget";
import CopyCode from "@/components/CopyCode";
import Image from "next/image";
import ClassChat from "@/components/ClassChat";

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
          <div className="flex items-center gap-2">
            <a className="btn btn-primary" href={`/teacher/party/${c.id}`}>Host a Party</a>
            <form action={regenerateCodeAction.bind(null, c.id)}><button className="btn btn-secondary">Obnovit kód</button></form>
            <form action={updateCooldownAction.bind(null, c.id)} className="flex items-center gap-2">
              <label className="text-sm">Cooldown</label>
              <input name="chatCooldownSec" className="input w-24" type="number" min={0} max={600} defaultValue={c.chatCooldownSec ?? 0} />
              <button className="btn btn-ghost">Uložit</button>
            </form>
          </div>
        </div>
      </div>

      {/* Start activity */}
      <div className="card">
        <form action={startPartyAction.bind(null, c.id)} className="card-body grid md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm">Lekce</label>
            <select name="lessonId" className="select w-full">
              {lessons.map((l: any) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Režim</label>
            <select name="mode" className="select w-full">
              <option value="mc">Rozhodovačka</option>
              <option value="write">Psaní</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Čas (s)</label>
            <input name="timerSec" className="input" type="number" min={5} max={120} defaultValue={30} />
          </div>
          <div className="md:col-span-4">
            <button type="submit" className="btn btn-primary">Spustit aktivitu</button>
          </div>
        </form>
      </div>

      <PartyWidget classId={c.id} canControl />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-body space-y-2">
            <div className="font-medium">Členové</div>
            {members.length === 0 && <div className="text-sm muted">Zatím žádní členové.</div>}
            {members.map((m: any) => {
              const u = users.find((u: any) => u.id === m.userId);
              return (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Image src={u?.avatarUrl || '/avatar-placeholder.png'} alt="avatar" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                    <div>{u?.displayName || u?.name || u?.email || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="muted">{m.role}</span>
                    {m.role === 'STUDENT' && (
                      <form action={async()=>{ 'use server'; const { removeMember } = await import('@/server/store'); await removeMember(m.id); }}>
                        <button className="btn btn-ghost text-red-400" type="submit">Vyhodit</button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-body space-y-3">
            <div className="font-medium">Třídní chat</div>
            <ClassChat classId={c.id} users={users as any} />
            <form key={msgs.length} action={sendClassMessageAction.bind(null, c.id)} className="flex gap-2">
              <input className="input flex-1" name="content" placeholder="Napiš zprávu…" />
              <input type="hidden" name="cooldownHint" value={String(c.chatCooldownSec ?? 0)} />
              <button className="btn btn-primary">Odeslat</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

