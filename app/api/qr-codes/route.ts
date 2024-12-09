import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assuming Prisma is set up for your project

export async function GET() {
  try {
    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: "desc" }, // Sort by most recent
      select: {
        id: true,
        redirectUrl: true,
        base64: true,
        createdAt: true,
        scans: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}
