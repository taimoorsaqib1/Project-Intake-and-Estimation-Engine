"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

interface FormValues {
  effortMin: number;
  effortMax: number;
  complexityScore: number;
  techStack: string;
  reason: string;
}

interface ExistingOverride {
  id: string;
  effortMin: number;
  effortMax: number;
  complexityScore: number;
  techStack: unknown;
  reason: string;
  overriddenBy: { name: string };
  createdAt: Date;
}

interface EstimateOverrideFormProps {
  analysisId: string;
  existingOverride: ExistingOverride | null;
  userRole: string;
}

export function EstimateOverrideForm({
  analysisId,
  existingOverride,
  userRole,
}: EstimateOverrideFormProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: existingOverride
      ? {
          effortMin: existingOverride.effortMin,
          effortMax: existingOverride.effortMax,
          complexityScore: existingOverride.complexityScore,
          techStack: Array.isArray(existingOverride.techStack)
            ? (existingOverride.techStack as string[]).join(", ")
            : "",
          reason: existingOverride.reason,
        }
      : undefined,
  });

  async function onSubmit(data: FormValues) {
    setError(null);
    const techStack = data.techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch(`/api/briefs/analysis/${analysisId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, techStack }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError((json as { error?: string }).error ?? "Failed to save override.");
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  if (userRole !== "ADMIN" && userRole !== "REVIEWER") return null;

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Estimate Override</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : existingOverride ? "Edit Override" : "Override"}
        </Button>
      </div>

      {existingOverride && !showForm && (
        <div className="space-y-2 text-sm">
          <p className="text-slate-500 text-xs">
            Last overridden by <span className="font-medium">{existingOverride.overriddenBy.name}</span> on{" "}
            {new Date(existingOverride.createdAt).toLocaleDateString()}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-400 uppercase">Effort</p>
              <p className="font-medium">{existingOverride.effortMin}–{existingOverride.effortMax} hours</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Complexity</p>
              <p className="font-medium">{existingOverride.complexityScore} / 5</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Reason</p>
            <p className="text-slate-700">{existingOverride.reason}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit((d) => startTransition(() => onSubmit(d)))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="effortMin">Min Days</Label>
              <Input
                id="effortMin"
                type="number"
                min={1}
                {...register("effortMin", { required: true, valueAsNumber: true, min: 1 })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="effortMax">Max Days</Label>
              <Input
                id="effortMax"
                type="number"
                min={1}
                {...register("effortMax", { required: true, valueAsNumber: true, min: 1 })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="complexityScore">Complexity (1–5)</Label>
            <Input
              id="complexityScore"
              type="number"
              min={1}
              max={5}
              {...register("complexityScore", { required: true, valueAsNumber: true, min: 1, max: 5 })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
            <Input
              id="techStack"
              placeholder="Next.js, Prisma, OpenAI"
              {...register("techStack", { required: true })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reason">Reason for Override</Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="Explain why you are overriding the AI estimate…"
              className="resize-none"
              {...register("reason", { required: "Reason is required" })}
            />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button type="submit" size="sm" disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Save Override"}
          </Button>
        </form>
      )}

      {!existingOverride && !showForm && (
        <p className="text-xs text-slate-400">No override applied. AI estimates are used as-is.</p>
      )}
    </div>
  );
}
