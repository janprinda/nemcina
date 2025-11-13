import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getUsers, getLessons, getClassById } from "@/server/store";
import { startPartyAction } from "../../class/actions";
import PartyWidget from "@/components/PartyWidget";
import CopyCode from "@/components/CopyCode";

export default async function HostPartyPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;
  if (!uid) return <div>Prosím přihlas se.</div>;
  const c = await getClassById(params.id);
  if (!c) return <div>Třída nenalezena</div>;
  const users = await getUsers();
  if (c.teacherId !== uid) return <div>Nemáš oprávnění hostovat party této třídy.</div>;
  const lessons = await getLessons();
  const teacher = users.find(u=>u.id===c.teacherId);
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="card">
        <div className="card-body flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-100">{c.name}</div>
            <div className="text-sm muted">Kód pro připojení: <CopyCode code={c.code} /></div>
            <div className="text-xs muted">Učitel: {teacher?.displayName || teacher?.name || teacher?.email}</div>
          </div>
        </div>
      </div>
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
            <button type="submit" className="btn btn-primary">Hostovat/Start</button>
          </div>
        </form>
      </div>
      <PartyWidget classId={c.id} canControl />
    </div>
  );
}

