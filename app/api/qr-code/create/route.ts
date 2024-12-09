import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const { redirectUrl, userId } = await request.json();

    if (!redirectUrl || !userId) {
      return NextResponse.json(
        { error: "redirectUrl and userId are required" },
        { status: 400 }
      );
    }

    // Create initial QR code entry
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const qrCodeEntry = await prisma.qRCode.create({
      data: {
        redirectUrl,
        userId,
        base64: "",
        routingUrl: "", // Initialize with empty string
      },
    });

    // Generate the routing URL using the ID
    const routingUrl = `${baseUrl}/r/${qrCodeEntry.id}`;

    // Generate QR code with the routing URL
    const qrDataUrl = await QRCode.toDataURL(routingUrl);

    // Update QR code with both the routingUrl and base64 data
    const qrCode = await prisma.qRCode.update({
      where: { id: qrCodeEntry.id },
      data: {
        routingUrl,
        base64: qrDataUrl,
      },
    });

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
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}
