import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { AssignmentPanel } from "./_components/AssignmentPanel";
import { BriefDetailSSE } from "./_components/BriefDetailSSE";
import { EstimateOverrideForm } from "./_components/EstimateOverrideForm";
import { NotesThread } from "./_components/NotesThread";
import { StageTimeline } from "./_components/StageTimeline";

export const dynamic = "force-dynamic";

async function getBrief(id: string) {
  return prisma.brief.findUnique({
    where: { id },
    include: {
      analysis: { include: { override: { include: { overriddenBy: { select: { name: true } } } } } },
      assignee: { select: { id: true, name: true, email: true } },
      events: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
      notes: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
}

const BUDGET_LABELS: Record<string, string> = {
  UNDER_5K: "Under $5,000",
  BETWEEN_5K_15K: "$5,000 – $15,000",
  BETWEEN_15K_50K: "$15,000 – $50,000",
  OVER_50K: "Over $50,000",
};

const TIMELINE_LABELS: Record<string, string> = {
  ASAP: "ASAP",
  ONE_TO_THREE_MONTHS: "1–3 months",
  THREE_TO_SIX_MONTHS: "3–6 months",
  SIX_PLUS_MONTHS: "6+ months",
};

const STAGE_BADGES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  PROPOSAL_SENT: "bg-purple-100 text-purple-700",
  WON: "bg-green-100 text-green-700",
  ARCHIVED: "bg-slate-100 text-slate-600",
};

export default async function BriefDetailPage({ params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const brief = await getBrief(params.id);
  if (!brief) notFound();

  // REVIEWER can only view briefs assigned to them
  if (session.user.role === "REVIEWER" && brief.assigneeId !== session.user.id) {
    notFound();
  }

  const reviewers = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const stageClass = STAGE_BADGES[brief.stage] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <BriefDetailSSE briefId={brief.id} />
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{brief.title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            Submitted by {brief.contactName} · {new Date(brief.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stageClass}`}>
          {brief.stage.replace(/_/g, " ")}
        </span>
      </div>

      {/* Two-column main */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Submission details */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Project Brief</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{brief.description}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Contact</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{brief.contactName}</p>
              <p className="text-sm text-slate-500">{brief.contactEmail}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Budget</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {BUDGET_LABELS[brief.budgetRange] ?? brief.budgetRange}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Timeline</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {TIMELINE_LABELS[brief.timelineUrgency] ?? brief.timelineUrgency}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Source</p>
              <p className="text-sm font-medium text-slate-900 mt-1 capitalize">{brief.source.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* RIGHT: AI Analysis + Assignment */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Analysis */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">AI Analysis</h3>
            {!brief.analysis || brief.analysis.status === "PENDING" ? (
              <p className="text-sm text-amber-600">Analysis in progress…</p>
            ) : brief.analysis.status === "FAILED" ? (
              <p className="text-sm text-red-500">Analysis failed. Retry by re-submitting.</p>
            ) : (
              <div className="space-y-3">
                {brief.analysis.category && (
                  <Row label="Category" value={brief.analysis.category.replace(/_/g, " ")} />
                )}
                <Row
                  label="Effort"
                  value={`${brief.analysis.effortMin}–${brief.analysis.effortMax} hours`}
                />
                <Row label="Complexity" value={`${brief.analysis.complexityScore} / 5`} />
                {brief.analysis.techStack && (
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Tech Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {(brief.analysis.techStack as string[]).map((t) => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(brief.analysis.features) && (brief.analysis.features as string[]).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Extracted Features</p>
                    <ul className="list-disc list-inside space-y-1">
                      {(brief.analysis.features as string[]).map((f, i) => (
                        <li key={i} className="text-sm text-slate-700">{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Override */}
          {brief.analysis?.status === "COMPLETED" && (
            <EstimateOverrideForm
              analysisId={brief.analysis.id}
              existingOverride={brief.analysis.override}
              userRole={session.user.role}
            />
          )}

          {/* Assignment */}
          <AssignmentPanel
            briefId={brief.id}
            currentAssignee={brief.assignee}
            reviewers={reviewers}
            userRole={session.user.role}
          />
        </div>
      </div>

      {/* Stage Timeline */}
      <StageTimeline events={brief.events} currentStage={brief.stage} />

      {/* Notes */}
      <NotesThread
        briefId={brief.id}
        notes={brief.notes}
        currentUserId={session.user.id}
        currentUserName={session.user.name}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-900 capitalize">{value}</p>
    </div>
  );
}
