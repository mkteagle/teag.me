import Link from "next/link";
import { ArrowUpRight, Link2, QrCode } from "lucide-react";
import { HistoryClient } from "@/components/history/history-client";
import { requireUser } from "@/lib/auth-session";
import { getWorkspaceActivity } from "@/lib/link-pages/activity";
import { getAnalyticsRetentionDate, getUserPlan } from "@/lib/plan-enforcement";
import { cn } from "@/lib/utils";

const tabs = [
  ["all", "All activity"], ["codes", "Codes"], ["link-pages", "Link pages"], ["scanner", "Scanner history"],
] as const;

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const selected = tabs.find(([id]) => id === tab)?.[0] ?? "all";
  const user = await requireUser();
  const plan = selected === "scanner" ? null : await getUserPlan(user.id);
  const activity = plan && selected !== "scanner"
    ? await getWorkspaceActivity(user.id, getAnalyticsRetentionDate(plan.plan), selected)
    : [];
  const timeFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return (
    <div className="full-bleed space-y-6 py-8 sm:py-12">
      <div>
        <h1 className="text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">Activity</h1>
        <p className="mt-3 text-muted-foreground">See what people open from your codes and link pages.</p>
      </div>
      <nav aria-label="Activity filters" className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map(([id, label]) => <Link key={id} prefetch={false} href={id === "all" ? "/history" : `/history?tab=${id}`}
          aria-current={id === selected ? "page" : undefined}
          className={cn("inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold",
            id === selected ? "bg-accent/20 text-foreground" : "text-muted-foreground hover:bg-muted")}>{label}</Link>)}
      </nav>
      {selected === "scanner" ? <HistoryClient embedded /> : <>
        {plan?.plan === "FREE" && <p className="text-sm text-muted-foreground">Free shows the last {plan.limits.analyticsRetentionDays} days. <Link href="/upgrade" className="font-semibold underline underline-offset-4">See Pro</Link></p>}
        {activity.length > 0 ? <ul className="divide-y rounded-2xl border">
          {activity.map((item) => {
            const Icon = item.source === "codes" ? QrCode : Link2;
            return <li key={`${item.source}-${item.id}`}>
              <Link prefetch={false} href={item.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/40 sm:gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15"><Icon className="size-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.action}</p>
                  <p className="truncate text-sm text-muted-foreground">{item.title}{item.detail ? ` · ${item.detail}` : ""}</p>
                  <time dateTime={item.timestamp.toISOString()} className="text-xs text-muted-foreground sm:hidden">{timeFormat.format(item.timestamp)} UTC</time>
                </div>
                <time dateTime={item.timestamp.toISOString()} className="hidden shrink-0 text-sm text-muted-foreground sm:block">{timeFormat.format(item.timestamp)} UTC</time>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>;
          })}
        </ul> : <div className="rounded-2xl border px-5 py-10 text-center">
          <h2 className="font-bold">No recent activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">Scans, views, and link clicks will appear here as they happen.</p>
        </div>}
      </>}
    </div>
  );
}
