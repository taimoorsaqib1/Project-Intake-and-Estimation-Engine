import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "./_components/IntakeForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Submit a Project Brief | Veloce",
  description:
    "Tell us about your project. Our AI will analyze your brief and our team will follow up with an estimate.",
};

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Start Your Project
          </h1>
          <p className="mt-2 text-slate-600">
            Fill out the form below and our AI will instantly analyze your brief to
            generate a structured estimate.
          </p>
        </div>

        {/* Form card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Project Brief</CardTitle>
            <CardDescription>
              The more detail you provide, the more accurate your AI-generated estimate will be.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <IntakeForm />
          </CardContent>
        </Card>

        {/* Trust signals */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span>🔒 Secure & confidential</span>
          <span>⚡ AI-powered analysis</span>
          <span>📬 Response within 48h</span>
        </div>
      </div>
    </main>
  );
}
