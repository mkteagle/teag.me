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

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(redirectUrl);

    

    // Save to database with user ID
    const qrCode = await prisma.qRCode.create({
      data: {
        redirectUrl,
        base64: qrDataUrl,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        base64: qrCode.base64,
        redirectUrl: qrCode.redirectUrl,
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
