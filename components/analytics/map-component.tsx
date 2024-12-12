"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Location } from "@/types/analytics";

interface MapProps {
  locations: Location[];
}

function MapComponent({ locations }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fix the marker icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    if (!mapRef.current) {
      // Initialize the map
      mapRef.current = L.map("map", {
        minZoom: 1.5,
        worldCopyJump: true,
      }).setView([20, 0], 2);

      // Add the dark theme map tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(mapRef.current);

      // Initialize the markers layer group
      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Add markers for each location
    locations.forEach((location) => {
      const size = Math.min(20, Math.max(8, Math.log2(location.count + 1) * 5));

      // Create custom circle marker
      const marker = L.circleMarker([location.lat, location.lng], {
        radius: size,
        fillColor: "hsl(217.2, 91.2%, 59.8%)",
        color: "hsl(217.2, 91.2%, 59.8%)",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.6,
      });

      // Create popup content with dark theme
      const popupContent = `
        <div class="p-2 bg-zinc-900 text-white rounded-lg">
          <div class="font-medium">
            ${
              [location.city, location.region, location.country]
                .filter(Boolean)
                .join(", ") || "Unknown Location"
            }
          </div>
          <div class="text-sm text-zinc-400">
            ${location.count} scan${location.count !== 1 ? "s" : ""}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "dark-theme-popup",
      });

      marker.on("mouseover", function () {
        //@ts-ignore
        this.setStyle({
          fillOpacity: 0.8,
          weight: 3,
        });
      });

      marker.on("mouseout", function () {
        //@ts-ignore
        this.setStyle({
          fillOpacity: 0.6,
          weight: 2,
        });
      });

      markersRef.current?.addLayer(marker);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations]);

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden">
      <div id="map" className="h-full w-full" />
    </div>
  );
}

export default MapComponent;
