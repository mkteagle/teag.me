import { useRouter } from "next/navigation";
import { TableLoading } from "./table-loading";
import { MobileTable } from "./mobile-table";
import { DesktopTable } from "./desktop-table";
import type { QRTableProps } from "./types";

export default function QRCodesTable({
  qrCodes,
  isLoading = false,
  isAdmin = false,
  showUserInfo = false,
  onDelete,
}: QRTableProps) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/analytics/${id}`);
  };

  if (isLoading) {
    return <TableLoading showUserInfo={showUserInfo} />;
  }

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No QR codes found. Create one to get started!
      </div>
    );
  }

  return (
    <>
      <MobileTable
        qrCodes={qrCodes}
        onDelete={onDelete}
        handleRowClick={handleRowClick}
      />
      <DesktopTable
        qrCodes={qrCodes}
        showUserInfo={showUserInfo}
        onDelete={onDelete}
        handleRowClick={handleRowClick}
      />
    </>
  );
}
