"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodesTable from "@/components/qr-codes/table";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ExtendedQRCode } from "@/components/qr-codes/types";
import { EditQRDialog } from "@/components/qr-codes/edit-qr-code";
import { Plus, Database, TrendingUp, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function DashboardPage() {
  const [qrCodes, setQrCodes] = useState<ExtendedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<ExtendedQRCode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrToEdit, setQrToEdit] = useState<ExtendedQRCode | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchQRCodes = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          return;
        }

        const archived = activeTab === "archived";
        const response = await fetch(
          `/api/qr-codes?archived=${archived}&page=${pagination.page}&limit=${pagination.limit}`,
          {
            headers: {
              Authorization: `Bearer ${userId}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch QR codes");
        }

        const data = await response.json();
        setQrCodes(data.qrCodes || []);
        setPagination(data.pagination || pagination);
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
  }, [activeTab, pagination.page, pagination.limit, toast]);

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

  const handleArchive = async (qr: ExtendedQRCode, archived: boolean) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Not logged in");
      }

      const response = await fetch(`/api/qr-code/${qr.id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive QR code");
      }

      // Remove from current list since it's now in a different tab
      setQrCodes((prev) => prev.filter((qrCode) => qrCode.id !== qr.id));

      toast({
        title: archived ? "QR Code archived" : "QR Code unarchived",
        description: `The QR code has been successfully ${archived ? "archived" : "unarchived"}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!qrToDelete) return;

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Not logged in");
      }

      const response = await fetch(`/api/qr-code/${qrToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
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
              <span className="mono-badge">{pagination.totalCount} CODES</span>
            </div>
            <p className="text-sm font-serif text-muted-foreground">
              Click any row to view detailed analytics and performance metrics
            </p>
          </div>
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "archived")}>
              <TabsList className="mb-6">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <QRCodesTable
                  qrCodes={qrCodes}
                  isLoading={loading}
                  onDelete={handleDeleteClick}
                  onArchive={handleArchive}
                  onEdit={handleEditClick}
                />
              </TabsContent>

              <TabsContent value="archived">
                <QRCodesTable
                  qrCodes={qrCodes}
                  isLoading={loading}
                  onDelete={handleDeleteClick}
                  onArchive={handleArchive}
                  onEdit={handleEditClick}
                />
              </TabsContent>
            </Tabs>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
