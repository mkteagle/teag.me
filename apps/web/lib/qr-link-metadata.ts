import type { Metadata } from "next";
import { findQrCodeById } from "@/lib/db/queries";

export async function getQrLinkMetadata(id: string): Promise<Metadata> {
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
