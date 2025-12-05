import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    // Verify the token and get the user
    const adminAuth = await getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    return NextResponse.json({
      success: true,
      userId: userId,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
