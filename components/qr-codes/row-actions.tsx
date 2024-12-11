import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, BarChart2, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExtendedQRCode } from "./types";
import { toast } from "../ui/use-toast";
import { useState } from "react";

interface RowActionsProps {
  qrCode: ExtendedQRCode;
  onDelete?: (qrCode: ExtendedQRCode) => void;
}

export function RowActions({ qrCode, onDelete }: RowActionsProps) {
  const [copied, setCopied] = useState(false);
  const handleDownload = () => {
    if (!qrCode) return;

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = qrCode.base64;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been saved to your device.",
    });
  };

  const handleCopy = async () => {
    if (!qrCode) return;

    try {
      await navigator.clipboard.writeText(qrCode.base64);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "QR code URL copied to clipboard.",
      });

      // Reset copy status after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy QR code URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                window.open(qrCode.redirectUrl, "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open URL</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View QR Code</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download QR Code</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onDelete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(qrCode);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete QR Code</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
