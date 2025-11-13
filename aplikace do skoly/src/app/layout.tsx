import "./globals.css";
import { ReactNode } from "react";
import Providers from "@/app/providers";
import { ensureSeed } from "@/server/init";
import Header from "@/components/Header";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: ReactNode }) {
  // kick off seed/initialization on server
  void ensureSeed();
  return (
    <html lang="cs" className="dark">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-screen">
        <Providers>
          <Header />
          <main className="container py-10 flex justify-center">
            <div className="w-full max-w-5xl">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
