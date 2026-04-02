import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { KanbanBoard } from "./_components/KanbanBoard";

export const dynamic = "force-dynamic";

async function getBriefs() {
  return prisma.brief.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      analysis: {
        select: { status: true, complexityScore: true, category: true, effortMin: true, effortMax: true },
      },
      assignee: { select: { id: true, name: true } },
    },
  });
}

export default async function KanbanPage() {
  const session = await getRequiredSession();
  let briefs = await getBriefs();

  // REVIEWER can only see briefs assigned to them
  if (session.user.role === "REVIEWER") {
    briefs = briefs.filter((b) => b.assigneeId === session.user.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Kanban Board</h2>
        <p className="text-sm text-slate-500 mt-1">
          Drag cards to move briefs through pipeline stages.
        </p>
      </div>
      <KanbanBoard initialBriefs={briefs} />
    </div>
  );
}
