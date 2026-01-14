"use client";

import { useEffect } from "react";
import { X, ArrowLeft, ArrowRight, ExternalLink, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";

export type PaymentRow = {
  createdAt: string;
  amount: string;
  status: string;
  reference: string;
  signature?: string | null;
  recipient: string;
  memo?: string | null;
};

function explorerTx(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
function explorerAddress(pk: string) {
  return `https://explorer.solana.com/address/${pk}?cluster=devnet`;
}

export function PaymentDrawer({
  open,
  payment,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onRefresh,
}: {
  open: boolean;
  payment: PaymentRow | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onRefresh: () => Promise<void>;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hasPrev, hasNext, onClose, onPrev, onNext]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  async function reverify() {
    if (!payment) return;
    try {
      const r = await fetch("/api/payments/" + payment.reference, { cache: "no-store" });
      const data = await r.json();
      if (data?.status === "paid") toast.success("Verified: paid ✅");
      else toast.message("Still pending");
      await onRefresh();
    } catch {
      toast.error("Re-verify failed");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[420px] max-w-[92vw] card p-0 overflow-hidden">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm text-slate-300">Payment</div>
              <div className="font-semibold truncate">{payment?.reference ?? "—"}</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn-ghost px-3 py-2" onClick={onPrev} disabled={!hasPrev} title="Prev (←)">
                <ArrowLeft size={16} />
              </button>
              <button className="btn-ghost px-3 py-2" onClick={onNext} disabled={!hasNext} title="Next (→)">
                <ArrowRight size={16} />
              </button>
              <button className="btn-ghost px-3 py-2" onClick={onClose} title="Close (Esc)">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="px-4 pb-4 flex items-center gap-2">
            <button className="btn-ghost px-3 py-2" onClick={reverify}>
              <RefreshCw size={16} /> Re-verify
            </button>
            {payment?.signature ? (
              <a className="btn-ghost px-3 py-2" href={explorerTx(payment.signature)} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> Explorer (tx)
              </a>
            ) : null}
            {payment?.recipient ? (
              <a className="btn-ghost px-3 py-2" href={explorerAddress(payment.recipient)} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> Explorer (recipient)
              </a>
            ) : null}
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-auto h-[calc(100%-120px)]">
          {!payment ? (
            <div className="text-slate-300">No payment selected.</div>
          ) : (
            <>
              <div className="card p-4">
                <div className="text-xs text-slate-400">Status</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-lg font-semibold">{payment.status}</div>
                  <div className="text-slate-300">{payment.amount} SOL</div>
                </div>
                <div className="text-xs text-slate-400 mt-2">Created</div>
                <div className="text-sm text-slate-200">{new Date(payment.createdAt).toLocaleString()}</div>
              </div>

              <div className="card p-4">
                <div className="text-xs text-slate-400">Reference</div>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <div className="text-sm text-slate-100 break-all">{payment.reference}</div>
                  <button className="btn-ghost px-3 py-2" onClick={() => copy(payment.reference)}><Copy size={16} /> Copy</button>
                </div>
              </div>

              <div className="card p-4">
                <div className="text-xs text-slate-400">Signature</div>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <div className="text-sm text-slate-100 break-all">{payment.signature ?? "-"}</div>
                  {payment.signature ? (
                    <button className="btn-ghost px-3 py-2" onClick={() => copy(payment.signature!)}><Copy size={16} /> Copy</button>
                  ) : null}
                </div>
              </div>

              <div className="card p-4">
                <div className="text-xs text-slate-400">Recipient</div>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <div className="text-sm text-slate-100 break-all">{payment.recipient}</div>
                  <button className="btn-ghost px-3 py-2" onClick={() => copy(payment.recipient)}><Copy size={16} /> Copy</button>
                </div>
              </div>

              <div className="card p-4">
                <div className="text-xs text-slate-400">Memo</div>
                <div className="mt-1 text-sm text-slate-100 break-all">{payment.memo ?? "-"}</div>
              </div>

              <div className="text-xs text-slate-400">
                Tip: use ← / → to move through payments without closing the drawer.
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}