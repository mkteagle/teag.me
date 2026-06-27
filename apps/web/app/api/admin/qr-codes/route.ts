import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth-session";
import { listAdminQrCodes } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    try {
      await requireAdminUser();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const archived = searchParams.get("archived") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const { qrCodes, totalCount } = await listAdminQrCodes({
      archived,
      page,
      limit,
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
