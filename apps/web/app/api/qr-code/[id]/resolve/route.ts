import { NextResponse } from "next/server";
import { findQrCodeById } from "@/lib/db/queries";
import { isCameraInvocationId, recordScan } from "@/lib/scan-tracking";

const noStore = { headers: { "Cache-Control": "private, no-store" } };

function destination(redirectUrl: string) {
  return NextResponse.json({ redirectUrl }, noStore);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const qrCode = await findQrCodeById(id);

  if (!qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  return destination(qrCode.redirectUrl);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json().catch(() => null) as { invocationId?: unknown } | null;
  const invocationId = body?.invocationId;
  if (!isCameraInvocationId(invocationId)) {
    return NextResponse.json({ error: "Invalid scanner invocation" }, { status: 400 });
  }

  const { id } = await params;
  const qrCode = await findQrCodeById(id);
  if (!qrCode) return NextResponse.json({ error: "QR code not found" }, { status: 404 });

  await recordScan(qrCode, request.headers, invocationId);

  return destination(qrCode.redirectUrl);
}
