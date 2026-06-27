// components/qr-codes/qr-table-desktop.tsx
import Image from "next/image";
import { User as UserIcon, MapPin, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowActions } from "./row-actions";
import { formatDate } from "./utils";
import type { QRTableProps } from "./types";

interface DesktopTableProps
  extends Pick<QRTableProps, "qrCodes" | "onDelete" | "onArchive" | "onEdit" | "showUserInfo"> {
  handleRowClick: (id: string) => void;
}

export function DesktopTable({
  qrCodes,
  showUserInfo = false,
  onDelete,
  onArchive,
  onEdit,
  handleRowClick,
}: DesktopTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-border hover:bg-transparent">
            <TableHead className="font-mono font-semibold text-foreground uppercase text-xs">Code</TableHead>
            {showUserInfo && <TableHead className="font-mono font-semibold text-foreground uppercase text-xs">User</TableHead>}
            <TableHead className="font-mono font-semibold text-foreground uppercase text-xs">Destination</TableHead>
            <TableHead className="font-mono font-semibold text-foreground uppercase text-xs">Created</TableHead>
            <TableHead className="font-mono font-semibold text-foreground uppercase text-xs">Scans</TableHead>
            <TableHead className="font-mono font-semibold text-foreground uppercase text-xs">Activity</TableHead>
            <TableHead className="text-right font-mono font-semibold text-foreground uppercase text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qrCodes.map((qr, index) => (
            <TableRow
              key={qr.id}
              className="cursor-pointer border-b border-border hover:bg-primary/5 transition-colors group"
              onClick={() => handleRowClick(qr.id)}
              style={{
                animationDelay: `${index * 30}ms`,
              }}
            >
              <TableCell className="py-4">
                <div className="relative">
                  <Image
                    src={qr.base64}
                    height={48}
                    width={48}
                    alt={`QR Code for ${qr.redirectUrl}`}
                    className="border-2 border-foreground p-1 bg-white"
                  />
                </div>
              </TableCell>
              {showUserInfo && qr.user && (
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      <span className="font-medium text-sm">{qr.user.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-serif">
                      {qr.user.email}
                    </span>
                  </div>
                </TableCell>
              )}
              <TableCell className="py-4">
                <div className="space-y-1 max-w-[300px]">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {new URL(qr.redirectUrl).hostname}
                    </p>
                    <ExternalLink className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground font-serif truncate">
                    {qr.redirectUrl}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{formatDate(qr.createdAt, "MMM d, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(qr.createdAt, "h:mm a")}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-1">
                  <p className="font-mono text-xl font-bold text-primary">{qr.scans.length}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="font-serif">
                      {
                        new Set(qr.scans.map((s) => s.country).filter(Boolean))
                          .size
                      }{" "}
                      {new Set(qr.scans.map((s) => s.country).filter(Boolean)).size === 1 ? 'country' : 'countries'}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                {qr.scans[0] ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-serif">Last scan</p>
                    <p className="text-sm font-medium">{formatDate(qr.scans[0].timestamp, "MMM d, h:mm a")}</p>
                    {qr.scans[0].country && (
                      <p className="text-xs text-muted-foreground font-serif">
                        {qr.scans[0].country}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center px-2 py-1 text-xs font-mono bg-muted text-muted-foreground border border-border">
                    NO SCANS
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right py-4">
                <RowActions qrCode={qr} onDelete={onDelete} onArchive={onArchive} onEdit={onEdit} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
