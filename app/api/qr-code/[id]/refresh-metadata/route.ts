import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { findQrCodeById } from "@/lib/db/queries";
import { cacheQrCodeMetadata } from "@/lib/metadata";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const qrCode = await findQrCodeById(id);

  if (!qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  if (qrCode.userId !== currentUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await cacheQrCodeMetadata(id, qrCode.redirectUrl);

  return NextResponse.json({ success: true });
}
