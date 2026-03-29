import { redirect } from "next/navigation";
import ClientRedirect from "@/components/client-redirect";
import { findQrCodeById } from "@/lib/db/queries";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Verify QR code exists on server side first
  const qrCode = await findQrCodeById(id);

  if (!qrCode) {
    redirect("/not-found");
  }

  // Pass to client component for tracking and redirect
  return <ClientRedirect id={id} />;
}
