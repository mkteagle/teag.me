// components/analytics/location-map.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Use a reliable CDN-hosted GeoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Location {
  country?: string;
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
  count: number;
}

interface LocationMapProps {
  locations: Location[];
}

export function LocationMap({ locations }: LocationMapProps) {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(position: any) {
    setPosition(position);
  }

  const getMarkerSize = (count: number) => {
    const min = 5;
    const max = 20;
    return Math.min(max, Math.max(min, Math.log2(count + 1) * 5));
  };

  return (
    <Card className="hover-lift glassmorphism">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Scan Locations
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({locations.length} locations)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[500px] w-full">
          <ComposableMap
            projectionConfig={{ scale: 147 }}
            className="h-full w-full bg-muted/5 rounded-lg"
          >
            <ZoomableGroup
              zoom={position.zoom}
              //@ts-ignore
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "hsl(var(--accent))",
                          outline: "none",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                    />
                  ))
                }
              </Geographies>
              {locations.map((location, index) =>
                location.lat && location.lng ? (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Marker coordinates={[location.lng, location.lat]}>
                          <circle
                            r={getMarkerSize(location.count)}
                            fill="hsl(var(--primary))"
                            fillOpacity={0.7}
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            className="animate-pulse cursor-pointer"
                          />
                        </Marker>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {[location.city, location.region, location.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {location.count} scan
                            {location.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null
              )}
            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              -
            </button>
          </div>
        </div>

        {/* Location list */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="text-sm">
                <div className="font-medium">
                  {[location.city, location.region, location.country]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                <div className="text-muted-foreground">
                  {location.count} scan{location.count !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
