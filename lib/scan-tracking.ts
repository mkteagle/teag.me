import { UAParser } from "ua-parser-js";
import { generateId } from "@/lib/utils";
import { createScan } from "@/lib/db/queries";
import { checkScanLimit } from "@/lib/plan-enforcement";

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

export async function recordScan(params: {
  qrCodeId: string;
  userId: string;
  ip: string;
  userAgent: string;
  referrer: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
}) {
  try {
    const { qrCodeId, userId, ip, userAgent, referrer, country, city, region } =
      params;

    const scanLimit = await checkScanLimit(userId);
    if (!scanLimit.allowed) return;

    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const { source, medium } = determineSource(referrer, userAgent);
    const isScan =
      userAgent.toLowerCase().includes("qr") ||
      userAgent.toLowerCase().includes("scanner");

    await createScan({
      id: generateId(),
      qrCodeId,
      ip,
      userAgent,
      country,
      city,
      region,
      type: isScan ? "scan" : "click",
      referrer: referrer ?? null,
      source,
      medium,
      device: result.device.type || result.device.vendor || "unknown",
      browser: result.browser.name || "unknown",
    });
  } catch (err) {
    console.error("Failed to record scan:", err);
  }
}
