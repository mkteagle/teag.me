"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeWallProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  feature?: string;
  current?: number;
  limit?: number;
}

export function UpgradeWall({
  open,
  onClose,
  title = "Upgrade required",
  description,
  feature,
  current,
  limit,
}: UpgradeWallProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback to upgrade page
      router.push("/upgrade");
    }
  };

  const defaultDescription = limit !== undefined
    ? `You've used ${current?.toLocaleString()} of ${limit.toLocaleString()} on the Free plan. Upgrade to Pro for higher limits.`
    : `This feature requires a Pro plan. Upgrade to unlock ${feature || "it"}.`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldAlert className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Button
            className="w-full gap-2"
            onClick={handleUpgrade}
            disabled={loading}
          >
            <Zap className="h-4 w-4" />
            {loading ? "Redirecting..." : "Upgrade to Pro — $9/mo"}
          </Button>
          <Button
            className="w-full"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
