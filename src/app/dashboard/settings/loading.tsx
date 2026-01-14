export default function LoadingSettings() {
  return (
    <div className="space-y-4">
      <div className="card p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded-lg" />
        <div className="h-4 w-80 bg-white/6 rounded-lg mt-3" />
      </div>
      <div className="card p-6 animate-pulse">
        <div className="h-10 w-full bg-white/6 rounded-xl" />
        <div className="h-10 w-full bg-white/6 rounded-xl mt-3" />
        <div className="h-10 w-full bg-white/6 rounded-xl mt-3" />
      </div>
    </div>
  );
}