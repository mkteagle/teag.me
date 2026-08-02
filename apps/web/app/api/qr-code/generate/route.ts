import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { generateQRWithLogoBuffer, processLogoImage } from "@/lib/qr-with-logo";

/**
 * Stateless QR generator. Unlike /api/qr-code/create this does NOT require auth,
 * a DB row, or R2 upload — it just encodes an arbitrary value and returns the
 * image bytes. Use it for one-off QR codes (e.g. encoding a redeem link) where
 * you don't need tracking/analytics.
 *
 *   GET  /api/qr-code/generate?text=<value>&size=512[&download=1]
 *   POST /api/qr-code/generate  { text|url, size?, logoDataUrl?, logoSize?, format? }
 *
 * POST `format: "dataurl"` returns JSON `{ dataUrl }`; anything else (and all GET
 * requests) return the raw image with the correct Content-Type.
 */

const MAX_TEXT_LENGTH = 2000; // well under the QR capacity ceiling for level H

function clampSize(value: unknown, fallback = 512): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(2048, Math.max(64, Math.round(n)));
}

async function buildQr(opts: {
  text: string;
  size: number;
  logoDataUrl?: string;
  logoSize?: number;
}): Promise<{ buffer: Buffer; contentType: string }> {
  // With a logo we composite via the shared lib (returns JPEG).
  if (opts.logoDataUrl) {
    const { dataUrl } = await processLogoImage(opts.logoDataUrl);
    const buffer = await generateQRWithLogoBuffer({
      text: opts.text,
      logoDataUrl: dataUrl,
      logoSize: opts.logoSize ?? 20,
      qrSize: opts.size,
      errorCorrectionLevel: "H",
    });
    return { buffer, contentType: "image/jpeg" };
  }

  // Plain QR: emit a crisp lossless PNG straight from the qrcode lib.
  const buffer = await QRCode.toBuffer(opts.text, {
    width: opts.size,
    margin: 1,
    errorCorrectionLevel: "H",
    type: "png",
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  return { buffer, contentType: "image/png" };
}

function validateText(text: unknown): string | NextResponse {
  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "A non-empty `text` (or `url`) value is required" },
      { status: 400 }
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Value exceeds the ${MAX_TEXT_LENGTH}-character limit` },
      { status: 400 }
    );
  }
  return text;
}

function imageResponse(
  buffer: Buffer,
  contentType: string,
  download: boolean
): NextResponse {
  const ext = contentType === "image/png" ? "png" : "jpg";
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="qr-code.${ext}"`;
  }
  return new NextResponse(buffer as unknown as BodyInit, { headers });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("text") ?? searchParams.get("url");
    const validated = validateText(raw);
    if (validated instanceof NextResponse) return validated;

    const size = clampSize(searchParams.get("size"));
    const download =
      searchParams.get("download") === "1" ||
      searchParams.get("download") === "true";

    const { buffer, contentType } = await buildQr({ text: validated, size });
    return imageResponse(buffer, contentType, download);
  } catch (error) {
    console.error("Error generating QR code:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate QR code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = body.text ?? body.url;
    const validated = validateText(raw);
    if (validated instanceof NextResponse) return validated;

    const size = clampSize(body.size);
    const { buffer, contentType } = await buildQr({
      text: validated,
      size,
      logoDataUrl: body.logoDataUrl,
      logoSize: body.logoSize,
    });

    if (body.format === "dataurl") {
      return NextResponse.json({
        success: true,
        dataUrl: `data:${contentType};base64,${buffer.toString("base64")}`,
      });
    }

    return imageResponse(buffer, contentType, body.download === true);
  } catch (error) {
    console.error("Error generating QR code:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate QR code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
