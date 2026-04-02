"use client";

import { sseRegistry } from "@/lib/sse-registry";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function BriefDetailSSE({ briefId }: { briefId: string }) {
  const router = useRouter();

  useEffect(() => {
    const es = new EventSource("/api/sse");
    sseRegistry.register(es);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { type: string; briefId?: string };
        if (
          data.briefId === briefId &&
          ["STAGE_CHANGED", "ASSIGNED", "NOTE_ADDED", "ANALYSIS_COMPLETED"].includes(data.type)
        ) {
          router.refresh();
        }
      } catch {
        // ignore parse errors
      }
    };
    return () => { es.close(); sseRegistry.unregister(es); };
  }, [briefId, router]);

  return null;
}
