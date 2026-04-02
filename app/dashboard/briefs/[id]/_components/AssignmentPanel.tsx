"use client";

import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface AssignmentPanelProps {
  briefId: string;
  currentAssignee: { id: string; name: string; email: string } | null;
  reviewers: { id: string; name: string }[];
  userRole: string;
}

export function AssignmentPanel({
  briefId,
  currentAssignee,
  reviewers,
  userRole,
}: AssignmentPanelProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(currentAssignee?.id ?? "");
  const [isPending, startTransition] = useTransition();

  async function assign() {
    const res = await fetch(`/api/briefs/${briefId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: selectedId || null }),
    });
    if (res.ok) router.refresh();
  }

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <UserCircle className="w-4 h-4" />
        Assignment
      </h3>

      {!isAdmin ? (
        <p className="text-sm text-slate-600">
          {currentAssignee ? (
            <>Assigned to <span className="font-medium">{currentAssignee.name}</span></>
          ) : (
            "Unassigned"
          )}
        </p>
      ) : (
        <div className="space-y-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">Unassigned</option>
            {reviewers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={() => startTransition(() => assign())}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Saving…" : "Update Assignment"}
          </Button>
        </div>
      )}
    </div>
  );
}
