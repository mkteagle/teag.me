import { NextRequest, NextResponse } from "next/server";
import { findQrCodeById, findUserRole, updateQrCode } from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth-session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    const { archived } = await request.json();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (typeof archived !== "boolean") {
      return NextResponse.json({ error: "archived must be a boolean" }, { status: 400 });
    }

    const role = await findUserRole(currentUser.id);

    if (!role) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = role === "ADMIN";

    // First, verify the QR code belongs to this user (unless they're an admin)
    const qrCode = await findQrCodeById(id);

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    if (!isAdmin && qrCode.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden: You don't own this QR code" }, { status: 403 });
    }

    // Update the archived status
    const updatedQR = await updateQrCode(id, { archived });

    return NextResponse.json({
      success: true,
      data: updatedQR,
    });
  } catch (error) {
    console.error("Error archiving QR code:", error);
    return NextResponse.json({ error: "Failed to archive QR code" }, { status: 500 });
  }
}
