import { NextResponse } from "next/server";
import { findQrCodeById } from "@/lib/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const qrCode = await findQrCodeById(id);

  if (!qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  return NextResponse.json(
    { redirectUrl: qrCode.redirectUrl },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
