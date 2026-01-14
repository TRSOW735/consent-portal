"use client";

import { Sparkles } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  subtitle = "Create your first item to get started.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center">
      <div className="h-12 w-12 rounded-2xl bg-white/6 flex items-center justify-center">
        <Sparkles size={18} className="text-slate-200" />
      </div>
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-300 max-w-sm">{subtitle}</div>
    </div>
  );
}