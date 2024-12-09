"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download, Copy, Check } from "lucide-react";

export default function GeneratePage() {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("Not logged in");
      }

      const response = await fetch(`${baseUrl}/api/qr-code/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ redirectUrl, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();
      console.info({ data });
      setQrCode(data.data.base64);
      toast({
        title: "QR Code Generated",
        description: "Your QR code has been successfully created.",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = qrCode;
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
      await navigator.clipboard.writeText(qrCode);
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

  console.info({ qrCode });

  return (
    <div className="container mx-auto p-8">
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Generate QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Input
              placeholder="Enter redirect URL"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              className="hover-lift transition-all duration-300"
            />
            <Button
              onClick={handleGenerate}
              className="hover-lift transition-all duration-300"
            >
              Generate QR Code
            </Button>
          </div>
          {qrCode && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={qrCode}
                    alt="Generated QR Code"
                    className="mx-auto hover-lift transition-all duration-300 max-w-[200px]"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm">
                      Click actions below to save
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  className="hover-lift transition-all duration-300"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  className="hover-lift transition-all duration-300"
                >
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
        </CardContent>
      </Card>
    </div>
  );
}
