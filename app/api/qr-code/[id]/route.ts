// app/api/qr-code/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateQRWithLogo, processLogoImage } from "@/lib/qr-with-logo";
// Allow CORS for https://www.mkteagle.com
const ALLOWED_ORIGIN = "https://www.mkteagle.com";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "DELETE, PATCH, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export async function OPTIONS() {
  // Preflight CORS support
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get userId from Authorization header
    const authHeader = request.headers.get("authorization");
    const userId = authHeader?.replace("Bearer ", "");

    if (!userId) {
      return withCors(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }

    // Get the user to check if they're an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return withCors(
        NextResponse.json({ error: "User not found" }, { status: 404 })
      );
    }

    const isAdmin = user.role === "ADMIN";

    // First, verify the QR code belongs to this user (unless they're an admin)
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!qrCode) {
      return withCors(
        NextResponse.json({ error: "QR code not found" }, { status: 404 })
      );
    }

    if (!isAdmin && qrCode.userId !== userId) {
      return withCors(
        NextResponse.json({ error: "Forbidden: You don't own this QR code" }, { status: 403 })
      );
    }

    // Delete the QR code by ID
    await prisma.qRCode.delete({
      where: { id },
    });

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return withCors(
      NextResponse.json({ error: "Failed to delete QR code" }, { status: 500 })
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { redirectUrl, logoDataUrl, logoSize } = await request.json();

    // Get userId from Authorization header
    const authHeader = request.headers.get("authorization");
    const userId = authHeader?.replace("Bearer ", "");

    if (!userId) {
      return withCors(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }

    // Validate input
    if (!redirectUrl) {
      return withCors(
        NextResponse.json({ error: "redirectUrl is required" }, { status: 400 })
      );
    }

    // Get the user to check if they're an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return withCors(
        NextResponse.json({ error: "User not found" }, { status: 404 })
      );
    }

    const isAdmin = user.role === "ADMIN";

    // First, verify the QR code belongs to this user (unless they're an admin)
    const existingQRCode = await prisma.qRCode.findUnique({
      where: { id },
      select: { userId: true, routingUrl: true },
    });

    if (!existingQRCode) {
      return withCors(
        NextResponse.json({ error: "QR code not found" }, { status: 404 })
      );
    }

    if (!isAdmin && existingQRCode.userId !== userId) {
      return withCors(
        NextResponse.json({ error: "Forbidden: You don't own this QR code" }, { status: 403 })
      );
    }

    // Process logo if provided
    let processedLogoUrl = logoDataUrl;
    if (logoDataUrl) {
      const { dataUrl, error } = await processLogoImage(logoDataUrl);
      processedLogoUrl = dataUrl;
      if (error) {
        console.warn('Logo processing warning:', error);
      }
    }

    // Regenerate QR code with updated settings
    const qrDataUrl = await generateQRWithLogo({
      text: existingQRCode.routingUrl,
      logoDataUrl: processedLogoUrl,
      logoSize: logoSize || 20,
      qrSize: 512,
      errorCorrectionLevel: 'H',
    });

    // Update the QR code
    const updatedQR = await prisma.qRCode.update({
      where: { id },
      data: {
        redirectUrl,
        base64: qrDataUrl,
        logoUrl: processedLogoUrl || null,
        logoSize: logoSize || null,
        updatedAt: new Date(),
      },
    });

    return withCors(
      NextResponse.json({
        success: true,
        data: updatedQR,
      })
    );
  } catch (error) {
    console.error("Error updating QR code:", error);
    return withCors(
      NextResponse.json({ error: "Failed to update QR code" }, { status: 500 })
    );
  }
}
