export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-10">
      <div className="card px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-slate-300">
          © {new Date().getFullYear()} Consent Portal. Built for Solana.
        </div>
        <div className="text-xs text-slate-400">
          Devnet preview — production includes auth, webhooks, Postgres, and monitoring.
        </div>
      </div>
    </footer>
  );
}