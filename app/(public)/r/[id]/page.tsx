import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { recordScan } from "@/lib/actions";
import { headers } from "next/headers";

async function getIpAddress() {
  const headersList = headers();
  return (await headersList).get("x-forwarded-for") || "unknown";
}

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      console.error(`QR code not found: ${id}`);
      redirect("/404");
    }

    const headersList = headers();
    await recordScan(id, {
      ip: await getIpAddress(),
      userAgent: (await headersList).get("user-agent") || "unknown",
      country: (await headersList).get("x-vercel-ip-country") || undefined,
      city: (await headersList).get("x-vercel-ip-city") || undefined,
      region: (await headersList).get("x-vercel-ip-region") || undefined,
    });

    return redirect(qrCode.redirectUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    redirect("/404");
  }
}
