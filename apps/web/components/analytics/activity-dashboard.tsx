import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ActivityTrend, type ActivitySeries } from "./activity-trend";
import type { ActivityFilter, getWorkspaceAnalytics } from "@/lib/activity-analytics";

const codeSeries: ActivitySeries[] = [
  { key: "codeScans", label: "Code scans", color: "#896100" },
  { key: "codeOpens", label: "Code link opens", color: "#2853a4" },
];
const pageSeries: ActivitySeries[] = [
  { key: "pageViews", label: "Page views", color: "#087359" },
  { key: "pageScans", label: "Page QR scans", color: "#8244a4" },
  { key: "pageClicks", label: "Page link clicks", color: "#af4826" },
];
const allSeries = [...codeSeries, ...pageSeries];
const tableDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function ActivityDashboard({ analytics, filter, isSinglePage }: {
  analytics: Awaited<ReturnType<typeof getWorkspaceAnalytics>>;
  filter: ActivityFilter;
  isSinglePage: boolean;
}) {
  const { daily, ranked, totals } = analytics;
  const series = filter === "all" ? allSeries : filter === "codes" ? codeSeries : pageSeries;
  const activeSeries = series.filter(({ key }) => totals[key] > 0);
  const chart = (
    <section aria-labelledby="activity-trend" className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6">
      <h2 id="activity-trend" className="text-xl font-bold">Activity over time</h2>
      <p className="mb-3 text-sm text-muted-foreground">Daily totals in UTC</p>
      {activeSeries.length > 0 ? <>
        <ActivityTrend daily={daily} series={activeSeries} />
        <details className="mt-4 border-t pt-3 text-sm">
          <summary className="min-h-8 cursor-pointer font-semibold">View daily totals</summary>
          <div className="max-h-64 overflow-auto" tabIndex={0} role="region" aria-label="Daily totals in UTC">
            <table className="w-full text-right tabular-nums">
              <thead className="sticky top-0 bg-card">
                <tr>
                  <th scope="col" className="p-2 text-left">Date (UTC)</th>
                  {series.map(({ key, label }) => <th scope="col" key={key} className="p-2">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {daily.map((day) => (
                  <tr key={day.date}>
                    <th scope="row" className="whitespace-nowrap p-2 text-left font-medium">{tableDate.format(new Date(day.date))}</th>
                    {series.map(({ key }) => <td key={key} className="p-2">{day[key].toLocaleString("en-US")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </> : (
        <p className="grid min-h-48 place-items-center rounded-xl border border-dashed px-4 text-center text-sm text-muted-foreground">
          No tracked activity in this date range.
        </p>
      )}
    </section>
  );

  return (
    <div className="space-y-4">
      <dl className="flex flex-wrap gap-3" aria-label="Activity totals">
        {series.map(({ key, label, color }) => (
          <div key={key} className="min-w-[8.5rem] flex-1 rounded-2xl border bg-card p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />{label}
            </dt>
            <dd className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl">{totals[key].toLocaleString("en-US")}</dd>
          </div>
        ))}
      </dl>
      {isSinglePage ? chart : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]">
          {chart}
          <section aria-labelledby="top-activity" className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6">
            <h2 id="top-activity" className="text-xl font-bold">{filter === "codes" ? "Top codes" : filter === "link-pages" ? "Top link pages" : "Most active"}</h2>
            <p className="text-sm text-muted-foreground">Ranked by tracked events</p>
            {ranked.length > 0 ? (
              <ol className="mt-2 divide-y">
                {ranked.map(({ href, source, title, total }) => (
                  <li key={href}>
                    <Link href={href} prefetch={false} className="group block rounded-md py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-semibold group-hover:underline" title={title}>{title}</span>
                        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums">
                          {total.toLocaleString("en-US")}<ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        </span>
                      </div>
                      {filter === "all" && <p className="text-xs text-muted-foreground">{source}</p>}
                      <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${(total / ranked[0].total) * 100}%` }} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-5 text-sm text-muted-foreground">Codes and pages will appear here when they receive activity.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
