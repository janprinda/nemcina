"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = { id: string; title: string; description?: string | null };

export default function LessonGrid() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/api/lessons", { cache: "no-store" });
        const j = await res.json();
        if (alive) setLessons(j);
      } catch {
        // ignore
      }
    };

    load();

    // SSE – posloucháme změny lekcí a při každé změně refetchneme
    const es = new EventSource("/api/events/stream?topic=lessons");
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
    const interval = setInterval(load, 30 * 60 * 1000);

    return () => {
      alive = false;
      es.close();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((l) => (
        <div key={l.id} className="card">
          <div className="card-body">
            <h2 className="font-medium text-gray-100">{l.title}</h2>
            <p className="text-sm muted">{l.description}</p>
            <div className="mt-3 flex gap-3 justify-center">
              <Link className="btn btn-primary" href={`/quiz/${l.id}`}>
                Spustit kvíz
              </Link>
              <Link
                className="btn btn-secondary"
                href={`/admin/lessons/${l.id}`}
              >
                Detail
              </Link>
            </div>
          </div>
        </div>
      ))}
      {lessons.length === 0 && (
        <div className="text-sm muted text-center">
          Zatím žádné lekce. Vytvoř je v{" "}
          <Link href="/admin" className="underline">
            Admin
          </Link>
          .
        </div>
      )}
    </div>
  );
}

