import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { generateUniqueShortId } from "@/lib/utils";
import { generateQRWithLogoBuffer, processLogoImage } from "@/lib/qr-with-logo";
import { uploadToR2, dataUrlToBuffer } from "@/lib/r2-storage";
import { createQrCode, findQrCodeById } from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth-session";
import { checkQrCodeLimit, checkFeatureAccess } from "@/lib/plan-enforcement";
import { cacheQrCodeMetadata } from "@/lib/metadata";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { redirectUrl, customPath, logoDataUrl, logoSize } = body;

    if (!redirectUrl || !currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Enforce QR code limit
    const qrLimit = await checkQrCodeLimit(currentUser.id);
    if (!qrLimit.allowed) {
      return NextResponse.json(
        {
          error: "QR code limit reached",
          code: "LIMIT_REACHED",
          current: qrLimit.current,
          limit: qrLimit.limit,
          plan: qrLimit.plan,
        },
        { status: 403 }
      );
    }

    // Enforce logo upload as pro feature
    if (logoDataUrl) {
      const logoAccess = await checkFeatureAccess(currentUser.id, "logoUpload");
      if (!logoAccess.allowed) {
        return NextResponse.json(
          {
            error: "Logo uploads require a Pro plan",
            code: "PRO_REQUIRED",
            feature: "logoUpload",
            plan: logoAccess.plan,
          },
          { status: 403 }
        );
      }
    }

    let id: string;

    if (customPath) {
      // Validate custom path format
      const customPathRegex = /^[a-zA-Z0-9-_]+$/;
      if (!customPathRegex.test(customPath)) {
        return NextResponse.json(
          {
            error:
              "Custom path can only contain letters, numbers, hyphens, and underscores",
          },
          { status: 400 }
        );
      }

      // Check for reserved paths
      const reservedPaths = [
        "api",
        "auth",
        "admin",
        "login",
        "dashboard",
        "generate",
        "analytics",
        "privacy",
        "terms",
      ];
      if (reservedPaths.includes(customPath.toLowerCase())) {
        return NextResponse.json(
          { error: "This custom path is reserved and cannot be used" },
          { status: 400 }
        );
      }

      // Check for existing custom path
      const existing = await findQrCodeById(customPath);

      if (existing) {
        return NextResponse.json(
          {
            error:
              "This custom path is already in use. Please choose another one.",
          },
          { status: 400 }
        );
      }

      id = customPath;
    } else {
      // Generate a unique short ID if no custom path is provided
      id = await generateUniqueShortId(async (candidate) => {
        return (await findQrCodeById(candidate)) !== null;
      });
    }

    // Create the short URL using teag.me domain
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://teag.me";
    const shortUrl = `${baseUrl}/${id}`;

    // Process and upload logo if provided
    let logoUrl: string | null = null;
    let processedLogoDataUrl: string | undefined;

    if (logoDataUrl) {
      console.log('Processing logo image...');
      const { dataUrl } = await processLogoImage(logoDataUrl);
      processedLogoDataUrl = dataUrl;

      // Upload logo to Cloudflare R2
      const logoBuffer = dataUrlToBuffer(dataUrl);
      logoUrl = await uploadToR2(logoBuffer, `logos/${id}-logo.jpg`, "image/jpeg");
      console.log("Logo uploaded to Cloudflare R2:", logoUrl);
    }

    // Generate QR code with or without logo
    console.log('Generating QR code...');
    const qrCodeBuffer = await generateQRWithLogoBuffer({
      text: shortUrl,
      logoDataUrl: processedLogoDataUrl,
      logoSize: logoSize || 20,
      qrSize: 512,
      errorCorrectionLevel: "H",
    });
    console.log("QR code generated successfully, size:", qrCodeBuffer.length);

    // Upload QR code to Cloudflare R2
    const qrCodeUrl = await uploadToR2(qrCodeBuffer, `qr-codes/${id}.jpg`, "image/jpeg");
    console.log("QR code uploaded to Cloudflare R2:", qrCodeUrl);

    // Create the QR code entry with public R2 URLs
    const qrCode = await createQrCode({
      id,
      redirectUrl,
      userId: currentUser.id,
      base64: qrCodeUrl,
      routingUrl: shortUrl,
      logoUrl,
      logoSize: logoSize || null,
    });

    // Fetch and cache OG metadata in the background
    after(() => cacheQrCodeMetadata(id, redirectUrl));

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        base64: qrCode.base64,
        redirectUrl: qrCode.redirectUrl,
        routingUrl: qrCode.routingUrl,
      },
    });
  } catch (error) {
    console.error("Error creating QR code:", error);

    let errorMessage = "Failed to create QR code";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
