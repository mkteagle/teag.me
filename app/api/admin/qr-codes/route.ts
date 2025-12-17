import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const userId = authHeader?.split("Bearer ")[1];

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check admin status from database
    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const archived = searchParams.get("archived") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Build the where clause
    const whereClause = {
      archived: archived, // Filter by archived status
    };

    // Get total count for pagination
    const totalCount = await prisma.qRCode.count({
      where: whereClause,
    });

    const qrCodes = await prisma.qRCode.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        scans: {
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

    return NextResponse.json({
      qrCodes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}
