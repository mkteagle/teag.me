export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
      <div className="rounded-xl border bg-card">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
