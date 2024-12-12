import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Scan {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  region?: string;
}

export function ScanHistory({ scans }: { scans: Scan[] }) {
  // Function to parse user agent for cleaner display
  const parseUserAgent = (userAgent: string) => {
    try {
      // Simplified user agent parsing - you might want to use a library for better parsing
      const isMobile = /mobile/i.test(userAgent);
      const isTablet = /tablet/i.test(userAgent);
      const browser = userAgent.match(
        /(chrome|safari|firefox|edge|opera(?=\/))\/?\s*(\d+)/i
      );
      const os = userAgent.match(/\((.*?)\)/)?.[1].split(";")[0];

      return {
        type: isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop",
        browser: browser?.[1] || "Unknown",
        os: os || "Unknown",
      };
    } catch {
      return { type: "Unknown", browser: "Unknown", os: "Unknown" };
    }
  };

  console.info({ scans });

  return (
    <Card className="hover-lift glassmorphism">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Detailed Scan History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {scans.map((scan) => {
            const deviceInfo = parseUserAgent(scan.userAgent);
            const location = [scan.country, scan.region, scan.city]
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={scan.id}
                className="p-4 rounded-lg bg-secondary/10 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {format(new Date(scan.timestamp), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(scan.timestamp), "HH:mm:ss")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{deviceInfo.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {deviceInfo.browser}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">IP:</span> {scan.ip}
                  </div>
                  {location && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Location:</span>{" "}
                      {location}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Device</TableHead>
                <TableHead className="hidden xl:table-cell">Browser</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => {
                const deviceInfo = parseUserAgent(scan.userAgent);
                return (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(scan.timestamp), "MMM d, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(scan.timestamp), "HH:mm:ss")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{scan.ip}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {[scan.country, scan.region, scan.city]
                        .filter(Boolean)
                        .join(", ") || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deviceInfo.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {deviceInfo.os}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {deviceInfo.browser}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {scans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No scan history available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
