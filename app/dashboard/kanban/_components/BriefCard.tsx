"use client";

import { Badge } from "@/components/ui/badge";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { BriefAnalysis, BriefStage, User } from "@prisma/client";
import { GripVertical, Loader2, UserCircle } from "lucide-react";
import Link from "next/link";

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

const BUDGET_LABELS: Record<string, string> = {
  UNDER_5K: "< $5k",
  BETWEEN_5K_15K: "$5–15k",
  BETWEEN_15K_50K: "$15–50k",
  OVER_50K: "$50k+",
};

const COMPLEXITY_COLOR: Record<number, string> = {
  1: "bg-green-100 text-green-700",
  2: "bg-green-100 text-green-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

interface BriefCardProps {
  brief: BriefWithRelations;
  isOverlay?: boolean;
}

export function BriefCard({ brief, isOverlay }: BriefCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: brief.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const complexity = brief.analysis?.complexityScore;
  const complexityClass = complexity ? COMPLEXITY_COLOR[complexity] ?? "bg-slate-100 text-slate-600" : "";

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? {} : { ...style, touchAction: "none" }}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-slate-200 p-3 shadow-sm select-none ${
        isOverlay ? "shadow-lg rotate-1 cursor-grabbing" : "cursor-grab hover:border-slate-300"
      }`}
    >
      {/* Grip + Title */}
      <div className="flex items-start gap-1.5">
        <span className="mt-0.5 text-slate-300 flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </span>
        <Link
          href={`/dashboard/briefs/${brief.id}`}
          className="text-sm font-medium text-slate-900 leading-snug hover:text-blue-600 line-clamp-2 flex-1"
          onClick={(e) => { if (isDragging) e.preventDefault(); }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {brief.title}
        </Link>
      </div>

      {/* Meta */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-xs">
          {BUDGET_LABELS[brief.budgetRange] ?? brief.budgetRange}
        </Badge>
        {brief.source === "WEBHOOK" && (
          <Badge variant="secondary" className="text-xs">Webhook</Badge>
        )}
        {complexity && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${complexityClass}`}>
            C{complexity}
          </span>
        )}
        {brief.analysis?.status === "PENDING" && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyzing
          </span>
        )}
      </div>

      {/* Assignee */}
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <UserCircle className="w-3.5 h-3.5" />
        <span>{brief.assignee?.name ?? "Unassigned"}</span>
      </div>
    </div>
  );
}
