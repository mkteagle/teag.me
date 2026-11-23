import { redirect } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import { findQrCodeById } from "@/lib/db/queries";
import { getQrLinkMetadata } from "@/lib/qr-link-metadata";
import { isCameraInvocationId, recordScan } from "@/lib/scan-tracking";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return getQrLinkMetadata((await params).id);
}

export default async function RedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ open?: string; scan?: string }>;
}) {
  const { id } = await params;
  const qrCode = await findQrCodeById(id);

  if (!qrCode) {
    redirect("/not-found");
  }

  const [requestHeaders, { open, scan }] = await Promise.all([headers(), searchParams]);
  const invocationId = open === "web" && isCameraInvocationId(scan) ? scan : undefined;
  after(() => recordScan(qrCode, requestHeaders, invocationId));

  redirect(qrCode.redirectUrl);
}
