import { redirect } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import { type Metadata } from "next";
import { findQrCodeById } from "@/lib/db/queries";
import { recordScan } from "@/lib/scan-tracking";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const qrCode = await findQrCodeById(id);

  if (!qrCode) {
    return { title: "Not Found - teag.me" };
  }

  let hostname = qrCode.redirectUrl;
  try {
    hostname = new URL(qrCode.redirectUrl).hostname;
  } catch {}

  const title = qrCode.ogTitle ?? `QR Code → ${hostname}`;
  const description = qrCode.ogDescription ?? `Scan to visit ${qrCode.redirectUrl}`;
  const image = qrCode.ogImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: qrCode.redirectUrl,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: qrCode.redirectUrl },
    robots: { index: false, follow: true },
  };
}

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
