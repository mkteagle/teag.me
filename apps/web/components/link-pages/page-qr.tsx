"use client";

import { Download, Link2, QrCode, Share, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/posthog";

export function PageQr({ id, slug }: { id: string; slug: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const pagePath = `/u/${slug}`;
  const qrPath = `${pagePath}/qr/${id}`;
  const filename = `${slug}-qr.png`;

  async function loadQr() {
    setLoading(true);
    setNote("");
    try {
      const { toDataURL } = await import("qrcode");
      setQr(await toDataURL(new URL(qrPath, window.location.origin).href, { width: 640, margin: 4 }));
    } catch {
      setNote("Couldn't draw the QR code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function openSheet() {
    dialog.current?.showModal();
    setNote("");
    capture("link_page_qr_viewed");
    if (!qr && !loading) void loadQr();
  }

  async function shareQr() {
    setNote("");
    try {
      const bytes = Uint8Array.from(atob(qr.slice(qr.indexOf(",") + 1)), (char) => char.charCodeAt(0));
      const file = new File([bytes], filename, { type: "image/png" });
      const title = "Link page QR code";
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
      } else if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": file })]);
        setNote("QR image copied.");
      } else if (navigator.share) {
        await navigator.share({ url: new URL(qrPath, window.location.origin).href, title });
      } else {
        setNote("Download the PNG to share the QR image.");
        return;
      }
      capture("link_page_qr_shared");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setNote("Couldn't share the QR image. You can download the PNG.");
      }
    }
  }

  async function copyPageLink() {
    setNote("");
    try {
      await navigator.clipboard.writeText(new URL(pagePath, window.location.origin).href);
      setNote("Page link copied.");
      capture("link_page_url_copied", { source: "qr_sheet" });
    } catch {
      setNote("Couldn't copy the page link.");
    }
  }

  return (
    <>
      <Button type="button" variant="outline" aria-haspopup="dialog" onClick={openSheet}>
        <QrCode className="size-4" aria-hidden="true" /> QR code
      </Button>
      <dialog ref={dialog} aria-labelledby={titleId}
        className="link-page-qr-sheet fixed inset-x-0 bottom-0 top-auto m-0 mx-auto max-h-[calc(100dvh-0.75rem)] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-[1.75rem] border border-b-0 bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-foreground/40"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}>
        <div className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-2xl font-extrabold tracking-tight">Page QR code</h2>
              <p className="mt-0.5 break-all text-sm text-muted-foreground">teag.me{pagePath}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="shrink-0 bg-muted/65"
              aria-label="Close QR code" onClick={() => dialog.current?.close()}>
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="my-4 flex flex-col items-center gap-2 text-center">
            <div className="grid size-44 place-items-center rounded-xl border bg-white sm:size-48">
              {qr
                ? <img src={qr} alt="QR code for this link page" width={192} height={192} className="size-full rounded-xl" />
                : loading
                  ? <p className="px-4 text-sm text-muted-foreground" role="status">Preparing QR code…</p>
                  : <Button variant="outline" size="sm" type="button" onClick={loadQr}>Retry</Button>}
            </div>
            {qr && <p className="text-sm text-muted-foreground">Scan to open this link page</p>}
          </div>
          <div className="grid gap-2">
            <Button type="button" disabled={!qr} onClick={shareQr}>
              <Share className="size-4" aria-hidden="true" /> Share QR code
            </Button>
            {qr ? (
              <Button variant="outline" asChild>
                <a download={filename} href={qr} onClick={() => capture("link_page_qr_downloaded")}>
                  <Download className="size-4" aria-hidden="true" /> Download PNG
                </a>
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled>
                <Download className="size-4" aria-hidden="true" /> Download PNG
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={copyPageLink}>
              <Link2 className="size-4" aria-hidden="true" /> Copy page link
            </Button>
          </div>
          {note && <p className="mt-2 text-center text-sm text-muted-foreground" role="status">{note}</p>}
        </div>
      </dialog>
    </>
  );
}
