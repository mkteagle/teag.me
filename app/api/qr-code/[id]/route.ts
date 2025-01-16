// app/api/qr-code/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { redirectUrl } = await request.json();

    // Validate input
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "redirectUrl is required" },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      data: updatedQR,
    });
  } catch (error) {
    console.error("Error updating QR code:", error);
    return NextResponse.json(
      { error: "Failed to update QR code" },
      { status: 500 }
    );
  }
}
