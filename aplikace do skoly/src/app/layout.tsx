import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import Providers from "@/app/providers";
import { ensureSeed } from "@/server/init";

export default function RootLayout({ children }: { children: ReactNode }) {
  // kick off seed/initialization on server
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  ensureSeed();
  return (
    <html lang="cs" className="dark">
      <body className="min-h-screen">
        <header className="header-grad">
          <div className="container py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-gray-100">Aplikace do školy</Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link className="btn btn-ghost" href="/">Domů</Link>
              <Link className="btn btn-ghost" href="/admin">Admin</Link>
              <Link className="btn btn-ghost" href="/leaderboard">Žebříček</Link>
              <Link className="btn btn-ghost" href="/profile">Profil</Link>
              <Link className="btn btn-primary" href="/auth">Přihlášení</Link>
            </nav>
          </div>
        </header>
        <Providers>
          <main className="container py-10 flex justify-center">
            <div className="w-full max-w-5xl">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
