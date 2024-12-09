import { NextRequest, NextResponse } from "next/server";
import { recordScan } from "@/lib/actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get IP address - check forwarded header first, then request.ip
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0]
    : request.headers.get("x-real-ip") || "unknown";

  // Get user agent
  const userAgent = request.headers.get("user-agent") || "unknown";

  await recordScan((await params).id, {
    ip,
    userAgent,
  });

  return NextResponse.redirect(process.env.NEXT_PUBLIC_DESTINATION_URL || "/");
}
