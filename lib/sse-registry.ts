"use client";

// Global SSE connection registry — components register/unregister their EventSource here.
// The logout handler calls closeAll() before signOut so there are no mid-stream cuts.

const sources = new Set<EventSource>();

export const sseRegistry = {
  register(es: EventSource) {
    sources.add(es);
  },
  unregister(es: EventSource) {
    sources.delete(es);
  },
  closeAll() {
    sources.forEach((es) => es.close());
    sources.clear();
  },
};
