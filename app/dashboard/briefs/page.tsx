import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import Link from "next/link";
import { BriefsPagination } from "./_components/BriefsPagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STAGE_BADGES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  PROPOSAL_SENT: "bg-purple-100 text-purple-700",
  WON: "bg-green-100 text-green-700",
  ARCHIVED: "bg-slate-100 text-slate-600",
};

const BUDGET_LABELS: Record<string, string> = {
  UNDER_5K: "< $5k",
  BETWEEN_5K_15K: "$5–15k",
  BETWEEN_15K_50K: "$15–50k",
  OVER_50K: "$50k+",
};

export default async function BriefsPage({
  searchParams,
}: {
  searchParams: { cursor?: string };
}) {
  const session = await getRequiredSession();
  const cursor = searchParams.cursor;

  const where =
    session.user.role === "REVIEWER"
      ? { assigneeId: session.user.id }
      : {};

  const briefs = await prisma.brief.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      analysis: { select: { status: true, complexityScore: true } },
      assignee: { select: { name: true } },
    },
  });

  const hasMore = briefs.length > PAGE_SIZE;
  const items = hasMore ? briefs.slice(0, PAGE_SIZE) : briefs;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">All Briefs</h2>
        <p className="text-sm text-slate-500 mt-1">Showing up to {PAGE_SIZE} briefs per page</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {items.length === 0 && !cursor ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No briefs yet. Submit one via the{" "}
            <Link href="/intake" className="text-blue-600 hover:underline">intake form</Link>.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Title", "Stage", "Budget", "Assignee", "Complexity", "Submitted"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-xs">
                    <Link href={`/dashboard/briefs/${b.id}`} className="hover:text-blue-600 line-clamp-1">
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_BADGES[b.stage]}`}>
                      {b.stage.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{BUDGET_LABELS[b.budgetRange] ?? b.budgetRange}</td>
                  <td className="px-4 py-3 text-slate-600">{b.assignee?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {b.analysis?.status === "COMPLETED" ? `C${b.analysis.complexityScore}` :
                     b.analysis?.status === "PENDING" ? "…" : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <BriefsPagination nextCursor={nextCursor} />
    </div>
  );
}
