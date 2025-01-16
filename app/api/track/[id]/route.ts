// app/api/track/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { UAParser } from "ua-parser-js";

function determineSource(
  referrer: string | null,
  userAgent: string
): {
  source: string;
  medium: string;
} {
  if (!referrer) {
    return { source: "direct", medium: "none" };
  }

  try {
    const referrerUrl = new URL(referrer);
    const hostname = referrerUrl.hostname.toLowerCase();

    // Check for in-app browsers
    const ua = userAgent.toLowerCase();
    if (ua.includes("fban") || ua.includes("fbav")) {
      return { source: "facebook", medium: "inapp" };
    }
    if (ua.includes("instagram")) {
      return { source: "instagram", medium: "inapp" };
    }
    if (ua.includes("twitter")) {
      return { source: "twitter", medium: "inapp" };
    }
    if (ua.includes("linkedin")) {
      return { source: "linkedin", medium: "inapp" };
    }

    // Social media domains
    const socialPlatforms = {
      facebook: ["facebook.com", "fb.com", "m.facebook.com", "l.facebook.com"],
      instagram: ["instagram.com", "l.instagram.com"],
      twitter: ["twitter.com", "t.co"],
      linkedin: ["linkedin.com", "lnkd.in"],
      tiktok: ["tiktok.com", "vm.tiktok.com"],
      pinterest: ["pinterest.com", "pin.it"],
    };

    for (const [platform, domains] of Object.entries(socialPlatforms)) {
      if (domains.some((domain) => hostname.includes(domain))) {
        return { source: platform, medium: "social" };
      }
    }

    // Check for search engines
    const searchEngines = {
      google: ["google.com", "google."],
      bing: ["bing.com"],
      yahoo: ["yahoo.com"],
      duckduckgo: ["duckduckgo.com"],
    };

    for (const [engine, domains] of Object.entries(searchEngines)) {
      if (domains.some((domain) => hostname.includes(domain))) {
        return { source: engine, medium: "organic" };
      }
    }

    return { source: hostname, medium: "referral" };
  } catch {
    return { source: "invalid", medium: "unknown" };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Get tracking information
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor
      ? forwardedFor.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer");
    const country = request.headers.get("x-vercel-ip-country");
    const city = request.headers.get("x-vercel-ip-city");
    const region = request.headers.get("x-vercel-ip-region");

    // Parse user agent
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Determine if this is a scan or click
    const isScan =
      userAgent.toLowerCase().includes("qr") ||
      userAgent.toLowerCase().includes("scanner");

    // Get source information
    const { source, medium } = determineSource(referrer, userAgent);

    // Record the scan
    await prisma.scan.create({
      data: {
        id: generateId(),
        qrCodeId: id,
        ip,
        userAgent,
        country,
        city,
        region,
        type: isScan ? "scan" : "click",
        referrer: referrer || null,
        source,
        medium,
        device: result.device.type || result.device.vendor || "unknown",
        browser: result.browser.name || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      redirectUrl: qrCode.redirectUrl,
    });
  } catch (error) {
    console.error("Error tracking scan:", error);
    return NextResponse.json(
      { error: "Failed to track scan" },
      { status: 500 }
    );
  }
}
