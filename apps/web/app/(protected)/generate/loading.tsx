export default function GenerateLoading() {
  return (
    <div className="full-bleed space-y-6 py-8 sm:py-12">
      <div className="h-8 w-56 rounded-md bg-muted animate-pulse" />
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
