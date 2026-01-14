"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  subtitle = "Try again in a moment.",
  onRetry,
}: {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card p-6 flex items-start gap-4">
      <div className="h-10 w-10 rounded-2xl bg-white/6 flex items-center justify-center">
        <AlertTriangle size={18} className="text-slate-200" />
      </div>
      <div className="flex-1">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-slate-300 mt-1">{subtitle}</div>
        {onRetry ? (
          <button className="btn-ghost mt-4" onClick={onRetry}>
            <RotateCw size={16} /> Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}