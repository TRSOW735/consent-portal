"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, Send, Copy, Trash2, RotateCw, Link as LinkIcon } from "lucide-react";
import { SelectMenu } from "@/components/SelectMenu";

type Endpoint = {
  id: string;
  url: string;
  enabled: boolean;
  events: string[];
  secret: string;
  createdAt: string;
};

type Delivery = {
  id: string;
  event: string;
  status: string;
  attemptCount: number;
  nextAttemptAt: string;
  deliveredAt: string | null;
  paymentRef: string;
  endpoint: { id: string; url: string };
  lastStatus?: number | null;
  lastError?: string | null;
  createdAt: string;
};

export function WebhooksClient({
  initialEndpoints,
  initialDeliveries,
}: {
  initialEndpoints: Endpoint[];
  initialDeliveries: Delivery[];
}) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);

  const [newUrl, setNewUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return deliveries.filter((d) => {
      const okStatus = status === "all" ? true : d.status === status;
      if (!qq) return okStatus;
      const hay = `${d.paymentRef} ${d.event} ${d.status} ${d.endpoint.url}`.toLowerCase();
      return okStatus && hay.includes(qq);
    });
  }, [deliveries, q, status]);

  async function refresh() {
    try {
      const [e, d] = await Promise.all([
        fetch("/api/webhooks/endpoints", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/webhooks/deliveries?status=all&q=", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setEndpoints(e.endpoints || []);
      setDeliveries(d.deliveries || []);
      toast.message("Updated");
    } catch {
      toast.error("Refresh failed");
    }
  }

  async function dispatchNow() {
    try {
      const r = await fetch("/api/webhooks/dispatch", { method: "POST" });
      const data = await r.json();
      toast.success(`Dispatched: ${data.processed ?? 0}`);
      await refresh();
    } catch {
      toast.error("Dispatch failed");
    }
  }

  async function createEndpoint() {
    if (!newUrl.trim()) return toast.error("Enter a webhook URL");
    try {
      setBusy(true);
      const r = await fetch("/api/webhooks/endpoints", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim(), events: ["payment.paid"] }),
      });
      const data = await r.json();
      if (!r.ok) return toast.error(data?.error || "Create failed");
      toast.success("Endpoint created");
      setNewUrl("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function rotateSecret(id: string) {
    try {
      const r = await fetch("/api/webhooks/endpoints/" + id, { method: "POST" });
      const data = await r.json();
      if (!r.ok) return toast.error(data?.error || "Rotate failed");
      toast.success("Secret rotated");
      await refresh();
    } catch {
      toast.error("Rotate failed");
    }
  }

  async function delEndpoint(id: string) {
    if (!confirm("Delete this endpoint?")) return;
    try {
      const r = await fetch("/api/webhooks/endpoints/" + id, { method: "DELETE" });
      if (!r.ok) return toast.error("Delete failed");
      toast.success("Deleted");
      await refresh();
    } catch {
      toast.error("Delete failed");
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  useEffect(() => {
    // light auto-refresh
    const t = setInterval(() => refresh(), 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Webhook endpoints</div>
            <div className="text-sm text-slate-300">Receive events like <code>payment.paid</code>.</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={refresh}><RefreshCw size={16} /> Refresh</button>
            <button className="btn-ghost" onClick={dispatchNow}><Send size={16} /> Dispatch now</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <input
            className="input"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com/webhooks/consent"
          />
          <button className="btn-primary px-4 py-2" onClick={createEndpoint} disabled={busy}>
            <Plus size={16} /> Add endpoint
          </button>
        </div>

        {endpoints.length === 0 ? (
          <div className="card p-5 bg-white/3">
            <div className="font-semibold">No endpoints yet</div>
            <div className="text-sm text-slate-300 mt-1">
              Add one to receive webhooks when a payment is confirmed.
            </div>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-3">URL</th>
                  <th className="text-left py-2 pr-3">Events</th>
                  <th className="text-left py-2 pr-3">Secret</th>
                  <th className="text-right py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((e) => (
                  <tr key={e.id} className="border-b border-white/10">
                    <td className="py-2 pr-3 text-slate-100">
                      <div className="flex items-center gap-2">
                        <LinkIcon size={14} className="opacity-70" />
                        <span className="truncate">{e.url}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-slate-200">{e.events.join(", ")}</td>
                    <td className="py-2 pr-3 text-slate-200">
                      <button className="btn-ghost px-3 py-2" onClick={() => copy(e.secret)}><Copy size={16} /> Copy</button>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <button className="btn-ghost px-3 py-2" onClick={() => rotateSecret(e.id)}>
                        <RotateCw size={16} /> Rotate
                      </button>
                      <button className="btn-ghost px-3 py-2 ml-2" onClick={() => delEndpoint(e.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Deliveries</div>
            <div className="text-sm text-slate-300">History of attempts + retries.</div>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="input"
              style={{ width: 320 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search payment reference / url / status"
            />
            <SelectMenu
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All" },
                { value: "success", label: "Success" },
                { value: "retrying", label: "Retrying" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
              width={160}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-5 bg-white/3">
            <div className="font-semibold">No deliveries yet</div>
            <div className="text-sm text-slate-300 mt-1">
              Once a payment becomes <code>paid</code>, deliveries appear here.
            </div>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-3">Created</th>
                  <th className="text-left py-2 pr-3">Event</th>
                  <th className="text-left py-2 pr-3">Payment ref</th>
                  <th className="text-left py-2 pr-3">Status</th>
                  <th className="text-right py-2 pr-3">Attempts</th>
                  <th className="text-left py-2 pr-3">Next attempt</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-white/10">
                    <td className="py-2 pr-3 text-slate-200 whitespace-nowrap">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-slate-200">{d.event}</td>
                    <td className="py-2 pr-3 text-slate-100">{d.paymentRef}</td>
                    <td className="py-2 pr-3 text-slate-200">{d.status}</td>
                    <td className="py-2 pr-3 text-right text-slate-200">{d.attemptCount}</td>
                    <td className="py-2 pr-3 text-slate-200 whitespace-nowrap">{new Date(d.nextAttemptAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}