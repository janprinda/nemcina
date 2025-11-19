"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type State = { party: any; players: Array<{ id:string; displayName:string; score:number; avatarUrl?: string|null }>; entryId?: string; dir?: 'de2cs'|'cs2de' } | null;

export default function PartyWidget({ classId, canControl }: { classId: string; canControl?: boolean }) {
  const [state, setState] = useState<State>(null);
  const party = state?.party;
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/party/status?classId=${encodeURIComponent(classId)}`, { cache: 'no-store' });
        const j = await res.json();
        if (alive) setState(j.state);
      } catch {}
    };
    tick();
    // preventivní refresh každých 30 minut místo 1s pollingu
    const id = setInterval(tick, 30 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, [classId]);

  if (!party) return null;
  const isLobby = party.status === 'lobby';
  const isRunning = party.status === 'running';
  return (
    <div className="card">
      <div className="card-body space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="chip" style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', color:'#0b0f1f' }}>Probíhá aktivita</span>
            <div className="text-xs muted">Režim: {party.mode.toUpperCase()} · Otázka {party.currentIndex < 0 ? 0 : party.currentIndex+1} / {party.entryIds.length}</div>
          </div>
          {canControl ? (
            <div className="flex gap-2">
              {isLobby ? (
                <button className="btn btn-primary" onClick={async()=>{ await fetch('/api/party/next', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ partyId: party.id, action: 'start' }) }); }}>Start</button>
              ) : isRunning ? (
                <button className="btn btn-secondary" onClick={async()=>{ await fetch('/api/party/next', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ partyId: party.id }) }); }}>Další</button>
              ) : null}
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={async()=>{
              await fetch('/api/party/join', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ partyId: party.id }) });
            }}>Připojit</button>
          )}
        </div>
        <div>
          <div className="font-medium mb-1">Žebříček</div>
          <div className="grid grid-cols-1 gap-1">
            {(state?.players||[]).map((p,i)=> (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Image src={p.avatarUrl || '/avatar-placeholder.svg'} alt="avatar" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                  <div><span className="muted">{i+1}.</span> {p.displayName}</div>
                </div>
                <div className="font-medium">{p.score} b.</div>
              </div>
            ))}
            {(!state?.players || state.players.length===0) && <div className="text-sm muted">Zatím žádní hráči.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
