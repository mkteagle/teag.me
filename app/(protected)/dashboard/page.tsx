"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QRCodesTable from "@/components/qr-codes/table";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ExtendedQRCode } from "@/components/qr-codes/types";
import { EditQRDialog } from "@/components/qr-codes/edit-qr-code";

export default function DashboardPage() {
  const [qrCodes, setQrCodes] = useState<ExtendedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<ExtendedQRCode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrToEdit, setQrToEdit] = useState<ExtendedQRCode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
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
        setQrCodes(data);
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
  }, [toast]);

  const handleDeleteClick = (qr: ExtendedQRCode) => {
    setQrToDelete(qr);
    setDeleteDialogOpen(true);
  };

  // Add this to handle edit clicks
  const handleEditClick = (qr: ExtendedQRCode) => {
    setQrToEdit(qr);
    setEditDialogOpen(true);
  };

  // Add this to handle successful edits
  const handleEditSuccess = (updatedQR: ExtendedQRCode) => {
    setQrCodes((prev) =>
      prev.map((qr) => (qr.id === updatedQR.id ? updatedQR : qr))
    );
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

      setQrCodes((prev) => prev.filter((qr) => qr.id !== qrToDelete.id));
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

  return (
    <div className="container mx-auto p-8">
      <div className="grid gap-8 mb-8 md:grid-cols-2">
        <Card className="hover-lift glassmorphism">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Create QR Code
            </CardTitle>
            <CardDescription>
              Generate a new QR code for your business needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full hover-lift">
              <Link href="/generate">Create QR Code</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Your QR Codes
          </CardTitle>
          <CardDescription>
            Click on a row to view detailed analytics for that QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QRCodesTable
            qrCodes={qrCodes}
            isLoading={loading}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={qrToDelete ? new URL(qrToDelete.redirectUrl).hostname : ""}
      />
      <EditQRDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        qrCode={qrToEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
