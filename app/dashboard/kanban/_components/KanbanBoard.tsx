"use client";

import { DndContext, DragEndEvent, DragOverlay, PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import type { BriefAnalysis, BriefStage, User } from "@prisma/client";
import { sseRegistry } from "@/lib/sse-registry";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BriefCard } from "./BriefCard";
import { KanbanColumn } from "./KanbanColumn";

type BriefWithRelations = {
  id: string;
  title: string;
  contactName: string;
  contactEmail: string;
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

const STAGES: { id: BriefStage; label: string }[] = [
  { id: "NEW", label: "New" },
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent" },
  { id: "WON", label: "Won" },
  { id: "ARCHIVED", label: "Archived" },
];

interface KanbanBoardProps {
  initialBriefs: BriefWithRelations[];
}

export function KanbanBoard({ initialBriefs }: KanbanBoardProps) {
  const router = useRouter();
  const [briefs, setBriefs] = useState(initialBriefs);
  const [activeBrief, setActiveBrief] = useState<BriefWithRelations | null>(null);

  // SSE: refresh on real-time events
  useEffect(() => {
    const es = new EventSource("/api/sse");
    sseRegistry.register(es);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { type: string };
        if (["BRIEF_NEW", "STAGE_CHANGED", "ASSIGNED", "NOTE_ADDED", "ANALYSIS_COMPLETED"].includes(data.type)) {
          router.refresh();
        }
      } catch {
        // ignore parse errors
      }
    };
    return () => { es.close(); sseRegistry.unregister(es); };
  }, [router]);

  // Sync when server re-renders (after router.refresh)
  useEffect(() => {
    setBriefs(initialBriefs);
  }, [initialBriefs]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      setActiveBrief(null);
      if (!over) return;
      const briefId = active.id as string;
      const newStage = over.id as BriefStage;
      const brief = briefs.find((b) => b.id === briefId);
      if (!brief || brief.stage === newStage) return;

      // Snapshot for rollback
      const prev = briefs;

      // Optimistic update
      setBriefs((bs) => bs.map((b) => (b.id === briefId ? { ...b, stage: newStage } : b)));

      try {
        const res = await fetch(`/api/briefs/${briefId}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });
        if (!res.ok) throw new Error("Failed");
      } catch {
        setBriefs(prev);
      }
    },
    [briefs]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) =>
        setActiveBrief(briefs.find((b) => b.id === active.id) ?? null)
      }
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveBrief(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ id, label }) => (
          <KanbanColumn
            key={id}
            id={id}
            label={label}
            briefs={briefs.filter((b) => b.stage === id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeBrief ? (
          <BriefCard brief={activeBrief} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
