import { QRCode, Scan, User } from "@prisma/client";

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
  handleRowClick?: (id: string) => void;
}
