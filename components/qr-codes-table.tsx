"use client";
import { QRCode } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { DeleteDialog } from "./delete-dialog";
import Image from "next/image";
import { format } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

export const QRCodesTable = () => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<QRCode | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/qr-codes", {
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch QR codes");
        }
        const data = await response.json();
        setQRCodes(data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to fetch QR codes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [router, toast]);

  const handleRowClick = (id: string) => {
    router.push(`/analytics/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, qr: QRCode) => {
    e.stopPropagation();
    setQrToDelete(qr);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!qrToDelete) return;

    try {
      const response = await fetch(`/api/qr-code/${qrToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete QR code");
      }

      setQRCodes((prev) => prev.filter((qr) => qr.id !== qrToDelete.id));
      toast({
        title: "QR Code deleted",
        description: "The QR code has been successfully deleted.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full grid place-items-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-auto">
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              onClick={() => handleRowClick(qr.id)}
              className="p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Image
                      src={qr.base64}
                      height={40}
                      width={40}
                      alt={`QR Code for ${qr.redirectUrl}`}
                      className="dark:invert"
                    />
                    <div>
                      <p className="font-medium truncate max-w-[150px]">
                        {new URL(qr.redirectUrl).hostname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {format(new Date(qr.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {qr.redirectUrl}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={qr.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-muted rounded-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={(e) => handleDeleteClick(e, qr)}
                    className="p-2 hover:bg-muted rounded-md text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>QR Code</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qr) => (
                <TableRow
                  key={qr.id}
                  onClick={() => handleRowClick(qr.id)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
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
                      <p>{format(new Date(qr.createdAt), "MMM d, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(qr.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={qr.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-muted rounded-md"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => handleDeleteClick(e, qr)}
                        className="p-2 hover:bg-muted rounded-md text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={qrToDelete ? new URL(qrToDelete.redirectUrl).hostname : ""}
      />
    </>
  );
};

export default QRCodesTable;
