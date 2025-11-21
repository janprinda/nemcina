import { onTopic } from "@/server/events";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  if (!topic) {
    return new Response("Missing topic", { status: 400 });
  }

  // společný cleanup pro stream – zajistí odhlášení z eventů a zrušení heartbeat
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        // pokud je stream zavřený, enqueue by vyhodil chybu – necháme ji probublat
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data ?? {})}\n\n`)
        );
      };

      // okamžitý ping po připojení
      send({ type: "connected", topic });

      const unsubscribe = onTopic(topic, (payload) => {
        send({ type: "event", topic, payload });
      });

      const heartbeat = setInterval(() => {
        send({ type: "ping", topic });
      }, 30 * 60 * 1000); // každých 30 minut preventivní ping

      cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
    cancel() {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

