"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Msg = { id: string; userId: string; content: string; createdAt: string };
type User = { id: string; displayName?: string|null; name?: string|null; email?: string|null; avatarUrl?: string|null };

export default function ClassChat({ classId, users }: { classId: string; users: User[] }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/class/${encodeURIComponent(classId)}/messages`, { cache: 'no-store' });
        const j = await res.json();
        if (alive) setMsgs(j);
      } catch {}
    };
    load();
    const id = setInterval(load, 1000);
    return () => { alive = false; clearInterval(id); };
  }, [classId]);
  return (
    <div className="space-y-2 max-h-72 overflow-auto">
      {msgs.map((m) => {
        const u = users.find(u => u.id === m.userId);
        return (
          <div key={m.id} className="text-sm flex items-start gap-2">
            <Image src={u?.avatarUrl || '/avatar-placeholder.png'} alt="avatar" width={24} height={24} className="w-6 h-6 rounded-full object-cover mt-0.5" />
            <div>
              <b>{u?.displayName || u?.name || u?.email || '—'}</b>: {m.content} <span className="muted">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
      {msgs.length === 0 && <div className="text-sm muted">Zatím žádné zprávy.</div>}
    </div>
  );
}

