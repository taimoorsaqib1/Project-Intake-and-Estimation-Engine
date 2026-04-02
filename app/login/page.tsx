import type { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Veloce",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-xs text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold mb-3">Veloce</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            AI-powered project intake and estimation engine. Manage your pipeline, review briefs, and collaborate with your team.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            {[
              { label: "AI Analysis", desc: "Instant brief scoring" },
              { label: "Kanban Board", desc: "Visual pipeline" },
              { label: "Real-time SSE", desc: "Live updates" },
              { label: "Team Roles", desc: "Admin & Reviewer" },
            ].map(({ label, desc }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Veloce</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1 text-sm">Sign in to the internal dashboard</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
