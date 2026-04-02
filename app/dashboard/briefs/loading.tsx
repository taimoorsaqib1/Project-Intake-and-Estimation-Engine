export default function BriefsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
      <div>
        <div className="h-6 w-28 bg-slate-200 rounded" />
        <div className="h-4 w-48 bg-slate-100 rounded mt-2" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex gap-8">
          {["w-24", "w-16", "w-16", "w-20", "w-20", "w-20"].map((w, i) => (
            <div key={i} className={`h-3 ${w} bg-slate-200 rounded`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-8 px-4 py-3 border-b border-slate-50">
            <div className="h-4 w-40 bg-slate-100 rounded" />
            <div className="h-4 w-16 bg-slate-100 rounded-full" />
            <div className="h-4 w-14 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-8 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
