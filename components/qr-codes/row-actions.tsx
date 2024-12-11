import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, BarChart2, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExtendedQRCode } from "./types";

interface RowActionsProps {
  qrCode: ExtendedQRCode;
  onDelete?: (qrCode: ExtendedQRCode) => void;
}

export function RowActions({ qrCode, onDelete }: RowActionsProps) {
  const handleDownload = () => {
    const base64Data = qrCode.base64; // Assuming this is passed as a prop
    const blob = new Blob([base64Data], { type: "image/png" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${qrCode.id || "qr_code"}.png`;
    link.click();
  };

  const handleView = () => {
    const base64Data = qrCode.base64; // Assuming this is passed as a prop
    const imageUrl = `data:image/png;base64,${base64Data}`;
    window.open(imageUrl, "_blank");
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
                handleView();
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
