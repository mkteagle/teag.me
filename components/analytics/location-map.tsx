"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Location } from "@/types/analytics";

interface LocationMapProps {
  locations: Location[];
  className?: string;
}

// Create a dynamic map component that will only be loaded client-side
const Map = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-lg flex items-center justify-center bg-muted/20">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  ),
});

export function LocationMap({ locations, className }: LocationMapProps) {
  return (
    <Card className={cn("hover-lift glassmorphism", className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Scan Locations
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({locations.length} locations)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Map locations={locations} />
      </CardContent>
    </Card>
  );
}
