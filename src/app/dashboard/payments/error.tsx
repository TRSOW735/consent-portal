"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-6">
      <div className="text-xl font-semibold">Payments failed to load</div>
      <div className="text-slate-300 mt-2">Try refreshing the page.</div>
      <button className="btn-ghost px-4 py-2 mt-4" onClick={() => reset()}>Retry</button>
    </div>
  );
}