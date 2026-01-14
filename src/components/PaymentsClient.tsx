"use client";

import { useMemo, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { Search, Filter, RefreshCw, Plus, Download, Copy } from "lucide-react";
import { CopyField } from "@/components/CopyField";
import { EmptyState } from "@/components/EmptyState";
import { PaymentDrawer, type PaymentRow } from "@/components/PaymentDrawer";
import { SelectMenu } from "@/components/SelectMenu";

type RangeKey = "today" | "7d" | "30d" | "custom" | "all";

function isoDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function PaymentsClient({ recipient, initial }: { recipient: string; initial: PaymentRow[] }) {
  const [rows, setRows] = useState<PaymentRow[]>(initial);

  // Create payment widget
  const [amount, setAmount] = useState("0.01");
  const [memo, setMemo] = useState("");
  const [reference, setReference] = useState("");
  const [url, setUrl] = useState("");
  const [sig, setSig] = useState("");

  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "pending">("all");

  // Date range
  const [range, setRange] = useState<RangeKey>("30d");
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 7 * 24 * 3600 * 1000)));
  const [to, setTo] = useState(isoDate(new Date()));

  // Drawer (navigates within filtered list)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerList, setDrawerList] = useState<PaymentRow[]>([]);
  const [drawerIndex, setDrawerIndex] = useState(0);

  async function refresh(silent = false) {
    try {
      const r = await fetch("/api/payments-feed", { cache: "no-store" });
      const data = await r.json();
      setRows((data.payments || []) as PaymentRow[]);
      if (!silent) toast.message("Updated");
    } catch {
      if (!silent) toast.error("Refresh failed");
    }
  }

  async function createPayment() {
    setReference(""); setUrl(""); setSig("");

    const r = await fetch("/api/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recipient, amount, memo: memo || undefined }),
    });

    const txt = await r.text();
    if (!r.ok || !txt) {
      toast.error("Failed to create payment");
      return;
    }

    let data: any = null;
    try { data = JSON.parse(txt); } catch { data = null; }
    if (!data?.reference || !data?.url) {
      toast.error("Invalid response");
      return;
    }

    setReference(data.reference);
    setUrl(data.url);
    toast.success("Payment created. Scan the QR to pay.");
    await refresh(true);
  }

  // Poll last created payment
  useEffect(() => {
    if (!reference) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch("/api/payments/" + reference, { cache: "no-store" });
        const data = await r.json();
        if (data?.status === "paid") {
          setSig(data.signature || "");
          toast.success("Payment detected ✅");
          clearInterval(t);
          await refresh(true);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(t);
  }, [reference]);

  const filtered = useMemo(() => {
    const now = new Date();
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    if (range === "today") {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (range === "7d") {
      minDate = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      maxDate = now;
    } else if (range === "30d") {
      minDate = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      maxDate = now;
    } else if (range === "custom") {
      minDate = new Date(from + "T00:00:00");
      maxDate = new Date(to + "T23:59:59");
    }

    return rows.filter((p) => {
      const matchesStatus = status === "all" ? true : p.status === status;
      const hay = (p.reference + " " + (p.signature || "") + " " + p.amount + " " + (p.memo || "")).toLowerCase();
      const matchesQ = q.trim() ? hay.includes(q.toLowerCase()) : true;

      let matchesDate = true;
      if (minDate && maxDate) {
        const d = new Date(p.createdAt);
        matchesDate = d >= minDate && d <= maxDate;
      }

      return matchesStatus && matchesQ && matchesDate;
    });
  }, [rows, q, status, range, from, to]);

  const kpis = useMemo(() => {
    const paid = rows.filter((r) => r.status === "paid");
    const pending = rows.filter((r) => r.status !== "paid");
    const volumePaid = paid.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    return { paidCount: paid.length, pendingCount: pending.length, volumePaid };
  }, [rows]);

  function openDrawerFrom(list: PaymentRow[], index: number) {
    setDrawerList(list);
    setDrawerIndex(index);
    setDrawerOpen(true);
  }

  const selected = drawerList[drawerIndex] ?? null;

  function exportCsv() {
    const cols = ["createdAt", "amount", "status", "reference", "signature", "recipient", "memo"];
    const header = cols.join(",");
    const body = filtered.map((p) => cols.map((c) => csvEscape((p as any)[c])).join(",")).join("\n");
    const csv = header + "\n" + body;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `payments-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast.success("CSV exported");
  }

  async function miniCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="space-y-6">
      <PaymentDrawer
        open={drawerOpen}
        payment={selected}
        onClose={() => setDrawerOpen(false)}
        onRefresh={async () => { await refresh(true); }}
        hasPrev={drawerIndex > 0}
        hasNext={drawerIndex < drawerList.length - 1}
        onPrev={() => setDrawerIndex((i) => Math.max(0, i - 1))}
        onNext={() => setDrawerIndex((i) => Math.min(drawerList.length - 1, i + 1))}
      />

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-slate-300">Paid</div>
          <div className="text-3xl font-semibold">{kpis.paidCount}</div>
          <div className="text-xs text-slate-400 mt-1">Confirmed payments</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-300">Pending</div>
          <div className="text-3xl font-semibold">{kpis.pendingCount}</div>
          <div className="text-xs text-slate-400 mt-1">Not confirmed yet</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-300">Volume (paid)</div>
          <div className="text-3xl font-semibold">{kpis.volumePaid.toFixed(4)} SOL</div>
          <div className="text-xs text-slate-400 mt-1">Confirmed volume</div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">Create payment</div>
              <div className="text-sm text-slate-300">Solana Pay + reference verification</div>
            </div>
            <span className="pill">Recipient fixed</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="label">Recipient</div>
              <input className="input" value={recipient} readOnly />
              <div className="mt-2">
                <CopyField label="Copy recipient" value={recipient} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="label">Amount (SOL)</div>
                <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <div className="label">Memo (optional)</div>
                <input className="input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="order-001 / receipt" />
              </div>
            </div>

            <button className="btn-primary w-full" onClick={createPayment}>
              <Plus size={16} /> Create QR
            </button>
          </div>

          {reference ? (
            <div className="pt-2 space-y-3">
              <CopyField label="Reference" value={reference} />
              <CopyField label="Solana Pay URL" value={url} />
              {sig ? <CopyField label="Signature" value={sig} /> : null}
            </div>
          ) : null}
        </section>

        <section className="card p-6 space-y-4">
          <div className="text-xl font-semibold">QR</div>
          {!url ? (
            <EmptyState title="No QR yet" subtitle="Create a payment to generate a Solana Pay QR." />
          ) : (
            <div className="card p-4 flex items-center justify-center bg-white/3">
              <div className="rounded-2xl p-4 bg-white">
                <QRCodeCanvas value={url} size={260} />
              </div>
            </div>
          )}
          <div className="text-xs text-slate-400">
            Devnet only. The dashboard tracks payments by <b>reference</b>.
          </div>
        </section>
      </div>

      <section className="card p-6 space-y-4">
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-xl font-semibold">Payments</div>
            <div className="text-sm text-slate-300">Search + filters. {filtered.length} results</div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="relative" style={{ minWidth: 280, flex: "1 1 280px" }}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Search reference / signature / memo"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <SelectMenu
              value={status}
              onChange={(v) => setStatus(v as any)}
              leftIcon={<Filter size={16} />}
              options={[
                { value: "all", label: "All" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
              ]}
              width={150}
            />

            <SelectMenu
              value={range}
              onChange={(v) => setRange(v as any)}
              options={[
                { value: "30d", label: "Last 30d" },
                { value: "7d", label: "Last 7d" },
                { value: "today", label: "Today" },
                { value: "custom", label: "Custom" },
                { value: "all", label: "All time" },
              ]}
              width={160}
            />

            <button className="btn-ghost" onClick={() => refresh()}>
              <RefreshCw size={16} /> Refresh
            </button>

            <button className="btn-ghost" onClick={exportCsv}>
              <Download size={16} /> Export CSV
            </button>
          </div>

          {range === "custom" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <div className="label">From</div>
                <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <div className="label">To</div>
                <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No payments found" subtitle="Try changing filters or create a new payment." />
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-3">Date</th>
                  <th className="text-right py-2 pr-3">Amount</th>
                  <th className="text-left py-2 pr-3">Status</th>
                  <th className="text-left py-2 pr-3">Reference</th>
                  <th className="text-left py-2 pr-3">Signature</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr
                    key={p.reference}
                    className={
                      "group border-b border-white/10 cursor-pointer " +
                      (idx % 2 === 0 ? "bg-white/0" : "bg-white/3") +
                      " hover:bg-white/10"
                    }
                    onClick={() => openDrawerFrom(filtered, idx)}
                    title="Click to open details"
                  >
                    <td className="py-2 pr-3 whitespace-nowrap text-slate-200">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right text-slate-200">{p.amount}</td>
                    <td className="py-2 pr-3">
                      {p.status === "paid" ? (
                        <span className="pill" style={{ borderColor: "rgba(185,251,192,0.35)", background: "rgba(185,251,192,0.08)" }}>paid</span>
                      ) : (
                        <span className="pill" style={{ borderColor: "rgba(189,224,254,0.35)", background: "rgba(189,224,254,0.08)" }}>pending</span>
                      )}
                    </td>

                    <td className="py-2 pr-3 text-slate-200" style={{ maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <div className="flex items-center gap-2">
                        <span className="truncate">{p.reference}</span>
                        <button
                          className="btn-ghost px-2 py-2 opacity-0 group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); miniCopy(p.reference); }}
                          title="Copy reference"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="py-2 pr-3 text-slate-300" style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <div className="flex items-center gap-2">
                        <span className="truncate">{p.signature ?? "-"}</span>
                        {p.signature ? (
                          <button
                            className="btn-ghost px-2 py-2 opacity-0 group-hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); miniCopy(p.signature!); }}
                            title="Copy signature"
                          >
                            <Copy size={14} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-xs text-slate-400 mt-3">
              Tip: click a row to open the drawer. Use ← / → to navigate between payments.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}