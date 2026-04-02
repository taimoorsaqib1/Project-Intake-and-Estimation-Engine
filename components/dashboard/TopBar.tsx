"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sseRegistry } from "@/lib/sse-registry";
import { ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface TopBarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  title?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopBar({ user, title }: TopBarProps) {
  const isAdmin = user.role === "ADMIN";

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-base font-semibold text-slate-800">
        {title ?? "Dashboard"}
      </h1>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span
          className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
            isAdmin
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {isAdmin ? "Admin" : "Reviewer"}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 outline-none">
            {/* Initials avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white leading-none">
                {getInitials(user.name)}
              </span>
            </div>
            <span className="hidden sm:block font-medium">{user.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { sseRegistry.closeAll(); signOut({ callbackUrl: "/login" }); }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
