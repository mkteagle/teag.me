// components/qr-codes/qr-table-mobile.tsx
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { RowActions } from "./row-actions";
import { formatDate } from "./utils";
import type { QRTableProps } from "./types";

interface MobileTableProps extends Pick<QRTableProps, "qrCodes" | "onDelete"> {
  handleRowClick: (id: string) => void;
}

export function MobileTable({
  qrCodes,
  onDelete,
  handleRowClick,
}: MobileTableProps) {
  return (
    <div className="md:hidden space-y-4">
      {qrCodes.map((qr) => (
        <Card
          key={qr.id}
          className="hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => handleRowClick(qr.id)}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Image
                src={qr.base64}
                height={60}
                width={60}
                alt={`QR Code for ${qr.redirectUrl}`}
                className="dark:invert"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium truncate">
                      {new URL(qr.redirectUrl).hostname}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {qr.redirectUrl}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{formatDate(qr.createdAt, "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Scans</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{qr.scans.length}</span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {
                            new Set(
                              qr.scans.map((s) => s.country).filter(Boolean)
                            ).size
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  {qr.scans[0] && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Last Scan</p>
                      <div className="flex items-center justify-between">
                        <p>
                          {formatDate(qr.scans[0].timestamp, "MMM d, h:mm a")}
                        </p>
                        {qr.scans[0].country && (
                          <span className="text-xs text-muted-foreground">
                            from {qr.scans[0].country}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <RowActions qrCode={qr} onDelete={onDelete} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
