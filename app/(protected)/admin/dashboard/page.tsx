"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { ExternalLink, Trash2, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";

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
  scans: Scan[];
}

export default function AdminPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<QRCode | null>(null);
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

  const handleDeleteClick = (qr: QRCode) => {
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

  if (loading) {
    return (
      <div className="w-full overflow-auto">
        {/* Mobile Skeleton */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-card border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full max-w-[250px]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          {qrCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No QR codes found in the system.
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR Code</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrCodes.map((qr) => (
                    <TableRow key={qr.id}>
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
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-mono">{qr.userId}</span>
                        </div>
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
                      <TableCell>
                        <span className="font-mono">{qr.scans.length}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={qr.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-muted rounded-md"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(qr)}
                            className="p-2 hover:bg-muted rounded-md text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
