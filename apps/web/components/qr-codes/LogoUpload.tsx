"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface LogoUploadProps {
  onLogoChange: (logoDataUrl: string | null) => void;
  logoPreview: string | null;
}

export function LogoUpload({ onLogoChange, logoPreview }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setError(null);

    // Convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onLogoChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onLogoChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-mono uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Logo (Optional)
        </span>
        <span className="mono-badge">BETA</span>
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!logoPreview ? (
        <div
          onClick={handleUploadClick}
          className="data-card bg-muted/30 border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors p-8"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full border-2 border-border bg-background flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
            </div>
            <div>
              <p className="font-mono font-semibold text-sm mb-1">
                Click to upload logo
              </p>
              <p className="text-xs text-muted-foreground font-serif">
                PNG, JPG, or SVG • Max 2MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="data-card p-4 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <div className="w-full h-full rounded-lg border-2 border-border bg-white p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-semibold mb-1">Logo uploaded</p>
              <p className="text-xs text-muted-foreground font-serif">
                Will be embedded in the QR code center
              </p>
            </div>
            <Button
              onClick={handleRemoveLogo}
              variant="outline"
              size="sm"
              className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-white font-mono"
            >
              <X className="w-4 h-4 mr-1" strokeWidth={2.5} />
              Remove
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="data-card bg-destructive/10 border-2 border-destructive p-3">
          <p className="text-xs font-mono text-destructive">{error}</p>
        </div>
      )}

      <p className="text-xs font-serif text-muted-foreground">
        Your logo will be centered in the QR code with a white background for
        readability. High error correction ensures the QR code remains scannable.
      </p>
    </div>
  );
}
