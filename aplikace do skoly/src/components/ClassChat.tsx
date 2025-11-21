"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Msg = { id: string; userId: string; content: string; createdAt: string };
type User = {
  id: string;
  displayName?: string | null;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

// Jemnější barvy pro odlišení uživatelů (jen malá tečka, ne celé jméno)
const NAME_COLORS = [
  "#fca5a5", // jemná červená
  "#fde68a", // jemná žlutá
  "#bbf7d0", // jemná zelená
  "#bfdbfe", // jemná modrá
  "#e9d5ff", // jemná fialová
  "#fed7aa", // jemná oranžová
  "#a5f3fc", // jemná tyrkysová
];

function colorForUser(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return NAME_COLORS[h % NAME_COLORS.length];
}

export default function ClassChat({
  classId,
  users,
  hideAvatars,
}: {
  classId: string;
  users: User[];
  hideAvatars?: boolean;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const currentUserId = (session as any)?.user?.id as string | undefined;

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch(
          `/api/class/${encodeURIComponent(classId)}/messages`,
          { cache: "no-store" }
        );
        const j = await res.json();
        if (alive) setMsgs(j);
      } catch {
        // ignore
      }
    };

    // úvodní načtení
    load();

    // SSE – posloucháme jen změny chatu pro danou třídu
    const es = new EventSource(
      `/api/events/stream?topic=${encodeURIComponent(`chat:${classId}`)}`
    );
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type === "event") {
          load();
        }
      } catch {
        // ignore
      }
    };

    // pojistka – každých 30 minut full refresh
    const intervalId = setInterval(load, 30 * 60 * 1000);

    return () => {
      alive = false;
      es.close();
      clearInterval(intervalId);
    };
  }, [classId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  return (
    <div className="space-y-2 max-h-72 overflow-auto no-scrollbar pr-1">
      {msgs.map((m) => {
        const u = users.find((u) => u.id === m.userId);
        const ts = new Date(m.createdAt).toLocaleTimeString("cs-CZ", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const name = u?.displayName || u?.name || u?.email || "Bez jména";
        const userColor = colorForUser(m.userId);
        const isMe = currentUserId && m.userId === currentUserId;

        return (
          <div
            key={m.id}
            className={`text-sm flex ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg border inline-block max-w-[70%] break-words ${
                isMe
                  ? "bg-[var(--accent)] text-[var(--bg)] border-transparent"
                  : "bg-[var(--card)] border-[var(--border)] text-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {!hideAvatars && (
                    <Image
                      src={u?.avatarUrl || "/avatar-placeholder.svg"}
                      alt="avatar"
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  {/* malá barevná tečka podle uživatele */}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: userColor }}
                  />
                  <span
                    className="text-xs font-semibold truncate"
                    title={name}
                  >
                    {name}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {ts}
                </span>
              </div>
              <div className="text-sm mt-1 whitespace-pre-wrap break-words">
                {m.content}
              </div>
            </div>
          </div>
        );
      })}
      {msgs.length === 0 && (
        <div className="text-sm muted">Zatím žádné zprávy.</div>
      )}
      <div ref={endRef} />
    </div>
  );
}
