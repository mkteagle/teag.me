"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import QRCodesTable from "@/components/qr-codes/table";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ExtendedQRCode } from "@/components/qr-codes/types";
import { EditQRDialog } from "@/components/qr-codes/edit-qr-code";
import { Plus, Database, TrendingUp, MapPin } from "lucide-react";

export default function DashboardPage() {
  const [qrCodes, setQrCodes] = useState<ExtendedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<ExtendedQRCode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrToEdit, setQrToEdit] = useState<ExtendedQRCode | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
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

  const handleEditClick = (qr: ExtendedQRCode) => {
    setQrToEdit(qr);
    setEditDialogOpen(true);
  };

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

  const totalScans = qrCodes.reduce((acc, qr) => acc + qr.scans.length, 0);
  const totalCountries = new Set(
    qrCodes.flatMap((qr) => qr.scans.map((s) => s.country).filter(Boolean))
  ).size;

  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
          Dashboard
        </h1>
        <p className="text-lg text-muted-foreground font-serif italic">
          Monitor and manage your QR code analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div
        className="grid gap-6 mb-12 md:grid-cols-3"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="data-card p-6">
          <div className="flex items-start justify-between mb-4">
            <Database className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="mono-badge">TOTAL</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-mono font-bold">{qrCodes.length}</div>
            <div className="text-sm font-serif text-muted-foreground">
              Active QR Codes
            </div>
          </div>
        </div>

        <div
          className="data-card p-6"
          style={{
            animationDelay: mounted ? '100ms' : '0ms',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <TrendingUp className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="mono-badge">METRICS</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-mono font-bold">{totalScans}</div>
            <div className="text-sm font-serif text-muted-foreground">
              Total Scans
            </div>
          </div>
        </div>

        <div
          className="data-card p-6"
          style={{
            animationDelay: mounted ? '200ms' : '0ms',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <MapPin className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="mono-badge">REACH</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-mono font-bold">{totalCountries}</div>
            <div className="text-sm font-serif text-muted-foreground">
              Countries Reached
            </div>
          </div>
        </div>
      </div>

      {/* Create Action */}
      <div
        className="mb-12"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
        }}
      >
        <div className="data-card p-8 bg-primary/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Generate New QR Code</h2>
              <p className="text-muted-foreground font-serif">
                Create trackable QR codes with custom URLs and real-time analytics
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="data-card border-2 border-foreground bg-foreground text-background hover:bg-primary hover:border-primary font-mono font-semibold"
            >
              <Link href="/generate" className="flex items-center gap-2">
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Create QR Code
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* QR Codes Table */}
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
        }}
      >
        <div className="data-card">
          <div className="border-b-2 border-foreground p-6">
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-2xl font-bold">QR Code Registry</h2>
              <span className="mono-badge">{qrCodes.length} CODES</span>
            </div>
            <p className="text-sm font-serif text-muted-foreground">
              Click any row to view detailed analytics and performance metrics
            </p>
          </div>
          <div className="p-6">
            <QRCodesTable
              qrCodes={qrCodes}
              isLoading={loading}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>
      </div>

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
