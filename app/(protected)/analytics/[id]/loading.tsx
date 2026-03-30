export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="h-8 w-64 rounded-md bg-muted animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-7 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="h-5 w-32 rounded bg-muted animate-pulse mb-4" />
          <div className="h-64 w-full rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="h-5 w-28 rounded bg-muted animate-pulse mb-4" />
          <div className="h-64 w-full rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
