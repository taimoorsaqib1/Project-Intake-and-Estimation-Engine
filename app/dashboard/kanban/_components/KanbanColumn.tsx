"use client";

import { useDroppable } from "@dnd-kit/core";
import type { BriefAnalysis, BriefStage, User } from "@prisma/client";
import { BriefCard } from "./BriefCard";

type BriefWithRelations = {
  id: string;
  title: string;
  contactName: string;
  budgetRange: string;
  timelineUrgency: string;
  source: string;
  stage: BriefStage;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  analysis: Pick<BriefAnalysis, "status" | "complexityScore" | "category" | "effortMin" | "effortMax"> | null;
  assignee: Pick<User, "id" | "name"> | null;
};

interface KanbanColumnProps {
  id: BriefStage;
  label: string;
  briefs: BriefWithRelations[];
}

export function KanbanColumn({ id, label, briefs }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 rounded-xl flex flex-col transition-colors ${
        isOver ? "bg-slate-100 ring-2 ring-slate-300" : "bg-slate-100"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
        <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 font-medium">
          {briefs.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 px-2 pb-3 min-h-[100px]">
        {briefs.map((brief) => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
        {briefs.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
