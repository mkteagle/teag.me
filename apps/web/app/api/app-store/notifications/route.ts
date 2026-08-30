import { NextResponse } from "next/server";

import { applyVerifiedNotification, verifyAppStoreNotification } from "@/lib/app-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { signedPayload?: unknown };
    if (typeof body.signedPayload !== "string" || body.signedPayload.length > 250_000) {
      return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
    }
    const notification = await verifyAppStoreNotification(body.signedPayload);
    await applyVerifiedNotification(notification);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Failed to process App Store notification", error);
    return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  }
}
