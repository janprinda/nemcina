"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (session) {
    return (
      <div className="space-y-4">
        <div>PĹ™ihlĂˇĹˇen: <b>{session.user?.email}</b></div>
        <button className="btn btn-secondary" onClick={() => signOut({ callbackUrl: '/auth' })}>Odhlásit</button>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">PĹ™ihlĂˇĹˇenĂ­</h1>
      <div className="space-y-2">
        <input className="w-full px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full px-3 py-2" placeholder="Heslo" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <button
        className="btn btn-primary"
        onClick={async () => {
          setError(null);
          const res = await signIn("credentials", { email, password, redirect: false });
          if (res?.error) setError("Nesprávný email nebo heslo");
        }}
      >
        PĹ™ihlĂˇsit
      </button>
      {/* OAuth login buttons removed per request */}
      <div className="text-sm">NemĂˇĹˇ ĂşÄŤet? <Link className="underline" href="/auth/signup">Registrace</Link></div>
      <p className="text-sm text-gray-400">ĂšÄŤet admin se vytvoĹ™Ă­ automaticky pĹ™i startu (viz seed).</p>
    </div>
  );
}


