"use client";
import { useEffect, useState } from "react";

type ClassRoom = { id: string; name: string; code: string; teacherId: string; createdAt: string };
type User = { id: string; name?: string|null; displayName?: string|null; email?: string|null };

export default function AdminClassesTable() {
  const [rows, setRows] = useState<{ classes: ClassRoom[]; users: User[] }>({ classes: [], users: [] });
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try { const res = await fetch('/api/admin/classes', { cache: 'no-store' }); const j = await res.json(); if (alive) setRows(j); } catch {}
    };
    load();
    const id = setInterval(load, 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  const { classes, users } = rows;
  return (
    <div className="card"><div className="card-body">
      <table className="w-full text-sm align-middle">
        <thead className="muted text-left">
          <tr>
            <th className="py-2 pr-3">Název</th>
            <th className="py-2 pr-3">Učitel</th>
            <th className="py-2 pr-3">Kód</th>
            <th className="py-2 pr-3">Vytvořeno</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(c => {
            const t = users.find(u => u.id === c.teacherId);
            const teacherName = t?.displayName || t?.name || t?.email || '';
            return (
              <tr key={c.id} className="border-t border-[var(--border)]">
                <td className="py-2 pr-3">{c.name}</td>
                <td className="py-2 pr-3">{teacherName}</td>
                <td className="py-2 pr-3">{c.code}</td>
                <td className="py-2 pr-3">{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div></div>
  );
}

