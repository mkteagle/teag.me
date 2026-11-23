"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ChevronDown, Copy, Download, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { LogoUpload } from "@/components/qr-codes/LogoUpload";
import { LogoSizeSlider } from "@/components/qr-codes/LogoSizeSlider";
import { UpgradeWall } from "@/components/upgrade-wall";
import { usePlan } from "@/lib/hooks/use-plan";
import { capture } from "@/lib/posthog";

type GeneratedCode = { base64: string; redirectUrl: string; routingUrl: string };
type UpgradeReason = "limit" | "logo";

export default function GeneratePage() {
  const [destination, setDestination] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const [code, setCode] = useState<GeneratedCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const { data: plan, atQrLimit } = usePlan();

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const properties = { tracked: true, custom_path: Boolean(customPath), has_logo: Boolean(logoDataUrl) };
    capture("qr_code_create_started", properties);
    setLoading(true);
    setCopied(false);

    try {
      const url = new URL(destination);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Enter a website URL starting with https:// or http://.");
      }

      const response = await fetch("/api/qr-code/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectUrl: url.href, customPath: customPath || undefined, logoDataUrl, logoSize }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.code === "LIMIT_REACHED" || result.code === "PRO_REQUIRED") {
          const reason = result.code === "LIMIT_REACHED" ? "limit" : "logo";
          setUpgradeReason(reason);
          capture("qr_code_create_blocked", { ...properties, reason });
          return;
        }
        throw new Error(result.error || "Please try again.");
      }

      setCode(result.data);
      capture("qr_code_created", properties);
      toast({ title: "QR code created" });
    } catch (error) {
      capture("qr_code_create_failed", properties);
      toast({
        title: "Couldn’t create your QR code",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.routingUrl);
      setCopied(true);
      capture("created_qr_link_copied", { tracked: true });
    } catch {
      toast({ title: "Couldn’t copy the link", variant: "destructive" });
    }
  };

  return (
    <section className="full-bleed py-8 sm:py-12">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Your codes
      </Link>
      <h1 className="text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">Create a QR code</h1>
      <p className="mb-8 mt-3 text-base text-muted-foreground">Add the website your code should open.</p>

      <form onSubmit={create} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination URL</Label>
          <div className="flex flex-wrap items-start gap-3">
            <Input id="destination" type="url" required value={destination} onChange={(event) => setDestination(event.target.value)}
              placeholder="https://example.com" className="min-w-56 flex-1 bg-card" />
            {atQrLimit ? (
              <Button type="button" onClick={() => setUpgradeReason("limit")}>
                <Zap className="size-4" aria-hidden="true" /> Upgrade to create
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="font-semibold">
                <Plus className="size-4" aria-hidden="true" /> {loading ? "Creating…" : "Create QR"}
              </Button>
            )}
          </div>
        </div>

        <details className="group rounded-xl border bg-card px-4">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
            QR code options
            <ChevronDown className="size-4 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-5 border-t py-4">
            <div className="space-y-2">
              <Label htmlFor="customPath">Custom short path</Label>
              <Input id="customPath" value={customPath} onChange={(event) => setCustomPath(event.target.value)}
                placeholder="studio-menu" pattern="[a-zA-Z0-9_\\-]+" title="Use letters, numbers, hyphens, or underscores"
                aria-describedby="custom-path-hint" />
              <p id="custom-path-hint" className="text-sm text-muted-foreground">Leave blank for an automatic teag.me link.</p>
            </div>
            {plan?.plan === "PRO" ? (
              <>
                <LogoUpload onLogoChange={setLogoDataUrl} logoPreview={logoDataUrl} />
                {logoDataUrl && <LogoSizeSlider value={logoSize} onChange={setLogoSize} />}
              </>
            ) : (
              <Button variant="outline" type="button" onClick={() => setUpgradeReason("logo")}>
                Add a logo with Pro
              </Button>
            )}
          </div>
        </details>
      </form>

      {code && (
        <section className="mt-9 flex flex-wrap items-center gap-6 rounded-xl border bg-card p-5 sm:p-6" aria-label="Created QR code">
          <img src={code.base64} alt="Your QR code" width={144} height={144} className="rounded-lg border bg-white p-2" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">Your QR code is ready</h2>
            <a className="mt-1 block break-all text-sm text-accent underline underline-offset-4" href={code.routingUrl}>{code.routingUrl}</a>
            <p className="mt-1 break-all text-sm text-muted-foreground">{code.redirectUrl}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline"><a href={code.base64} download="teag-qr-code.png" onClick={() => capture("qr_code_downloaded", { source: "generator", tracked: true })}>
                <Download className="size-4" aria-hidden="true" /> Download
              </a></Button>
              <Button variant="outline" type="button" onClick={() => void copy()}>
                <Copy className="size-4" aria-hidden="true" /> {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
          </div>
        </section>
      )}

      <UpgradeWall
        open={upgradeReason !== null}
        onClose={() => setUpgradeReason(null)}
        title={upgradeReason === "logo" ? "Add your logo with Pro" : "QR code limit reached"}
        feature={upgradeReason === "logo" ? "logo uploads" : undefined}
        current={upgradeReason === "limit" ? plan?.usage.activeQrCodes.current : undefined}
        limit={upgradeReason === "limit" ? plan?.usage.activeQrCodes.limit : undefined}
      />
    </section>
  );
}
