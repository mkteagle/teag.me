export default function HistoryLoading() {
  return (
    <div className="full-bleed py-8 sm:py-12">
      <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
      <div className="mt-10 space-y-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
