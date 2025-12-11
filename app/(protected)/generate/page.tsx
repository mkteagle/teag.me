"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Download, Copy, Check, Sparkles, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoUpload } from "@/components/qr-codes/LogoUpload";
import { LogoSizeSlider } from "@/components/qr-codes/LogoSizeSlider";

export default function GeneratePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    redirectUrl: "",
    customPath: "",
  });
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.redirectUrl) return;

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

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/qr-code/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          redirectUrl: formData.redirectUrl,
          customPath: formData.customPath || undefined,
          userId,
          logoDataUrl,
          logoSize,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate QR code");
      }

      const data = await response.json();
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
    if (!qrCode?.base64) return;

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
    if (!qrCode?.routingUrl) return;

    try {
      await navigator.clipboard.writeText(qrCode.routingUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "QR code URL copied to clipboard.",
      });

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
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
          Generate QR Code
        </h1>
        <p className="text-lg text-muted-foreground font-serif italic">
          Create trackable QR codes with custom short URLs
        </p>
      </div>

      <div className="max-w-4xl">
        {/* Form Section */}
        <div
          className="data-card p-8 mb-8"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-dashed border-border">
            <Link2 className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <h2 className="text-2xl font-bold">Configuration</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="redirectUrl" className="text-sm font-mono uppercase tracking-wider">
                Destination URL
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="redirectUrl"
                type="url"
                placeholder="https://example.com"
                value={formData.redirectUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    redirectUrl: e.target.value,
                  }))
                }
                required
                className="font-mono border-2 border-border focus:border-primary transition-colors"
              />
              <p className="text-xs font-serif text-muted-foreground">
                The URL where users will be redirected after scanning
              </p>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="customPath"
                className="text-sm font-mono uppercase tracking-wider flex items-center justify-between"
              >
                <span>Custom Path</span>
                <span className="mono-badge">OPTIONAL</span>
              </Label>
              <Input
                id="customPath"
                placeholder="my-custom-link"
                value={formData.customPath}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customPath: e.target.value,
                  }))
                }
                pattern="^[a-zA-Z0-9-_]+$"
                title="Only letters, numbers, hyphens, and underscores are allowed"
                className="font-mono border-2 border-border focus:border-primary transition-colors"
              />
              <p className="text-xs font-serif text-muted-foreground">
                Leave empty for auto-generated short URL • Example: teag.me/your-path
              </p>
            </div>

            <div className="receipt-line" />

            <LogoUpload
              onLogoChange={setLogoDataUrl}
              logoPreview={logoDataUrl}
            />

            {logoDataUrl && (
              <LogoSizeSlider
                value={logoSize}
                onChange={setLogoSize}
              />
            )}

            <div className="receipt-line" />

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full data-card border-2 border-foreground bg-foreground text-background hover:bg-primary hover:border-primary font-mono font-semibold text-base"
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" strokeWidth={2.5} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" strokeWidth={2.5} />
                  Generate QR Code
                </>
              )}
            </Button>
          </form>
        </div>

        {/* QR Code Result Section */}
        {qrCode && (
          <div
            className="data-card p-8"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
            }}
          >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-dashed border-border">
              <Check className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <h2 className="text-2xl font-bold">Generated QR Code</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-primary/10 -z-10" />
                  <img
                    src={qrCode.base64}
                    alt="Generated QR Code"
                    className="w-64 h-64 border-4 border-foreground bg-white p-4 transition-transform group-hover:scale-105"
                  />
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-4 uppercase tracking-wider">
                  Scan to test
                </p>
              </div>

              {/* QR Code Info & Actions */}
              <div className="flex flex-col justify-between">
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Short URL
                    </p>
                    <div className="data-card bg-muted/50 p-4">
                      <p className="font-mono text-sm break-all text-primary font-semibold">
                        {qrCode.routingUrl}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Redirects To
                    </p>
                    <div className="data-card bg-muted/50 p-4">
                      <p className="font-serif text-sm break-all text-muted-foreground">
                        {formData.redirectUrl}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full data-card border-2 border-foreground bg-card hover:bg-foreground hover:text-background font-mono font-semibold"
                  >
                    <Download className="mr-2 h-5 w-5" strokeWidth={2.5} />
                    Download PNG
                  </Button>
                  <Button
                    onClick={handleCopy}
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-mono font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-5 w-5" strokeWidth={2.5} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-5 w-5" strokeWidth={2.5} />
                        Copy URL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
