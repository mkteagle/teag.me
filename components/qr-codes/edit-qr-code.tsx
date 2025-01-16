"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExtendedQRCode } from "@/components/qr-codes/types";

interface EditQRDialogProps {
  qrCode: ExtendedQRCode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedQR: ExtendedQRCode) => void;
}

export function EditQRDialog({
  qrCode,
  open,
  onOpenChange,
  onSuccess,
}: EditQRDialogProps) {
  const [redirectUrl, setRedirectUrl] = useState(qrCode?.redirectUrl || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens/closes or QR code changes
  useEffect(() => {
    if (qrCode) {
      setRedirectUrl(qrCode.redirectUrl);
    }
  }, [qrCode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode) return;

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("Not logged in");
      }

      // Basic URL validation
      if (
        !redirectUrl.startsWith("http://") &&
        !redirectUrl.startsWith("https://")
      ) {
        throw new Error(
          "Please enter a valid URL starting with http:// or https://"
        );
      }

      const response = await fetch(`/api/qr-code/${qrCode.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          redirectUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update QR code");
      }

      toast({
        title: "Success",
        description: "QR code updated successfully!",
      });

      if (onSuccess) {
        onSuccess(data.data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit QR Code</DialogTitle>
          <DialogDescription>
            Update the destination URL for this QR code. The QR code image and
            short URL will remain the same.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redirectUrl">Destination URL</Label>
            <Input
              id="redirectUrl"
              type="url"
              placeholder="https://example.com"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Short URL</Label>
            <p className="text-sm text-muted-foreground">
              {qrCode?.routingUrl}
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update QR Code"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
