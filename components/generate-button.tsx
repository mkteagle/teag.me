"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Download, Copy, Check, Upload, X } from "lucide-react";

export default function GenerateButton() {
  const [formData, setFormData] = useState({
    redirectUrl: "",
    customPath: "",
  });
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview and process image to square aspect ratio
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      try {
        // Process image to square aspect ratio
        const processedDataUrl = await processImageToSquare(dataUrl);
        setLogoPreview(processedDataUrl);
        setLogoDataUrl(processedDataUrl);

        toast({
          title: "Logo uploaded",
          description: "Logo has been processed to fit QR code requirements",
        });
      } catch (error) {
        toast({
          title: "Error processing image",
          description: "Failed to process the uploaded image",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const processImageToSquare = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Determine the size (use the smaller dimension to create a square)
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        // Calculate crop position to center the image
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        // Draw the cropped and centered image
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoDataUrl(null);
    setQrPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = async () => {
    if (!formData.redirectUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter a destination URL first",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    if (
      !formData.redirectUrl.startsWith("http://") &&
      !formData.redirectUrl.startsWith("https://")
    ) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    try {
      setPreviewLoading(true);

      const response = await fetch("/api/qr-code/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUrl: formData.redirectUrl,
          customPath: formData.customPath || undefined,
          logoDataUrl: logoDataUrl,
          logoSize: logoSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate preview");
      }

      setQrPreview(data.preview);
      toast({
        title: "Preview generated",
        description: "Your QR code preview is ready",
      });
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

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
          logoDataUrl: logoDataUrl,
          logoSize: logoSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code");
      }

      setQrCode(data.data);
      setQrPreview(null); // Clear preview after generating
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
            pattern="[a-zA-Z0-9\-_]+"
            title="Only letters, numbers, hyphens, and underscores are allowed"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty for an auto-generated short URL
          </p>
        </div>

        {/* Logo Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="logoUpload">Logo (Optional)</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id="logoUpload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Image will be cropped to square aspect ratio
              </p>
            </div>
            {logoPreview && (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 object-cover"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Logo Size Slider */}
        {logoPreview && (
          <div className="space-y-2">
            <Label htmlFor="logoSize">
              Logo Size: {logoSize}% of QR code
            </Label>
            <Slider
              id="logoSize"
              min={10}
              max={30}
              step={1}
              value={[logoSize]}
              onValueChange={(value) => setLogoSize(value[0])}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 15-25% for optimal scanability
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePreview}
            disabled={previewLoading || !formData.redirectUrl}
            variant="outline"
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {previewLoading ? "Generating..." : "Preview"}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !formData.redirectUrl}
            className="flex-1"
          >
            {loading ? "Generating..." : "Generate QR Code"}
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      {qrPreview && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Preview</h3>
            <p className="text-sm text-muted-foreground">
              Not saved yet - click Generate to save
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={qrPreview}
              alt="QR Code Preview"
              className="max-w-[200px] rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

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
