import { UAParser } from "ua-parser-js";
import { generateId } from "@/lib/ids";
import { createTrackedScan } from "@/lib/plan-enforcement";

function determineSource(
  referrer: string | null,
  userAgent: string
): { source: string; medium: string } {
  if (!referrer) return { source: "direct", medium: "none" };

  try {
    const referrerUrl = new URL(referrer);
    const hostname = referrerUrl.hostname.toLowerCase();

    const ua = userAgent.toLowerCase();
    if (ua.includes("fban") || ua.includes("fbav"))
      return { source: "facebook", medium: "inapp" };
    if (ua.includes("instagram"))
      return { source: "instagram", medium: "inapp" };
    if (ua.includes("twitter")) return { source: "twitter", medium: "inapp" };
    if (ua.includes("linkedin")) return { source: "linkedin", medium: "inapp" };

    const socialPlatforms: Record<string, string[]> = {
      facebook: ["facebook.com", "fb.com", "m.facebook.com", "l.facebook.com"],
      instagram: ["instagram.com", "l.instagram.com"],
      twitter: ["twitter.com", "t.co"],
      linkedin: ["linkedin.com", "lnkd.in"],
      tiktok: ["tiktok.com", "vm.tiktok.com"],
      pinterest: ["pinterest.com", "pin.it"],
    };

    for (const [platform, domains] of Object.entries(socialPlatforms)) {
      if (domains.some((d) => hostname.includes(d)))
        return { source: platform, medium: "social" };
    }

    const searchEngines: Record<string, string[]> = {
      google: ["google.com", "google."],
      bing: ["bing.com"],
      yahoo: ["yahoo.com"],
      duckduckgo: ["duckduckgo.com"],
    };

    for (const [engine, domains] of Object.entries(searchEngines)) {
      if (domains.some((d) => hostname.includes(d)))
        return { source: engine, medium: "organic" };
    }

    return { source: hostname, medium: "referral" };
  } catch {
    return { source: "invalid", medium: "unknown" };
  }
}

export function isCameraInvocationId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{20,64}$/.test(value);
}

export async function recordScan(
  qrCode: { id: string; userId: string },
  headers: Headers,
  cameraInvocationId?: string
) {
  try {
    const userAgent = headers.get("user-agent") ?? "unknown";
    const referrer = headers.get("referer");
    const result = new UAParser(userAgent).getResult();
    const { source, medium } = determineSource(referrer, userAgent);
    const isScan = Boolean(cameraInvocationId) || /qr|scanner/i.test(userAgent);

    await createTrackedScan(qrCode.userId, {
      id: cameraInvocationId ? `ios-camera:${qrCode.id}:${cameraInvocationId}` : generateId(),
      qrCodeId: qrCode.id,
      ip: headers.get("x-forwarded-for")?.split(",")[0] ?? headers.get("x-real-ip") ?? "unknown",
      userAgent,
      country: headers.get("x-vercel-ip-country"),
      city: headers.get("x-vercel-ip-city"),
      region: headers.get("x-vercel-ip-region"),
      type: isScan ? "scan" : "click",
      referrer,
      source,
      medium,
      device: result.device.type || result.device.vendor || "unknown",
      browser: result.browser.name || "unknown",
    });
  } catch (err) {
    console.error("Failed to record scan:", err);
  }
}
