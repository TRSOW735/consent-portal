"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyField({ label, value }: { label: string; value: string }) {
  const [busy, setBusy] = useState(false);

  async function copy() {
    try {
      setBusy(true);
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-3">
      <div className="text-xs text-slate-300">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <div className="text-sm text-slate-100 break-all flex-1">{value}</div>
        <button className="btn-ghost px-3 py-2" onClick={copy} disabled={busy}>
          <Copy size={16} /> Copy
        </button>
      </div>
    </div>
  );
}