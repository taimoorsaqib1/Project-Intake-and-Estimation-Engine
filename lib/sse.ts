import { EventEmitter } from "events";

class SSEEmitter extends EventEmitter {}

const globalForSSE = globalThis as unknown as { _sseEmitter: SSEEmitter | undefined };

export const sseEmitter: SSEEmitter =
  globalForSSE._sseEmitter ?? new SSEEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForSSE._sseEmitter = sseEmitter;
}

export function broadcastEvent(data: Record<string, unknown>) {
  sseEmitter.emit("sse", data);
}
