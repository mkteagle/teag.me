import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the redirect result from the URL
    const searchParams = new URL(request.url).searchParams;
      const nextUrl = searchParams.get("next") || "/";
      
    // Redirect to the intended destination
    return NextResponse.redirect(new URL(nextUrl, request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
