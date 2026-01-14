export default function LoadingPayments() {
  return (
    <div className="space-y-4">
      <div className="card p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded-lg" />
        <div className="h-4 w-96 bg-white/6 rounded-lg mt-3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 w-24 bg-white/10 rounded-lg" />
            <div className="h-8 w-20 bg-white/6 rounded-lg mt-3" />
          </div>
        ))}
      </div>
      <div className="card p-6 animate-pulse">
        <div className="h-10 w-full bg-white/6 rounded-xl" />
        <div className="h-40 w-full bg-white/4 rounded-xl mt-4" />
      </div>
    </div>
  );
}