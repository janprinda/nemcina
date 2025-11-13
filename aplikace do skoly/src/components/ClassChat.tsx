"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Msg = { id: string; userId: string; content: string; createdAt: string };
type User = { id: string; displayName?: string|null; name?: string|null; email?: string|null; avatarUrl?: string|null };

export default function ClassChat({ classId, users, hideAvatars }: { classId: string; users: User[]; hideAvatars?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  return (
    <div className="space-y-2 max-h-72 overflow-auto no-scrollbar pr-1">
      {msgs.map((m) => {
        const u = users.find(u => u.id === m.userId);
        const ts = new Date(m.createdAt).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', hour12: false });
        return (
          <div key={m.id} className="text-sm flex items-start gap-2">
            {!hideAvatars && (
              <Image src={u?.avatarUrl || '/avatar-placeholder.png'} alt="avatar" width={24} height={24} className="w-6 h-6 rounded-full object-cover mt-0.5" />
            )}
            <div className="bg-[var(--card)]/60 px-3 py-2 rounded-lg border border-[var(--border)] w-full">
              <div className="flex items-center justify-between">
                <b>{u?.displayName || u?.name || u?.email || '—'}</b>
                <span className="muted text-xs">{ts}</span>
              </div>
              <div className="text-sm">{m.content}</div>
            </div>
          </div>
        );
      })}
      {msgs.length === 0 && <div className="text-sm muted">Zatím žádné zprávy.</div>}
      <div ref={endRef} />
    </div>
  );
}

