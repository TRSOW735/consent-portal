import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="card p-8">
        <div className="text-4xl font-semibold tracking-tight">
          Solana-native payments, with verification built-in.
        </div>
        <p className="text-slate-300 mt-3 max-w-2xl">
          Create Solana Pay payment intents, generate QR codes, confirm settlements by reference, and integrate with webhooks.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link className="btn-primary px-5 py-3" href="/dashboard/payments">Open App</Link>
          <Link className="btn-ghost px-5 py-3" href="/about">Learn more</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="text-lg font-semibold">Fast checkout</div>
          <div className="text-sm text-slate-300 mt-1">QR-based flows that feel native to Solana.</div>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Verified settlement</div>
          <div className="text-sm text-slate-300 mt-1">Reference-based verification (no guesswork).</div>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">B2B-ready</div>
          <div className="text-sm text-slate-300 mt-1">API keys + webhooks for integrations.</div>
        </div>
      </section>

      <section className="card p-8">
        <div className="text-2xl font-semibold">Roadmap</div>
        <ul className="mt-3 space-y-2 text-slate-300">
          <li>• Multi-tenant organizations + Sign-In with Solana</li>
          <li>• Webhook retries + re-delivery controls</li>
          <li>• Production deploy: Postgres + dedicated RPC + monitoring</li>
        </ul>
      </section>
    </div>
  );
}