import "./globals.css";
import { ReactNode } from "react";
import Providers from "@/app/providers";
import { ensureSeed } from "@/server/init";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  // kick off seed/initialization on server
  void ensureSeed();
  return (
    <html lang="cs" className="dark">
      <body className="min-h-screen">
        <Header />
        <Providers>
          <main className="container py-10 flex justify-center">
            <div className="w-full max-w-5xl">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
