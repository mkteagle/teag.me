import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./firebase-admin";

export async function validateSession(request: NextRequest) {
  try {
    const session = request.headers.get("x-session-token");

    if (!session) {
      throw new Error("No session token found");
    }

    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return { userId: decodedClaims.uid };
  } catch (error) {
    console.error("Session validation error:", error);
    throw error;
  }
}
