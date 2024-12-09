// app/r/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RedirectPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = await params;

  useEffect(() => {
    const trackAndRedirect = async () => {
      try {
        const response = await fetch(`/api/track/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to track QR code");
        }

        // Redirect to the destination URL
        window.location.href = data.redirectUrl;
      } catch (error) {
        console.error("Redirect error:", error);
        router.push("/not-found");
      }
    };

    trackAndRedirect();
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
