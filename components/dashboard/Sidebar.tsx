"use client";

import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  ClipboardList,
  Kanban,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, adminOnly: false },
  { href: "/dashboard/kanban", label: "Kanban", icon: Kanban, adminOnly: false },
  { href: "/dashboard/briefs", label: "Briefs", icon: ClipboardList, adminOnly: false },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight leading-none">Veloce</span>
          <p className="text-[11px] text-slate-400 mt-0.5 capitalize font-medium">
            {isAdmin ? "Admin" : "Reviewer"}
          </p>
        </div>
      </div>

      <Separator className="bg-slate-700/60" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/60 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-400" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <p className="text-[11px] text-slate-500 text-center">AI Intake Engine · v1.0</p>
      </div>
    </aside>
  );
}
