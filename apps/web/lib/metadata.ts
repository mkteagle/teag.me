import { load } from "cheerio";
import { updateQrCode } from "@/lib/db/queries";
import { parseHttpDestination } from "./http-destination";
import { fetchPreviewHtml } from "./preview-fetch";

interface MetadataResult {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export async function fetchUrlMetadata(url: string): Promise<MetadataResult> {
  try {
    const preview = await fetchPreviewHtml(url);
    if (!preview) return {};
    const $ = load(preview.html);
    const image = $('meta[property="og:image"]').attr("content");
    let imageUrl: string | undefined;
    if (image) {
      try { imageUrl = parseHttpDestination(new URL(image, preview.url).href)?.href; } catch {}
    }

    // Get Open Graph and fallback metadata
    return {
      title:
        ($('meta[property="og:title"]').attr("content") || $("title").text()).slice(0, 512) || undefined,

      description:
        ($('meta[property="og:description"]').attr("content") ||
          $('meta[name="description"]').attr("content") || "").slice(0, 2_048) || undefined,

      image: imageUrl,
      url: preview.url.href,
    };
  } catch {
    return {};
  }
}

export async function cacheQrCodeMetadata(
  qrCodeId: string,
  url: string
): Promise<void> {
  try {
    const meta = await fetchUrlMetadata(url);
    if (meta.title || meta.description || meta.image) {
      await updateQrCode(qrCodeId, {
        ogTitle: meta.title ?? null,
        ogDescription: meta.description ?? null,
        ogImage: meta.image ?? null,
      });
    }
  } catch (err) {
    console.error("Failed to cache QR code metadata:", err);
  }
}
