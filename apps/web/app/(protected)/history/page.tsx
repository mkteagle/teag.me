import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Link2, QrCode } from "lucide-react";
import { ActivityDashboard } from "@/components/analytics/activity-dashboard";
import { HistoryClient } from "@/components/history/history-client";
import { getWorkspaceAnalytics } from "@/lib/activity-analytics";
import { requireUser } from "@/lib/auth-session";
import { getWorkspaceActivity } from "@/lib/link-pages/activity";
import { ownerLinkPage } from "@/lib/link-pages/store";
import { getAnalyticsRetentionDate, getUserPlan } from "@/lib/plan-enforcement";
import { cn } from "@/lib/utils";

const tabs = [
  ["all", "Overview"], ["codes", "Codes"], ["link-pages", "Link pages"], ["scanner", "Scanner history"],
] as const;
const timeFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

function activityHref(tab: string, days?: number, pageId?: string) {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("tab", tab);
  if (days && tab !== "scanner") params.set("days", String(days));
  if (pageId) params.set("page", pageId);
  return params.size ? `/history?${params}` : "/history";
}

export default async function HistoryPage({ searchParams }: {
  searchParams: Promise<{ tab?: string; days?: string; page?: string }>;
}) {
  const { tab, days, page } = await searchParams;
  const selected = tabs.find(([id]) => id === tab)?.[0] ?? "all";
  const user = await requireUser();
  const pageId = selected === "link-pages" && typeof page === "string" && page ? page : undefined;
  const [plan, linkPage] = await Promise.all([
    selected === "scanner" ? null : getUserPlan(user.id),
    pageId ? ownerLinkPage(pageId, user.id) : null,
  ]);
  const ranges = plan?.plan === "FREE" ? [plan.limits.analyticsRetentionDays] : [7, 30, 90];
  const range = ranges.find((value) => String(value) === days) ?? (plan?.plan === "FREE" ? ranges[0] : 30);
  if (pageId && !linkPage) redirect(activityHref("link-pages", range));

  const retentionDate = plan ? getAnalyticsRetentionDate(plan.plan) : null;
  const now = new Date();
  const since = new Date(now);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - range + 1);
  const [analytics, activity] = selected === "scanner" ? [null, []] : await Promise.all([
    getWorkspaceAnalytics(user.id, { days: range, now, since: retentionDate && retentionDate > since ? retentionDate : since }, selected, pageId),
    getWorkspaceActivity(user.id, retentionDate, selected, pageId),
  ]);

  return (
    <div className="full-bleed space-y-6 py-8 sm:py-12">
      <div>
        {linkPage && (
          <Link prefetch={false} href={activityHref("link-pages", range)} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" /> All link page analytics
          </Link>
        )}
        <h1 className="break-words text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">{linkPage?.draft.name || "Activity"}</h1>
        <p className="mt-3 text-muted-foreground">{linkPage ? `Analytics for teag.me/u/${linkPage.slug}` : "Track how people use your codes and link pages."}</p>
      </div>
      <nav aria-label="Activity filters" className="flex flex-wrap gap-1 border-b pb-4 sm:gap-2">
        {tabs.map(([id, label]) => <Link key={id} prefetch={false} href={activityHref(id, range)}
          aria-current={id === selected ? "page" : undefined}
          className={cn("inline-flex min-h-9 items-center rounded-full px-2 text-xs font-semibold sm:px-3 sm:text-sm",
            id === selected ? "bg-accent/20 text-foreground" : "text-muted-foreground hover:bg-muted")}>{label}</Link>)}
      </nav>
      {selected === "scanner" ? <HistoryClient embedded /> : analytics && <>
        {plan?.plan === "FREE" ? (
          <p className="text-sm text-muted-foreground">Free shows the last {range} days. <Link href="/upgrade" className="font-semibold underline underline-offset-4">See Pro</Link></p>
        ) : (
          <nav aria-label="Analytics date range" className="flex flex-wrap gap-2">
            {ranges.map((value) => <Link key={value} prefetch={false} href={activityHref(selected, value, pageId)}
              aria-current={value === range ? "true" : undefined}
              className={cn("inline-flex min-h-9 items-center rounded-full border px-2.5 text-xs font-semibold sm:px-3 sm:text-sm",
                value === range ? "border-accent bg-accent/15 text-foreground" : "text-muted-foreground hover:bg-muted")}>
              Last {value} days
            </Link>)}
          </nav>
        )}
        <ActivityDashboard analytics={analytics} filter={selected} isSinglePage={Boolean(linkPage)} />
        <section aria-labelledby="recent-activity" className="space-y-3 pt-2">
          <h2 id="recent-activity" className="text-xl font-bold">Recent activity</h2>
          {activity.length > 0 ? <ul className="divide-y rounded-2xl border">
            {activity.map((item) => {
              const Icon = item.source === "codes" ? QrCode : Link2;
              return <li key={`${item.source}-${item.id}`}>
                <Link prefetch={false} href={item.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/40 sm:gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15"><Icon className="size-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.action}</p>
                    <p className="truncate text-sm text-muted-foreground">{item.title}{item.detail ? ` · ${item.detail}` : ""}</p>
                    {item.location && <p className="text-xs text-muted-foreground">Approximate location · {item.location}</p>}
                    <time dateTime={item.timestamp.toISOString()} className="text-xs text-muted-foreground sm:hidden">{timeFormat.format(item.timestamp)} UTC</time>
                  </div>
                  <time dateTime={item.timestamp.toISOString()} className="hidden shrink-0 text-sm text-muted-foreground sm:block">{timeFormat.format(item.timestamp)} UTC</time>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>;
            })}
          </ul> : <div className="rounded-2xl border px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">Scans, views, and link clicks will appear here as they happen.</p>
          </div>}
        </section>
      </>}
    </div>
  );
}
