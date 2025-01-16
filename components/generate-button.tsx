"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Download, Copy, Check } from "lucide-react";

export default function GenerateButton() {
  const [formData, setFormData] = useState({
    redirectUrl: "",
    customPath: "",
  });
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("Not logged in");
      }

      // Basic URL validation
      if (
        !formData.redirectUrl.startsWith("http://") &&
        !formData.redirectUrl.startsWith("https://")
      ) {
        throw new Error(
          "Please enter a valid URL starting with http:// or https://"
        );
      }

      const response = await fetch("/api/qr-code/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUrl: formData.redirectUrl,
          customPath: formData.customPath || undefined,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code");
      }

      setQrCode(data.data);
      toast({
        title: "Success",
        description: "QR code generated successfully!",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = qrCode.base64;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been saved to your device.",
    });
  };

  const handleCopy = async () => {
    if (!qrCode) return;

    try {
      await navigator.clipboard.writeText(qrCode.routingUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "QR code URL copied to clipboard.",
      });

      // Reset copy status after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy QR code URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="redirectUrl">Destination URL</Label>
          <Input
            id="redirectUrl"
            type="url"
            placeholder="https://example.com"
            value={formData.redirectUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, redirectUrl: e.target.value }))
            }
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="customPath"
            className="flex items-center justify-between"
          >
            Custom Path
            <span className="text-sm text-muted-foreground">
              Optional - e.g., "mylink" for teag.me/mylink
            </span>
          </Label>
          <Input
            id="customPath"
            placeholder="mylink"
            value={formData.customPath}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customPath: e.target.value }))
            }
            pattern="^[a-zA-Z0-9-_]+$"
            title="Only letters, numbers, hyphens, and underscores are allowed"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty for an auto-generated short URL
          </p>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? "Generating..." : "Generate QR Code"}
        </Button>
      </div>

      {/* QR Code Display Section */}
      {qrCode && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative group">
              <img
                src={qrCode.base64}
                alt="Generated QR Code"
                className="max-w-[200px] rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <p className="text-white text-sm">
                  Click actions below to save
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Your QR code URL:</p>
            <p className="text-sm text-muted-foreground break-all">
              {qrCode.routingUrl}
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="w-32"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleCopy} variant="secondary" className="w-32">
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy URL"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
