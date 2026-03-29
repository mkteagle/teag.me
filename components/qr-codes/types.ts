import { InferSelectModel } from "drizzle-orm";
import { qrCodes, scans, users } from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type QRCode = InferSelectModel<typeof qrCodes>;
export type Scan = InferSelectModel<typeof scans>;

export type ExtendedScan = Omit<Scan, "timestamp"> & {
  timestamp: string | Date;
};

export type ExtendedQRCode = QRCode & {
  user?: User;
  scans: ExtendedScan[];
};

export interface QRTableProps {
  qrCodes: ExtendedQRCode[];
  isLoading?: boolean;
  isAdmin?: boolean;
  showUserInfo?: boolean;
  onDelete?: (qrCode: ExtendedQRCode) => void;
  onArchive?: (qrCode: ExtendedQRCode, archived: boolean) => void;
  onEdit?: (qrCode: ExtendedQRCode) => void;
  handleRowClick?: (id: string) => void;
}
