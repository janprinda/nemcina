import { EventEmitter } from "events";

// Jednoduchý process-level event bus pro SSE
const emitter = new EventEmitter();
emitter.setMaxListeners(1000);

export type Topic = string;

export function emitTopic(topic: Topic, payload: any = {}) {
  emitter.emit(topic, payload);
}

export function onTopic(
  topic: Topic,
  handler: (payload: any) => void
): () => void {
  emitter.on(topic, handler);
  return () => {
    emitter.off(topic, handler);
  };
}

export { emitter as eventsEmitter };

