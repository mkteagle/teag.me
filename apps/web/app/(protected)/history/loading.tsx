export default function HistoryLoading() {
  return (
    <div className="full-bleed space-y-6 py-8 sm:py-12" role="status">
      <span className="sr-only">Loading activity</span>
      <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
      <div className="h-11 animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 min-w-[8.5rem] flex-1 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]">
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        <div className="hidden animate-pulse rounded-2xl bg-muted lg:block" />
      </div>
    </div>
  );
}
