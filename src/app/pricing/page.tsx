export default function PricingPage() {
  return (
    <div className="space-y-6">
      <section className="card p-8">
        <div className="text-3xl font-semibold tracking-tight">Pricing</div>
        <p className="text-slate-300 mt-3">
          Placeholder pricing (for pilots). Real pricing comes after we validate 2–3 business integrations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="card p-6">
            <div className="text-lg font-semibold">Starter</div>
            <div className="text-slate-300 text-sm mt-1">Basic dashboard + QR checkout</div>
            <div className="text-2xl font-semibold mt-4">$0</div>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold">Pro</div>
            <div className="text-slate-300 text-sm mt-1">Webhooks + higher limits</div>
            <div className="text-2xl font-semibold mt-4">$49/mo</div>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold">Enterprise</div>
            <div className="text-slate-300 text-sm mt-1">SLA + custom integrations</div>
            <div className="text-2xl font-semibold mt-4">Let’s talk</div>
          </div>
        </div>
      </section>
    </div>
  );
}