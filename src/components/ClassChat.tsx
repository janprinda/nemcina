"use client";
import { useEffect, useState, useRef } from "react";
import { getMessages } from "@/server/store";

interface User {
  id: string;
  displayName?: string;
  name?: string;
  email?: string;
}

interface Message {
  id: string;
  classId: string;
  userId: string;
  content: string;
  createdAt: Date;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Načíst zprávy pouze při mountu
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await getMessages(classId);
        setMessages(msgs);
        setLoading(false);
      } catch (err) {
        console.error("Chyba při načítání zpráv:", err);
        setLoading(false);
      }
    };
    loadMessages();
  }, [classId]);

  // Auto-scroll na konec při nových zprávách
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Expozice funkce pro aktualizaci zpráv z rodiče
  useEffect(() => {
    (window as any).refreshClassChat = async () => {
      const msgs = await getMessages(classId);
      setMessages(msgs);
    };
  }, [classId]);

  if (loading) {
    return <div className="text-sm muted py-4">Načítám zprávy...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="bg-[var(--card)]/50 rounded p-3 max-h-96 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <div className="text-xs muted text-center py-4">
            Zatím žádné zprávy. Buď první!
          </div>
        ) : (
          messages.map((msg) => {
            const author = users.find((u) => u.id === msg.userId);
            const displayName =
              author?.displayName || author?.name || author?.email || "Neznámý";
            return (
              <div key={msg.id} className="text-xs">
                <div className="flex items-baseline gap-2">
                  {!hideAvatars && (
                    <div className="w-5 h-5 rounded-full bg-blue-500/30 flex-shrink-0" />
                  )}
                  <span className="font-medium text-blue-300">{displayName}</span>
                  <span className="muted text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString("cs-CZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="ml-7 text-gray-300">{msg.content}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
