import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { BarChart3, ClipboardList, CheckCircle2, Clock, Kanban } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [total, byStage, pending] = await Promise.all([
    prisma.brief.count(),
    prisma.brief.groupBy({
      by: ["stage"],
      _count: { _all: true },
    }),
    prisma.briefAnalysis.count({ where: { status: "PENDING" } }),
  ]);

  const won = byStage.find((s) => s.stage === "WON")?._count._all ?? 0;

  return { total, won, pending, byStage };
}

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const { total, won, pending } = await getStats();
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Welcome back, {session.user.name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-1">Here&apos;s what&apos;s happening in your pipeline today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Briefs",
            value: total,
            icon: ClipboardList,
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            border: "border-blue-100",
          },
          {
            label: "Won Projects",
            value: won,
            icon: CheckCircle2,
            bg: "bg-green-50",
            iconColor: "text-green-600",
            border: "border-green-100",
          },
          {
            label: "Pending AI Analysis",
            value: pending,
            icon: Clock,
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
            border: "border-amber-100",
          },
        ].map(({ label, value, icon: Icon, bg, iconColor, border }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border ${border} p-5 flex items-center gap-4 shadow-sm`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/kanban"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
              <Kanban className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-900">Kanban Board</h3>
          </div>
          <p className="text-sm text-slate-500">Manage briefs through the pipeline stages with drag-and-drop.</p>
        </Link>

        {isAdmin && (
          <Link
            href="/dashboard/analytics"
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                <BarChart3 className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-900">Analytics</h3>
            </div>
            <p className="text-sm text-slate-500">Track conversion rates and estimated revenue pipeline.</p>
          </Link>
        )}

        <Link
          href="/dashboard/briefs"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
              <ClipboardList className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-900">All Briefs</h3>
          </div>
          <p className="text-sm text-slate-500">Browse and search all submitted project briefs with filters.</p>
        </Link>
      </div>
    </div>
  );
}
