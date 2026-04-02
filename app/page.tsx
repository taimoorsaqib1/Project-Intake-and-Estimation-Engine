import Link from "next/link";
import { Zap, BarChart3, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-16">
      {/* Hero card */}
      <div className="w-full max-w-2xl text-center">
        {/* Logo mark */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3">
          Veloce
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
          AI-Powered Project
          <span className="text-blue-400"> Intake</span>
        </h1>
        <p className="mt-4 text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
          Submit project briefs, get instant AI analysis, and manage your entire estimation pipeline — all in one place.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/intake"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
          >
            Submit a Brief
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5"
          >
            Team Login
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-600 hover:border-slate-500 bg-transparent px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-all hover:-translate-y-0.5"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-16 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Zap,
            title: "Instant AI Analysis",
            body: "Every brief is automatically analyzed for features, effort estimate, and complexity score.",
          },
          {
            icon: BarChart3,
            title: "Pipeline Dashboard",
            body: "Manage briefs from intake to close with a live Kanban board and analytics.",
          },
          {
            icon: ShieldCheck,
            title: "Role-Based Access",
            body: "Admins manage the full pipeline. Reviewers focus only on their assigned briefs.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left backdrop-blur hover:bg-white/8 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <Icon className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-xs text-slate-600">
        © {new Date().getFullYear()} Veloce · AI Intake &amp; Estimation Engine
      </p>
    </main>
  );
}
