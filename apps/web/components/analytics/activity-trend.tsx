"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityCounts } from "@/lib/activity-analytics";

export type ActivitySeries = { key: keyof ActivityCounts; label: string; color: string };

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" });

export function ActivityTrend({ daily, series }: {
  daily: ({ date: string } & ActivityCounts)[];
  series: ActivitySeries[];
}) {
  return (
    <div className="h-60 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={daily} margin={{ top: 12, right: 30, bottom: 0, left: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={30} tickFormatter={(date: string) => shortDate.format(new Date(date))}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={10} />
          <YAxis allowDecimals={false} width={42} tickCount={5} domain={[0, "dataMax"]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip labelFormatter={(date) => fullDate.format(new Date(date))}
            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 12 }} />
          {series.map(({ key, label, color }) => (
            <Line key={key} dataKey={key} name={label} stroke={color} strokeWidth={2.5}
              dot={daily.length <= 7 ? { r: 2.5 } : false} activeDot={{ r: 4 }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
