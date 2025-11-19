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

const NAME_COLORS = [
  "#f97373",
  "#facc15",
  "#4ade80",
  "#60a5fa",
  "#a855f7",
  "#fb923c",
  "#2dd4bf",
];

function colorForUser(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++)
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
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

    // SSE stream – posloucháme změny chatu v dané třídě
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
        const baseColor = colorForUser(m.userId);
        const isMe = currentUserId && m.userId === currentUserId;
        const nameColor = isMe ? "#0b0f1f" : baseColor;
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
                  : "bg-[var(--card)] border-[var(--border)]"
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
                  <span
                    className="text-xs font-semibold"
                    style={{ color: nameColor }}
                    title={name}
                  >
                    {name}
                  </span>
                </div>
                <span className="muted text-[10px] whitespace-nowrap">
                  {ts}
                </span>
              </div>
              <div className="text-sm mt-1 whitespace-pre-wrap break-words text-gray-100">
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
