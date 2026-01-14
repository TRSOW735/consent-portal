import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });

  if (!org) {
    return (
      <div className="card p-6">
        <div className="text-2xl font-semibold">Settings</div>
        <div className="text-slate-300 mt-2">
          No organization found. Run the seed script or create one from the setup flow.
        </div>
        <div className="text-slate-400 text-sm mt-3">
          Tip: run <code>node tools/seed-default-org.js</code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-3xl font-semibold tracking-tight">Settings</div>
      <div className="card p-6 space-y-2">
        <div><b>Organization:</b> {org.name}</div>
        <div><b>Recipient:</b> {org.recipient}</div>
        <div className="text-slate-300 text-sm">
          Next step: make this page editable (org name, recipient, RPC URL).
        </div>
      </div>
    </div>
  );
}