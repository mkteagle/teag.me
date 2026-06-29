import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { generateQRWithLogoBuffer, processLogoImage } from "@/lib/qr-with-logo";
import { uploadToR2, dataUrlToBuffer } from "@/lib/r2-storage";
import {
  deleteQrCode,
  findQrCodeById,
  findUserRole,
  updateQrCode,
} from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth-session";
import { checkFeatureAccess } from "@/lib/plan-enforcement";
import { cacheQrCodeMetadata } from "@/lib/metadata";

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

    // Delete the QR code by ID
    await deleteQrCode(id);

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
    const { redirectUrl, logoDataUrl, logoSize } = await request.json();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (!redirectUrl) {
      return NextResponse.json({ error: "redirectUrl is required" }, { status: 400 });
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

    // Process the logo (if provided) and upload it to R2 — never store the
    // raw image data in postgres.
    let processedLogoDataUrl: string | undefined;
    let logoUrl: string | null = null;
    if (logoDataUrl) {
      const { dataUrl } = await processLogoImage(logoDataUrl);
      processedLogoDataUrl = dataUrl;
      const logoBuffer = dataUrlToBuffer(dataUrl);
      logoUrl = await uploadToR2(logoBuffer, `logos/${id}-logo.png`, "image/png");
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
    console.error("Error updating QR code:", error);
    return NextResponse.json({ error: "Failed to update QR code" }, { status: 500 });
  }
}
