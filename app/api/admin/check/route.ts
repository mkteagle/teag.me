import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const userId = authHeader?.split("Bearer ")[1];

    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    const adminStatus = await isAdmin(userId);
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
