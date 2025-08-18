// app/api/qr-code/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    const { redirectUrl } = await request.json();

    // Validate input
    if (!redirectUrl) {
      return withCors(
        NextResponse.json({ error: "redirectUrl is required" }, { status: 400 })
      );
    }

    // Update the QR code
    const updatedQR = await prisma.qRCode.update({
      where: { id },
      data: {
        redirectUrl,
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
