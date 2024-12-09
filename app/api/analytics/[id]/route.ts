import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        scans: {
          orderBy: {
            timestamp: "asc",
          },
          select: {
            id: true,
            timestamp: true,
            country: true,
            city: true,
            region: true,
          },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
