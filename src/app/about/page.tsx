export default function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="card p-8">
        <div className="text-3xl font-semibold tracking-tight">About</div>
        <p className="text-slate-300 mt-3 max-w-3xl">
          Consent Portal is a Solana-native payments dashboard designed for businesses that want fast QR checkout,
          verifiable settlement, and clean B2B integrations.
        </p>
        <p className="text-slate-300 mt-3 max-w-3xl">
          This is currently running on Devnet. The production plan includes auth, multi-tenant orgs, hardened webhooks, and Postgres.
        </p>
      </section>
    </div>
  );
}