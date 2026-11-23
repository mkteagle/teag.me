import { Archive, ArchiveRestore, Download, Edit, ExternalLink, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { DisclosureMenu, disclosureItemClass } from "@/components/ui/disclosure-menu";
import { capture } from "@/lib/posthog";
import { toast } from "@/components/ui/use-toast";
import type { ExtendedQRCode } from "./types";

interface RowActionsProps {
  qrCode: ExtendedQRCode;
  onDelete?: (qrCode: ExtendedQRCode) => void;
  onEdit?: (qrCode: ExtendedQRCode) => void;
  onArchive?: (qrCode: ExtendedQRCode, archived: boolean) => void;
}

const icon = "size-4 shrink-0";

export function RowActions({ qrCode, onDelete, onEdit, onArchive }: RowActionsProps) {
  const refreshPreview = async () => {
    try {
      const response = await fetch(`/api/qr-code/${qrCode.id}/refresh-metadata`, { method: "POST" });
      if (!response.ok) throw new Error("Could not refresh preview");
      toast({ title: "Preview updated" });
    } catch {
      toast({ title: "Couldn’t refresh the link preview", variant: "destructive" });
    }
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = qrCode.base64;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    capture("qr_code_downloaded", { source: "registry", tracked: true });
    toast({ title: "QR code downloaded" });
  };

  return (
    <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
      <DisclosureMenu
        label="QR code actions"
        triggerClassName="w-11 border hover:bg-muted"
        trigger={<MoreHorizontal className="size-5" aria-hidden="true" />}
      >
        <a href={qrCode.redirectUrl} target="_blank" rel="noreferrer" className={disclosureItemClass}>
          <ExternalLink className={icon} aria-hidden="true" /> Open destination
        </a>
        {onEdit && <button type="button" className={disclosureItemClass} onClick={() => onEdit(qrCode)}>
          <Edit className={icon} aria-hidden="true" /> Edit QR code
        </button>}
        <button type="button" className={disclosureItemClass} onClick={download}>
          <Download className={icon} aria-hidden="true" /> Download PNG
        </button>
        <button type="button" className={disclosureItemClass} onClick={() => void refreshPreview()}>
          <RefreshCw className={icon} aria-hidden="true" /> Refresh link preview
        </button>
        {onArchive && <button type="button" className={disclosureItemClass} onClick={() => onArchive(qrCode, !qrCode.archived)}>
          {qrCode.archived ? <ArchiveRestore className={icon} aria-hidden="true" /> : <Archive className={icon} aria-hidden="true" />}
          {qrCode.archived ? "Restore QR code" : "Archive QR code"}
        </button>}
        {onDelete && <button type="button" className={`${disclosureItemClass} text-destructive`} onClick={() => onDelete(qrCode)}>
          <Trash2 className={icon} aria-hidden="true" /> Delete QR code
        </button>}
      </DisclosureMenu>
    </div>
  );
}
