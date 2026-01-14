"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function SettingsForm({
  initial,
}: {
  initial: { name: string; recipient: string; rpcUrl: string };
}) {
  const [name, setName] = useState(initial.name);
  const [recipient, setRecipient] = useState(initial.recipient);
  const [rpcUrl, setRpcUrl] = useState(initial.rpcUrl);
  const [busy, setBusy] = useState(false);

  async function save() {
    try {
      setBusy(true);
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, recipient, rpcUrl }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data?.error ? String(data.error) : "Save failed");
        return;
      }
      toast.success("Settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-6 space-y-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-slate-300">Configure your organization + runtime RPC.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="label">Organization name</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Store" />
        </div>

        <div>
          <div className="label">Recipient (wallet)</div>
          <input className="input" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Solana address" />
          <div className="text-xs text-slate-400 mt-1">
            This is where payments will be settled.
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="label">RPC URL (optional)</div>
          <input
            className="input"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            placeholder="https://your-devnet-rpc..."
          />
          <div className="text-xs text-slate-400 mt-1">
            Leave empty to use <code>SOLANA_RPC_URL</code> or the default Devnet RPC.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button className="btn-primary px-4 py-2" onClick={save} disabled={busy}>
          <Save size={16} /> Save
        </button>
      </div>
    </section>
  );
}