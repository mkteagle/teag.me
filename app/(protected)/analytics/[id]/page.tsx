"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanHistory } from "@/components/scan-history";
import { processLocationData } from "@/lib/utils/location"; // We'll need to create this
import { LocationMap } from "@/components/analytics/location_map";
import { LineChart } from "@/components/analytics/line-chart";

interface Scan {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  region?: string;
}

export default function AnalyticsPage() {
  const params = useParams();
  const [analytics, setAnalytics] = useState<any>(null);
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

  // Process location data for the map
  const locations = processLocationData(analytics?.scans || []);

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Activity Chart */}
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Scan Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={analytics?.scans || []} />
        </CardContent>
      </Card>

      {/* Location Map */}
      <LocationMap locations={locations} />

      {/* Detailed Scan History */}
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScanHistory scans={analytics?.scans || []} />
        </CardContent>
      </Card>
    </div>
  );
}
