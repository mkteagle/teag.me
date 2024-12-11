"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import QRCodesTable from "@/components/qr-codes/table";
import { DeleteDialog } from "@/components/delete-dialog";
import { ExtendedQRCode } from "@/components/qr-codes/types";

interface Scan {
  id: string;
  timestamp: string;
  country?: string;
  city?: string;
  region?: string;
}

interface QRCode {
  id: string;
  redirectUrl: string;
  base64: string;
  createdAt: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  scans: Scan[];
}

export default function AdminPage() {
  const [qrCodes, setQRCodes] = useState<ExtendedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<ExtendedQRCode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setError(null);
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setError("Please log in to access the admin panel");
          return;
        }

        const response = await fetch("/api/admin/qr-codes", {
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        });

        if (response.status === 403) {
          setError("You do not have permission to access the admin panel");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch QR codes");
        }

        const data = await response.json();
        setQRCodes(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load QR codes");
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, []);

  const handleDeleteClick = (qr: ExtendedQRCode) => {
    setQrToDelete(qr);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!qrToDelete) return;

    try {
      const response = await fetch(`/api/qr-code/${qrToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userId")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete QR code");
      }

      setQRCodes((prev) => prev.filter((qr) => qr.id !== qrToDelete.id));
      toast({
        title: "Success",
        description: "QR code deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive py-8">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle>Admin Dashboard - All QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <QRCodesTable
            qrCodes={qrCodes}
            isLoading={loading}
            isAdmin={true}
            onDelete={handleDeleteClick}
            showUserInfo={true}
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={qrToDelete ? new URL(qrToDelete.redirectUrl).hostname : ""}
      />
    </div>
  );
}
