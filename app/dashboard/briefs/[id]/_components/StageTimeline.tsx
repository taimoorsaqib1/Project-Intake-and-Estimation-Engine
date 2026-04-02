import type { BriefEventType, BriefStage } from "@prisma/client";
import { ArrowRight, CheckCircle2, UserPlus } from "lucide-react";

type Event = {
  id: string;
  type: BriefEventType;
  payload: unknown;
  createdAt: Date;
  user: { name: string } | null;
};

const STAGE_ORDER: BriefStage[] = ["NEW", "UNDER_REVIEW", "PROPOSAL_SENT", "WON", "ARCHIVED"];

const STAGE_LABELS: Record<string, string> = {
  NEW: "New",
  UNDER_REVIEW: "Under Review",
  PROPOSAL_SENT: "Proposal Sent",
  WON: "Won",
  ARCHIVED: "Archived",
};

interface StageTimelineProps {
  events: Event[];
  currentStage: BriefStage;
}

export function StageTimeline({ events, currentStage }: StageTimelineProps) {
  const stageEvents = events.filter((e) => e.type === "STAGE_CHANGE");
  const assignmentEvents = events.filter((e) => e.type === "ASSIGNMENT");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Stage Timeline</h3>

      {/* Visual pipeline */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto">
        {STAGE_ORDER.map((stage, i) => {
          const isPast = STAGE_ORDER.indexOf(currentStage) > i;
          const isCurrent = stage === currentStage;
          return (
            <div key={stage} className="flex items-center gap-1 flex-shrink-0">
              <div
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                  isCurrent
                    ? "bg-blue-600 text-white"
                    : isPast
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isPast && <CheckCircle2 className="w-3 h-3" />}
                {STAGE_LABELS[stage]}
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage change log */}
      {stageEvents.length === 0 ? (
        <p className="text-xs text-slate-400">No stage changes recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {stageEvents.map((ev) => {
            const payload = ev.payload as { from: string; to: string };
            return (
              <div key={ev.id} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                <span>
                  {payload.from?.replace(/_/g, " ")} → {payload.to?.replace(/_/g, " ")}
                </span>
                {ev.user && <span className="text-slate-400">by {ev.user.name}</span>}
                <span className="ml-auto text-slate-300">
                  {new Date(ev.createdAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment history */}
      {assignmentEvents.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Assignment History
          </h4>
          <div className="space-y-2">
            {assignmentEvents.map((ev) => {
              const payload = ev.payload as { assigneeId: string | null };
              return (
                <div key={ev.id} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                  <span>
                    {payload.assigneeId ? "Assigned" : "Unassigned"}
                  </span>
                  {ev.user && <span className="text-slate-400">by {ev.user.name}</span>}
                  <span className="ml-auto text-slate-300">
                    {new Date(ev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
