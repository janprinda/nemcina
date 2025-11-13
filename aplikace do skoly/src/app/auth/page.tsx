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
        <div>Přihlášen: <b>{session.user?.email}</b></div>
        <button className="btn btn-secondary" onClick={() => signOut({ callbackUrl: "/auth" })}>
          Odhlásit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">Přihlášení</h1>
      <div className="space-y-2">
        <input
          className="w-full px-3 py-2 input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 input"
          placeholder="Heslo"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
        Přihlásit
      </button>
      <div className="text-sm">
        Nemáte účet? <Link className="underline" href="/auth/signup">Registrace</Link>
      </div>
      <p className="text-sm text-gray-400">Účet admin se vytvoří automaticky při startu (viz seed).</p>
    </div>
  );
}

