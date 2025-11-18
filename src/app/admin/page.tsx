"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import React from "react";
import { EDITOR_ALLOW_POINT_MANIPULATION } from "../../lib/editorConfig";

// Nové: globální flag ovládající možnost manipulace s bodovým hodnocením v editoru.
// Nastavte na false, aby se v editoru skryly / zakázaly ovládací prvky pro body.
export const EDITOR_ALLOW_POINT_MANIPULATION = false;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pokud už je uživatel přihlášený, pošli ho rovnou na domovskou stránku
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Vyplňte email i heslo");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Nesprávný email nebo heslo");
      } else {
        // úspěšné přihlášení → domovská stránka s lekcemi
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Přihlášení</h1>
      <form className="max-w-sm space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <input
            className="w-full px-3 py-2 input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            type="email"
          />
          <input
            className="w-full px-3 py-2 input"
            placeholder="Heslo"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div className="text-sm text-red-400" role="alert" aria-live="polite">
            {error}
          </div>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading || !email || !password}
        >
          {loading ? "Probíhá přihlášení..." : "Přihlásit"}
        </button>
      </form>
      <div className="text-sm">
        Nemáte účet?{" "}
        <Link className="underline" href="/auth/signup">
          Registrace
        </Link>
      </div>
      <p className="text-sm text-gray-400">
        Účet admin se vytvoří automaticky při startu (viz seed).
      </p>
      {/* UI pro bodování: zobrazí se pouze pokud je flag povolen */}
      {EDITOR_ALLOW_POINT_MANIPULATION ? (
        <>
          {/* ...existing scoring controls (inputs, tlačítka, atd.) ... */}
        </>
      ) : null}
    </div>
  );
}