"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, KeyRound, Settings, Sparkles, Webhook } from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="h-full w-full">
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(208,180,255,1), rgba(189,224,254,1), rgba(185,251,192,1))",
            }}
          />
          <div>
            <div className="font-semibold leading-tight">Consent Portal</div>
            <div className="text-xs text-slate-300">Solana-native dashboard</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="pill">Devnet</span>
          <span className="pill flex items-center gap-1">
            <Sparkles size={14} /> Beta
          </span>
        </div>

        <nav className="mt-4 space-y-1">
          {nav.map((item) => {
            const active = path.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition border",
                  active
                    ? "bg-white/10 border-white/15 text-white"
                    : "bg-transparent border-transparent text-slate-200 hover:bg-white/5 hover:border-white/10"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 text-xs text-slate-400">
          Tip: para producciÃ³n â†’ RPC dedicado + auth + webhooks.
        </div>
      </div>
    </aside>
  );
}