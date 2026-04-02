"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useEffect } from "react";
import { briefSchema, type BriefFormValues } from "@/lib/validation/brief";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, AlertCircle, Loader2, Bold, Italic, List } from "lucide-react";

const BUDGET_OPTIONS = [
  { value: "UNDER_5K", label: "Under $5,000" },
  { value: "BETWEEN_5K_15K", label: "$5,000 – $15,000" },
  { value: "BETWEEN_15K_50K", label: "$15,000 – $50,000" },
  { value: "OVER_50K", label: "Over $50,000" },
];

const TIMELINE_OPTIONS = [
  { value: "ASAP", label: "ASAP (Rush)" },
  { value: "ONE_TO_THREE_MONTHS", label: "1–3 months" },
  { value: "THREE_TO_SIX_MONTHS", label: "3–6 months" },
  { value: "SIX_PLUS_MONTHS", label: "6+ months" },
];

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; briefId: string }
  | { status: "error"; message: string; retryAfter?: number };

export function IntakeForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
    reset,
  } = useForm<BriefFormValues>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      title: "",
      description: "",
      contactName: "",
      contactEmail: "",
    },
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 prose prose-sm max-w-none",
      },
    },
    onUpdate({ editor }) {
      setValue("description", editor.getText(), { shouldValidate: true });
    },
  });

  // Clean up editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  async function onSubmit(data: BriefFormValues) {
    setSubmitState({ status: "loading" });

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "60", 10);
        setSubmitState({
          status: "error",
          message: "Too many submissions. Please wait before trying again.",
          retryAfter,
        });
        return;
      }

      if (res.status === 422 && json.fieldErrors) {
        // Map server field errors back to the form
        for (const [field, messages] of Object.entries(json.fieldErrors)) {
          setError(field as keyof BriefFormValues, {
            message: (messages as string[])[0],
          });
        }
        setSubmitState({ status: "idle" });
        return;
      }

      if (!res.ok) {
        setSubmitState({
          status: "error",
          message: json.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setSubmitState({ status: "success", briefId: json.id });
      reset();
      editor?.commands.clearContent();
    } catch {
      setSubmitState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  }

  if (submitState.status === "success") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle className="text-green-800">Brief Submitted!</CardTitle>
              <CardDescription className="text-green-700">
                We&apos;ve received your project brief and our AI is analyzing it now.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-green-700">
            Your reference ID:{" "}
            <Badge variant="outline" className="font-mono text-xs">
              {submitState.briefId}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            A member of our team will review the analysis and reach out within 1–2 business days.
          </p>
          <Button
            variant="outline"
            onClick={() => setSubmitState({ status: "idle" })}
            className="mt-2"
          >
            Submit another brief
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error banner */}
      {submitState.status === "error" && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="text-sm text-destructive">
            {submitState.message}
            {submitState.retryAfter && (
              <span className="block text-xs opacity-80">
                Try again in {submitState.retryAfter} seconds.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Project Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          placeholder="e.g. E-commerce platform for handmade goods"
          {...register("title")}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description (Tiptap) */}
      <div className="space-y-2">
        <Label>Project Description</Label>
        {/* Toolbar */}
        <div className="flex gap-1 rounded-t-md border border-input bg-muted px-2 py-1">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`rounded p-1 hover:bg-background ${editor?.isActive("bold") ? "bg-background shadow-sm" : ""}`}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`rounded p-1 hover:bg-background ${editor?.isActive("italic") ? "bg-background shadow-sm" : ""}`}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`rounded p-1 hover:bg-background ${editor?.isActive("bulletList") ? "bg-background shadow-sm" : ""}`}
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
        <EditorContent editor={editor} />
        <p className="text-xs text-muted-foreground">
          Describe your project in detail — goals, features, target users. Min 50 characters.
        </p>
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Budget + Timeline */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Budget Range</Label>
          <Select
            onValueChange={(val) =>
              setValue("budgetRange", val as BriefFormValues["budgetRange"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger aria-invalid={!!errors.budgetRange}>
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.budgetRange && (
            <p className="text-xs text-destructive">{errors.budgetRange.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Timeline Urgency</Label>
          <Select
            onValueChange={(val) =>
              setValue("timelineUrgency", val as BriefFormValues["timelineUrgency"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger aria-invalid={!!errors.timelineUrgency}>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {TIMELINE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timelineUrgency && (
            <p className="text-xs text-destructive">{errors.timelineUrgency.message}</p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactName">Your Name</Label>
          <Input
            id="contactName"
            placeholder="Jane Smith"
            {...register("contactName")}
            aria-invalid={!!errors.contactName}
          />
          {errors.contactName && (
            <p className="text-xs text-destructive">{errors.contactName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email Address</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="jane@example.com"
            {...register("contactEmail")}
            aria-invalid={!!errors.contactEmail}
          />
          {errors.contactEmail && (
            <p className="text-xs text-destructive">{errors.contactEmail.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={submitState.status === "loading"}
      >
        {submitState.status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Project Brief"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll analyze your brief with AI and reach out within 1–2 business days.
      </p>
    </form>
  );
}
