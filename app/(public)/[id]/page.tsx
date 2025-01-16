import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientRedirect from "@/components/client-redirect";
import { fetchUrlMetadata } from "@/lib/metadata";
import { type Metadata, type ResolvingMetadata } from "next/types";

export async function generateMetadata(
  { params }: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get QR code data
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: params.id },
  });

  if (!qrCode) {
    return {
      title: "Not Found - teag.me",
      description: "The requested QR code could not be found.",
    };
  }

  try {
    // Fetch metadata from the destination URL
    const metadata = await fetchUrlMetadata(qrCode.redirectUrl);

    // Create dynamic metadata
    return {
      title: metadata.title || "Redirecting...",
      description:
        metadata.description ||
        `You are being redirected to ${qrCode.redirectUrl}`,
      openGraph: {
        title: metadata.title || "Redirecting...",
        description:
          metadata.description ||
          `You are being redirected to ${qrCode.redirectUrl}`,
        url: metadata.url || qrCode.redirectUrl,
        images: metadata.image ? [{ url: metadata.image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: metadata.title || "Redirecting...",
        description:
          metadata.description ||
          `You are being redirected to ${qrCode.redirectUrl}`,
        images: metadata.image ? [metadata.image] : undefined,
      },
      alternates: {
        canonical: qrCode.redirectUrl,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Redirecting...",
      description: `You are being redirected to ${qrCode.redirectUrl}`,
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Verify QR code exists on server side first
  const qrCode = await prisma.qRCode.findUnique({
    where: { id },
  });

  if (!qrCode) {
    redirect("/not-found");
  }

  // Pass to client component for tracking and redirect
  return <ClientRedirect id={id} />;
}
