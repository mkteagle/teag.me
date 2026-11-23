import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { generateQRWithLogoBuffer, InvalidLogoError, processLogoImage } from "@/lib/qr-with-logo";
import { uploadToR2, readQrLogoFromR2, dataUrlToBuffer } from "@/lib/r2-storage";
import {
  findQrCodeById,
  findUserRole,
  updateQrCode,
} from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth-session";
import { checkFeatureAccess, deleteTrackedQrCode } from "@/lib/plan-enforcement";
import { cacheQrCodeMetadata } from "@/lib/metadata";
import { parseHttpDestination } from "@/lib/http-destination";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await findUserRole(currentUser.id);

    if (!role) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = role === "ADMIN";

    // First, verify the QR code belongs to this user (unless they're an admin)
    const qrCode = await findQrCodeById(id);

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    if (!isAdmin && qrCode.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden: You don't own this QR code" }, { status: 403 });
    }

    await deleteTrackedQrCode(id, qrCode.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json({ error: "Failed to delete QR code" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    const { redirectUrl: submittedUrl, logoDataUrl, logoSize } = await request.json();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redirectUrl = parseHttpDestination(submittedUrl)?.href;
    if (!redirectUrl) {
      return NextResponse.json({ error: "Enter a valid HTTP or HTTPS destination" }, { status: 400 });
    }

    const role = await findUserRole(currentUser.id);

    if (!role) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = role === "ADMIN";

    // First, verify the QR code belongs to this user (unless they're an admin)
    const existingQRCode = await findQrCodeById(id);

    if (!existingQRCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    if (!isAdmin && existingQRCode.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden: You don't own this QR code" }, { status: 403 });
    }

    // Enforce logo upload as pro feature
    if (logoDataUrl) {
      const logoAccess = await checkFeatureAccess(currentUser.id, "logoUpload");
      if (!logoAccess.allowed) {
        return NextResponse.json(
          { error: "Logo uploads require a Pro plan", code: "PRO_REQUIRED", feature: "logoUpload", plan: logoAccess.plan },
          { status: 403 }
        );
      }
    }

    // Resolve the logo. The client sends either a fresh `data:` URL (a newly
    // uploaded logo) or the existing logo's `https://` R2 URL (logo unchanged).
    // Either way we need the bytes to re-embed into the regenerated QR, and we
    // only re-upload when it's a new logo. Never store base64 in postgres.
    let processedLogoDataUrl: string | undefined;
    let logoUrl: string | null = null;
    if (typeof logoDataUrl === "string" && logoDataUrl.startsWith("data:")) {
      // New upload: normalize and store in R2.
      const { dataUrl } = await processLogoImage(logoDataUrl);
      processedLogoDataUrl = dataUrl;
      const logoBuffer = dataUrlToBuffer(dataUrl);
      logoUrl = await uploadToR2(logoBuffer, `logos/${id}-logo.png`, "image/png");
    } else if (logoDataUrl) {
      if (logoDataUrl !== existingQRCode.logoUrl) {
        return NextResponse.json({ error: "Upload a logo file or keep the existing logo" }, { status: 400 });
      }
      logoUrl = existingQRCode.logoUrl;
      try {
        const logo = await readQrLogoFromR2(id);
        processedLogoDataUrl = `data:image/png;base64,${logo.toString("base64")}`;
      } catch {
        console.warn("Could not read the stored QR logo");
      }
    }

    // Regenerate the QR code with the updated settings and upload it to R2.
    const qrCodeBuffer = await generateQRWithLogoBuffer({
      text: existingQRCode.routingUrl,
      logoDataUrl: processedLogoDataUrl,
      logoSize: logoSize || 20,
      qrSize: 512,
      errorCorrectionLevel: "H",
    });
    const qrCodeUrl = await uploadToR2(qrCodeBuffer, `qr-codes/${id}.jpg`, "image/jpeg");

    // Update the QR code — store the public R2 URLs, not base64 blobs.
    const updatedQR = await updateQrCode(id, {
      redirectUrl,
      base64: qrCodeUrl,
      logoUrl,
      logoSize: logoSize || null,
    });

    // Re-cache OG metadata if URL changed
    if (redirectUrl !== existingQRCode.redirectUrl) {
      after(() => cacheQrCodeMetadata(id, redirectUrl));
    }

    return NextResponse.json({
      success: true,
      data: updatedQR,
    });
  } catch (error) {
    if (error instanceof InvalidLogoError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error updating QR code:", error);
    return NextResponse.json({ error: "Failed to update QR code" }, { status: 500 });
  }
}
