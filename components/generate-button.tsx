"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GenerateButton() {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("Not logged in");
      }

      const response = await fetch("/api/qr-code/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUrl,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();
      setQrCode(data.data);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Input
        placeholder="Enter redirect URL"
        value={redirectUrl}
        onChange={(e) => setRedirectUrl(e.target.value)}
      />
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate QR Code"}
      </Button>
      {qrCode && <img src={qrCode.base64} alt="QR Code" />}
    </div>
  );
}
