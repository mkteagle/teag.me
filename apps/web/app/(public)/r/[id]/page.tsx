import { redirect } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import { findQrCodeById } from "@/lib/db/queries";
import { recordScan } from "@/lib/scan-tracking";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const qrCode = await findQrCodeById(id);

  if (!qrCode) {
    redirect("/not-found");
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "unknown";
  const userAgent = headersList.get("user-agent") ?? "unknown";
  const referrer = headersList.get("referer");
  const country = headersList.get("x-vercel-ip-country");
  const city = headersList.get("x-vercel-ip-city");
  const region = headersList.get("x-vercel-ip-region");

  after(() =>
    recordScan({
      qrCodeId: id,
      userId: qrCode.userId,
      ip,
      userAgent,
      referrer,
      country,
      city,
      region,
    })
  );

  redirect(qrCode.redirectUrl);
}
