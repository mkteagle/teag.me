"use server";

import { revalidatePath } from "next/cache";
import { generateId } from "./utils";
import { createScan, getOwnedQrCodeAnalytics } from "@/lib/db/queries";
import { requireApiUser } from "@/lib/auth-session";

export async function generateQRCode(redirectUrl: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/qr-code/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ redirectUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate QR code");
    }

    return response.json();
  } catch (error) {
    console.error("Error in generateQRCode:", error);
    throw error;
  }
}

export async function recordScan(
  qrCodeId: string,
  data: {
    ip: string;
    userAgent: string;
    country?: string;
    city?: string;
    region?: string;
  }
) {
  try {
    await createScan({
      id: generateId(),
      qrCodeId,
      ...data,
    });
    revalidatePath(`/analytics/${qrCodeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error recording scan:", error);
    return { success: false, error: "Failed to record scan" };
  }
}

export async function getQRCodeAnalytics(id: string) {
  try {
    const user = await requireApiUser();
    const qrCode = await getOwnedQrCodeAnalytics(id, user.id);

    if (!qrCode) {
      throw new Error("QR code not found or access denied");
    }

    return qrCode;
  } catch (error) {
    console.error("Error getting analytics:", error);
    return null;
  }
}
