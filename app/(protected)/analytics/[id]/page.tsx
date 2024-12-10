"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ScanHistory } from "@/components/scan-history";

interface Scan {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  region?: string;
}

interface ScanData {
  date: string;
  scans: number;
}

interface LocationStats {
  [key: string]: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const [analytics, setAnalytics] = useState<ScanData[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/analytics/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();

        // Save raw scan data
        setScans(data.scans);

        // Process scans into daily aggregates
        const scansByDate = data.scans.reduce(
          (acc: { [key: string]: number }, scan: Scan) => {
            const date = format(new Date(scan.timestamp), "yyyy-MM-dd");
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {}
        );

        // Process location statistics
        const locations = data.scans.reduce(
          (acc: LocationStats, scan: Scan) => {
            const location = [scan.country, scan.region, scan.city]
              .filter(Boolean)
              .join(", ");
            if (location) {
              acc[location] = (acc[location] || 0) + 1;
            }
            return acc;
          },
          {}
        );

        setLocationStats(locations);

        // Convert to array format for chart
        const chartData = Object.entries(scansByDate).map(([date, count]) => ({
          date,
          scans: count,
        }));

        // Sort by date
        chartData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setAnalytics(chartData as any);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAnalytics();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Card className="hover-lift glassmorphism">
          <CardContent className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="hover-lift glassmorphism">
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Chart Card */}
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Scan Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.375rem",
                  }}
                  labelFormatter={(value) =>
                    format(new Date(value), "MMMM d, yyyy")
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="#4F46E5"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">
                No scan data available yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Statistics Card */}
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(locationStats).map(([location, count]) => (
              <div key={location} className="p-4 rounded-lg bg-secondary/10">
                <div className="font-medium text-primary">{location}</div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">
                  {((count / scans.length) * 100).toFixed(1)}% of total scans
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scans Table */}
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Detailed Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScanHistory scans={scans} />
        </CardContent>
      </Card>
    </div>
  );
}
