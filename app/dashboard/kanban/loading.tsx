const COLUMNS = ["NEW", "UNDER REVIEW", "PROPOSAL SENT", "WON", "ARCHIVED"];

export default function KanbanLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-100 rounded mt-2" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col} className="min-w-[280px] bg-slate-100 rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-5 w-5 bg-slate-200 rounded-full" />
            </div>
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-slate-100 rounded-full" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
