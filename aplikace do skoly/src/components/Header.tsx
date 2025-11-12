"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header-grad">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-100">Aplikace do školy</Link>
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Link className="btn btn-ghost" href="/">Domů</Link>
          <Link className="btn btn-ghost" href="/leaderboard">Žebříček</Link>
          <Link className="btn btn-ghost" href="/profile">Profil</Link>
          <Link className="btn btn-ghost" href="/admin">Admin</Link>
          <Link className="btn btn-primary" href="/auth">Přihlášení</Link>
        </nav>
        <button className="md:hidden btn btn-secondary" onClick={()=> setOpen(o=>!o)} aria-label="Menu">☰</button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[var(--border)]">
          <div className="container py-3 flex flex-col gap-2">
            <Link className="btn btn-ghost" href="/" onClick={()=>setOpen(false)}>Domů</Link>
            <Link className="btn btn-ghost" href="/leaderboard" onClick={()=>setOpen(false)}>Žebříček</Link>
            <Link className="btn btn-ghost" href="/profile" onClick={()=>setOpen(false)}>Profil</Link>
            <Link className="btn btn-ghost" href="/admin" onClick={()=>setOpen(false)}>Admin</Link>
            <Link className="btn btn-primary" href="/auth" onClick={()=>setOpen(false)}>Přihlášení</Link>
          </div>
        </div>
      )}
    </header>
  );
}

