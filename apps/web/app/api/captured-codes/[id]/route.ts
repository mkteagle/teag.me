import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth-session";
import { deleteUserCapturedCode } from "@/lib/db/queries";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const deleted = await deleteUserCapturedCode(id, user.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to delete captured code", error);
    return NextResponse.json({ error: "Failed to delete history item" }, { status: 500 });
  }
}
