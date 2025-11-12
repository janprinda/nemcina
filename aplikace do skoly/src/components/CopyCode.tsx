"use client";
import { useState } from "react";

export default function CopyCode({ code, className = "" }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      title="Kliknutím zkopíruješ"
      className={`inline-flex items-center rounded border border-[var(--border)] px-2 py-1 cursor-pointer transition-colors hover:bg-white/5 ${className}`}
    >
      {code}
      <span className={`ml-2 text-xs ${copied ? 'text-green-400' : 'muted'}`}>{copied ? 'Zkopírováno' : 'Kopírovat'}</span>
    </span>
  );
}

