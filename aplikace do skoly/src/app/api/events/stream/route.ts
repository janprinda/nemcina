import { onTopic } from "@/server/events";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  if (!topic) {
    return new Response("Missing topic", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
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

      (controller as any)._cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
    cancel() {
      const self: any = this;
      if (typeof self._cleanup === "function") {
        self._cleanup();
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

