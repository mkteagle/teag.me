import { load } from "cheerio";

interface MetadataResult {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export async function fetchUrlMetadata(url: string): Promise<MetadataResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "teag.me metadata bot (hello@teag.me)",
      },
    });

    const html = await response.text();
    const $ = load(html);

    // Get Open Graph and fallback metadata
    return {
      title:
        $('meta[property="og:title"]').attr("content") ||
        $("title").text() ||
        undefined,

      description:
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        undefined,

      image: $('meta[property="og:image"]').attr("content") || undefined,

      url: $('meta[property="og:url"]').attr("content") || url,
    };
  } catch (error) {
    console.error("Error fetching URL metadata:", error);
    return {};
  }
}
