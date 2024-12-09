import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientRedirect from "@/components/client-redirect";

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
