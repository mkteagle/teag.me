"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface QRCode {
  id: string;
  redirectUrl: string;
  base64: string;
  createdAt: string;
}

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await fetch("/api/qr-codes");
        if (!response.ok) {
          throw new Error("Failed to fetch QR codes");
        }
        const data = await response.json();
        setQRCodes(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    try {
      const response = await fetch(`/api/qr-code/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete QR code");
      }

      setQRCodes((prev) => prev.filter((qrCode) => qrCode.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  console.info({ qrCodes });

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>All QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Redirect URL</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qrCode) => (
                <TableRow key={qrCode.id}>
                  <TableCell>{qrCode.id}</TableCell>
                  <TableCell className="truncate max-w-xs">
                    {qrCode.redirectUrl}
                  </TableCell>
                  <TableCell>
                    <img
                      src={qrCode.base64}
                      alt={`QR code for ${qrCode.redirectUrl}`}
                      className="w-20 h-20"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(qrCode.createdAt), "PPpp")}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(qrCode.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
