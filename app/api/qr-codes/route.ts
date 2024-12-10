import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from Authorization header
    const authHeader = request.headers.get("Authorization");
    const userId = authHeader?.split("Bearer ")[1];

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId: userId, // Filter by user ID
      },
      orderBy: {
        createdAt: "desc",
      },
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
