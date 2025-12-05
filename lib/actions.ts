"use server";

import { revalidatePath } from "next/cache";
import { generateId } from "./utils";
import { getAdminAuth } from "./firebase-admin";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// Get Current User ID
async function getCurrentUserId() {
  try {
    const sessionCookie = (await cookies()).get("__session")?.value;

    if (!sessionCookie) {
      console.error("Session cookie not found.");
      throw new Error("Not authenticated");
    }

    const adminAuth = await getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    return decodedClaims.uid;
  } catch (error: any) {
    console.error("Error verifying session cookie:", error);

    // Handle known errors explicitly
    if (error.message.includes("Firebase ID token has expired")) {
      throw new Error("Session expired. Please log in again.");
    } else if (error.message.includes("Decoding Firebase ID token failed")) {
      throw new Error("Invalid session. Please log in again.");
    }

    // Fallback for unknown errors
    throw new Error("Authentication required");
  }
}

export async function loginWithIdToken(idToken: string) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to log in");
    }

    return response.json();
  } catch (error) {
    console.error("Error in loginWithIdToken:", error);
    throw error;
  }
}

// Generate QR code and save it to the database
export async function generateQRCode(redirectUrl: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/qr-code/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
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

// Record Scan
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
    await prisma.scan.create({
      data: {
        id: generateId(),
        qrCodeId,
        ...data,
      },
    });
    revalidatePath(`/analytics/${qrCodeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error recording scan:", error);
    return { success: false, error: "Failed to record scan" };
  }
}

// Get QR Code Analytics
export async function getQRCodeAnalytics(id: string) {
  try {
    const userId = await getCurrentUserId();
    const qrCode = await prisma.qRCode.findUnique({
      where: { id, userId },
      include: {
        scans: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!qrCode) {
      throw new Error("QR code not found or access denied");
    }

    return qrCode;
  } catch (error) {
    console.error("Error getting analytics:", error);
    return null;
  }
}
