// components/analytics/interaction-history.tsx
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
import {
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Scan,
  MousePointer,
} from "lucide-react";

interface InteractionProps {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  region?: string;
  type?: string;
  source?: string;
  medium?: string;
  device?: string;
  browser?: string;
}

function getDeviceIcon(type: string | undefined) {
  switch (type?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    case "desktop":
      return <Monitor className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
}

function getTypeIcon(type: string | undefined) {
  return type === "scan" ? (
    <Scan className="h-4 w-4" />
  ) : (
    <MousePointer className="h-4 w-4" />
  );
}

function getSourceBadgeColor(source: string | undefined) {
  switch (source?.toLowerCase()) {
    case "facebook":
      return "bg-blue-500";
    case "instagram":
      return "bg-pink-500";
    case "twitter":
      return "bg-blue-400";
    case "linkedin":
      return "bg-blue-600";
    default:
      return "bg-gray-500";
  }
}

export function InteractionHistory({
  interactions,
}: {
  interactions: InteractionProps[];
}) {
  return (
    <Card className="hover-lift glassmorphism">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Detailed Interaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="p-4 rounded-lg bg-secondary/10 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {format(new Date(interaction.timestamp), "MMM d, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(interaction.timestamp), "HH:mm:ss")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium flex items-center justify-end gap-2">
                    {getDeviceIcon(interaction.device)}
                    {interaction.device || "Unknown Device"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {interaction.browser}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(interaction.type)}
                  <span className="text-sm">
                    {interaction.type === "scan" ? "QR Scan" : "Link Click"}
                  </span>
                </div>
                {interaction.source && (
                  <div
                    className={`px-2 py-1 rounded text-xs text-white ${getSourceBadgeColor(
                      interaction.source
                    )}`}
                  >
                    {interaction.source}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {interaction.country && (
                  <div className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {[
                        interaction.city,
                        interaction.region,
                        interaction.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Device</TableHead>
                <TableHead className="hidden xl:table-cell">Browser</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.map((interaction) => (
                <TableRow key={interaction.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {format(new Date(interaction.timestamp), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(interaction.timestamp), "HH:mm:ss")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(interaction.type)}
                      <span>
                        {interaction.type === "scan" ? "QR Scan" : "Link Click"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {interaction.source && (
                      <div
                        className={`px-2 py-1 rounded text-xs text-white inline-block ${getSourceBadgeColor(
                          interaction.source
                        )}`}
                      >
                        {interaction.source}
                      </div>
                    )}
                    {interaction.medium && (
                      <div className="text-xs text-muted-foreground mt-1">
                        via {interaction.medium}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {[interaction.country, interaction.region, interaction.city]
                      .filter(Boolean)
                      .join(", ") || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(interaction.device)}
                      <span>{interaction.device || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {interaction.browser || "Unknown"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {interactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No interaction history available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
