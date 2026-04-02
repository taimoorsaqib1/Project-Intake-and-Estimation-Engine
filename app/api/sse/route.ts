import { authOptions } from "@/lib/auth";
import { sseEmitter } from "@/lib/sse";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller already closed
        }
      };

      // Initial heartbeat
      send({ type: "connected" });

      const listener = (data: Record<string, unknown>) => send(data);
      sseEmitter.on("sse", listener);

      // Heartbeat every 25s to keep alive
      const heartbeat = setInterval(() => send({ type: "ping" }), 25_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        sseEmitter.off("sse", listener);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
