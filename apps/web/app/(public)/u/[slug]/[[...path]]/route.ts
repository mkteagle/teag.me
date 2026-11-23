import { after } from "next/server";
import { blockDestination, blockIsVisible, isLinkPageImage, isPageSlug } from "@/lib/link-pages/model";
import { pageContentPolicy, renderLinkPage } from "@/lib/link-pages/render";
import { publicLinkPage, recordLinkPageEvent } from "@/lib/link-pages/store";

function missing() {
  return new Response("Link page not found.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function GET(request: Request, context: { params: Promise<{ slug: string; path?: string[] }> }) {
  const { slug, path = [] } = await context.params;
  const scan = path.length === 2 && path[0] === "qr";
  const socialImage = path.length === 1 && path[0] === "image";
  const click = path.length === 2 && path[0] === "go";
  if (!isPageSlug(slug) || (path.length && !scan && !click && !socialImage)) return missing();

  const page = await publicLinkPage(slug);
  if (!page || (scan && path[1] !== page.id)) return missing();

  if (socialImage) {
    const image = page.content.cover || page.content.avatar;
    if (!isLinkPageImage(image)) return missing();
    const [mime, encoded] = image.slice(5).split(";base64,");
    return new Response(Uint8Array.from(Buffer.from(encoded, "base64")), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "no-cache",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const track = request.method === "GET" && request.headers.get("purpose") !== "prefetch" &&
    !request.headers.get("sec-purpose")?.includes("prefetch");
  if (click) {
    const block = page.content.blocks.find((block) => block.id === path[1]);
    const destination = block && blockIsVisible(page.content, block) && blockDestination(block);
    if (!block || !destination) return missing();
    if (track) after(() => recordLinkPageEvent(page, "click", block.title || destination.hostname));
    return new Response(null, {
      status: 302,
      headers: { Location: destination.href, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  }

  if (track) after(() => recordLinkPageEvent(page, scan ? "scan" : "view"));
  // WebKit's native audio controls need the sandbox scripting flag. The
  // document's script-src policy still blocks page-authored JavaScript.
  return new Response(renderLinkPage(page.content, slug, `https://teag.me/u/${slug}`), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": pageContentPolicy + "; frame-ancestors 'none'; sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
