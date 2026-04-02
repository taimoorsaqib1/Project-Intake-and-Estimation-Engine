export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div>
        <div className="h-6 w-24 bg-slate-200 rounded" />
        <div className="h-4 w-56 bg-slate-100 rounded mt-2" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-48 bg-slate-50 rounded" />
          </div>
        ))}
      </div>

      {/* Full-width chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="h-48 bg-slate-50 rounded" />
      </div>
    </div>
  );
}
