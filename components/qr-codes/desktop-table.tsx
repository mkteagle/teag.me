// components/qr-codes/qr-table-desktop.tsx
import Image from "next/image";
import { User as UserIcon, MapPin } from "lucide-react";
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
  extends Pick<QRTableProps, "qrCodes" | "onDelete" | "showUserInfo"> {
  handleRowClick: (id: string) => void;
}

export function DesktopTable({
  qrCodes,
  showUserInfo = false,
  onDelete,
  handleRowClick,
}: DesktopTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>QR Code</TableHead>
            {showUserInfo && <TableHead>User</TableHead>}
            <TableHead>Destination</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Scans</TableHead>
            <TableHead>Recent Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qrCodes.map((qr) => (
            <TableRow
              key={qr.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleRowClick(qr.id)}
            >
              <TableCell>
                <Image
                  src={qr.base64}
                  height={50}
                  width={40}
                  alt={`QR Code for ${qr.redirectUrl}`}
                  className="dark:invert"
                />
              </TableCell>
              {showUserInfo && qr.user && (
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium">{qr.user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {qr.user.email}
                    </span>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">
                    {new URL(qr.redirectUrl).hostname}
                  </p>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {qr.redirectUrl}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{formatDate(qr.createdAt, "MMM d, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(qr.createdAt, "h:mm a")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-mono text-lg">{qr.scans.length}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {
                        new Set(qr.scans.map((s) => s.country).filter(Boolean))
                          .size
                      }{" "}
                      countries
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {qr.scans[0] ? (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last scan:</p>
                    <p>{formatDate(qr.scans[0].timestamp, "MMM d, h:mm a")}</p>
                    <p className="text-sm text-muted-foreground">
                      {qr.scans[0].country && `from ${qr.scans[0].country}`}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No scans yet</p>
                )}
              </TableCell>
              <TableCell className="text-right">
                <RowActions qrCode={qr} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
