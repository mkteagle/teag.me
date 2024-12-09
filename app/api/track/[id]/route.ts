// app/api/track/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Get tracking information from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor
      ? forwardedFor.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";
    const country = request.headers.get("x-vercel-ip-country");
    const city = request.headers.get("x-vercel-ip-city");
    const region = request.headers.get("x-vercel-ip-region");

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
      },
    });

    // Return success with redirect URL
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
