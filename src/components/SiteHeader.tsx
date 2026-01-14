"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (p: string) => (pathname === p ? "bg-white/10" : "hover:bg-white/6");

  return (
    <header className="mx-auto w-full max-w-6xl px-4 py-5">
      <div className="card px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl" style={{ background: "linear-gradient(90deg, rgba(208,180,255,1), rgba(189,224,254,1), rgba(185,251,192,1))" }} />
          <div>
            <div className="font-semibold leading-4">Consent Portal</div>
            <div className="text-xs text-slate-300">Solana-native payments + verified receipts</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link className={"btn-ghost px-3 py-2 " + isActive("/")} href="/">Home</Link>
          <Link className={"btn-ghost px-3 py-2 " + isActive("/about")} href="/about">About</Link>
          <Link className={"btn-ghost px-3 py-2 " + isActive("/pricing")} href="/pricing">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link className="btn-primary px-4 py-2" href="/dashboard/payments">Open App</Link>
        </div>
      </div>
    </header>
  );
}