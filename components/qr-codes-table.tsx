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
import Image from "next/image";

export const QRCodesTable = () => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleRowClick = (id: string) => {
    router.push(`/analytics/${id}`);
  };

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>QR Code</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {qrCodes.map((qr) => (
          <TableRow
            key={qr.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleRowClick(qr.id)}
          >
            <TableCell className="font-medium">{qr.id}</TableCell>
            <TableCell>{qr.redirectUrl}</TableCell>
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
              <button
                onClick={() => handleDelete(qr.id)}
                className="text-destructive hover:text-destructive/90 text-sm font-medium"
              >
                Delete
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default QRCodesTable;
