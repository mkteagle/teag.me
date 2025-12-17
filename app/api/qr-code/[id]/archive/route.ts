import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Allow CORS for https://www.mkteagle.com
const ALLOWED_ORIGIN = "https://www.mkteagle.com";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "PATCH, OPTIONS"
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { archived } = await request.json();

    // Get userId from Authorization header
    const authHeader = request.headers.get("authorization");
    const userId = authHeader?.replace("Bearer ", "");

    if (!userId) {
      return withCors(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }

    // Validate input
    if (typeof archived !== "boolean") {
      return withCors(
        NextResponse.json({ error: "archived must be a boolean" }, { status: 400 })
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

    // Update the archived status
    const updatedQR = await prisma.qRCode.update({
      where: { id },
      data: {
        archived,
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
    console.error("Error archiving QR code:", error);
    return withCors(
      NextResponse.json({ error: "Failed to archive QR code" }, { status: 500 })
    );
  }
}
