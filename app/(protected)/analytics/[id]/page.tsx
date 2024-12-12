"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanHistory } from "@/components/analytics/scan-history";
import { processLocationData } from "@/lib/utils/location";
import { LocationMap } from "@/components/analytics/location-map";
import { LineChart } from "@/components/analytics/line-chart";
import { Location, Scan, Analytics } from "@/types/analytics";

export default function AnalyticsPage() {
  const params = useParams();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
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
        setAnalytics(data);

        // Process locations
        const processedLocations = await processLocationData(data.scans);
        setLocations(processedLocations);
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
      <div className="container mx-auto p-8 space-y-8">
        <div className="grid gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover-lift glassmorphism">
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto p-8">
        <Card className="hover-lift glassmorphism">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <p className="text-destructive text-lg">
                {error || "Failed to load analytics"}
              </p>
              <p className="text-muted-foreground">
                Please try again later or contact support if the problem
                persists.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* QR Code Overview */}
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            QR Code Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/20">
            <div className="text-sm text-muted-foreground">Total Scans</div>
            <div className="text-2xl font-bold">{analytics.scans.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Unique Locations
            </div>
            <div className="text-2xl font-bold">{locations.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/20">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="text-2xl font-bold">
              {new Date(analytics.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Chart */}
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Scan Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={analytics.scans} />
        </CardContent>
      </Card>

      {/* Location Map */}
      <LocationMap locations={locations} />

      {/* Scan History */}
      <ScanHistory scans={analytics.scans} />
    </div>
  );
}
