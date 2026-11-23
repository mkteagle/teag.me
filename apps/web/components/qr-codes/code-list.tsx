import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { RowActions } from "./row-actions";
import type { ExtendedQRCode, QRTableProps } from "./types";

const dayMilliseconds = 86_400_000;
function ScanTrend({ scans, trendDays }: { scans: ExtendedQRCode["scans"]; trendDays: number }) {
  const lastDay = Math.floor(Date.now() / dayMilliseconds);
  const firstDay = lastDay - trendDays + 1;
  const days = Array.from({ length: trendDays }, () => ({ count: 0 }));

  for (const scan of scans ?? []) {
    const day = Math.floor(new Date(scan.timestamp).getTime() / dayMilliseconds) - firstDay;
    if (days[day]) days[day].count++;
  }

  if (!days.some(({ count }) => count > 0)) return null;
  return (
    <div className="hidden w-full pr-3 lg:block" role="img" aria-label={`Scan trend over the last ${trendDays} days`}>
      <ResponsiveContainer width="100%" height={42}>
        <AreaChart data={days} accessibilityLayer={false} margin={{ top: 3, right: 2, bottom: 0, left: 2 }}>
          <Area dataKey="count" type="monotone" stroke="hsl(var(--accent))" strokeWidth={1.8} fill="hsl(var(--primary) / 0.22)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function destinationLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function CodeList({ qrCodes, trendDays = 14, onArchive, onDelete, onEdit }: QRTableProps & { trendDays?: number }) {
  return (
    <table className="w-full table-fixed text-left">
      <thead>
        <tr className="border-b text-sm">
          <th scope="col" className="w-[4.5rem] py-3 pr-2 font-semibold text-muted-foreground sm:w-28">Code</th>
          <th scope="col" className="py-3 pr-2 font-semibold text-muted-foreground">Destination</th>
          <th scope="col" className="w-[3.25rem] py-3 font-semibold text-muted-foreground sm:w-24 lg:w-28 xl:w-[12%]">Scans</th>
          <th scope="col" className="hidden w-40 py-3 lg:table-cell xl:w-[18%]"><span className="sr-only">Recent scan trend</span></th>
          <th scope="col" className="w-11 py-3 text-right sm:w-14"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {qrCodes.map((qr) => {
          const destination = qr.ogTitle?.trim() || destinationLabel(qr.redirectUrl);
          const details = `/analytics/${encodeURIComponent(qr.id)}`;
          return (
            <tr key={qr.id} className="border-b last:border-0">
              <td className="py-3 pr-2 sm:py-4">
                <Link href={details} tabIndex={-1} aria-hidden="true" className="block w-fit">
                  <img alt="" width={80} height={80} loading="lazy" src={qr.base64} className="size-14 rounded-lg border bg-white p-1 sm:size-20" />
                </Link>
              </td>
              <td className="min-w-0 py-3 pr-2 sm:py-4">
                <Link href={details} className="group block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                  <span className="block truncate text-base font-bold tracking-tight group-hover:underline sm:text-[1.35rem]">{destination}</span>
                  <span className="block truncate text-xs text-muted-foreground sm:text-sm" title={qr.redirectUrl}>{qr.redirectUrl}</span>
                  <span className="sr-only">View scan analytics</span>
                </Link>
              </td>
              <td className="py-3 font-bold tabular-nums sm:py-4 sm:text-xl">{(qr.scans?.length ?? 0).toLocaleString()}</td>
              <td className="hidden py-4 lg:table-cell"><ScanTrend scans={qr.scans} trendDays={trendDays} /></td>
              <td className="py-3 sm:py-4"><RowActions qrCode={qr} onArchive={onArchive} onDelete={onDelete} onEdit={onEdit} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
