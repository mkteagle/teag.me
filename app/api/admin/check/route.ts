import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth-session";
import { isAdmin } from "@/lib/auth-utils";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireApiUser();
    const adminStatus = await isAdmin(user.id);
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
