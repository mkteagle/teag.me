import { after } from "next/server";
import { blockDestination, blockIsVisible, isLinkPageImage, isPageSlug, rabbitsSongSlug } from "@/lib/link-pages/model";
import { pageContentPolicy, renderLinkPage } from "@/lib/link-pages/render";
import { captureSongPlay, issueSongPlayGrant, songScriptPolicy, streamRabbitsSong, verifySongPlayGrant } from "@/lib/link-pages/song-stream";
import { publicLinkPage, recordLinkPageEvent } from "@/lib/link-pages/store";

function missing() {
  return new Response("Link page not found.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

function clickLocation(headers: Headers) {
  if (headers.get("dnt") === "1" || headers.get("sec-gpc") === "1") return {};

  let city: string | null = null;
  try {
    const decoded = decodeURIComponent(headers.get("x-vercel-ip-city") ?? "").trim();
    if (decoded && !/[\x00-\x1f\x7f]/.test(decoded)) city = decoded;
  } catch {
    // An invalid location header should never prevent the click from being recorded.
  }

  return {
    city,
    region: headers.get("x-vercel-ip-country-region"),
    country: headers.get("x-vercel-ip-country"),
  };
}

export async function GET(request: Request, context: { params: Promise<{ slug: string; path?: string[] }> }) {
  const { slug, path = [] } = await context.params;
  const scan = path.length === 2 && path[0] === "qr";
  const socialImage = path.length === 1 && path[0] === "image";
  const click = path.length === 2 && path[0] === "go";
  const streaming = path.length === 2 && path[0] === "stream";
  if (!isPageSlug(slug) || (path.length && !scan && !click && !socialImage && !streaming)) return missing();

  const page = await publicLinkPage(slug);
  if (!page || (scan && path[1] !== page.id)) return missing();

  if (streaming) {
    const block = page.content.blocks.find((block) => block.id === path[1]);
    if (!block || block.type !== "song" || !blockIsVisible(page.content, block)) return missing();
    const track = rabbitsSongSlug(block.url);
    return track ? streamRabbitsSong(request, track) : missing();
  }

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
    if (track) {
      const details = { blockTitle: block.title || destination.hostname, ...clickLocation(request.headers) };
      after(() => recordLinkPageEvent(page, "click", details));
    }
    return new Response(null, {
      status: 302,
      headers: { Location: destination.href, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  }

  if (track) after(() => recordLinkPageEvent(page, scan ? "scan" : "view"));
  const songs = page.content.blocks.filter((block) =>
    block.type === "song" && blockIsVisible(page.content, block) && (block.audio || rabbitsSongSlug(block.url)));
  const grants = new Map<string, string>();
  await Promise.all(songs.map(async (block) => {
    const grant = await issueSongPlayGrant(page.id, block);
    if (grant) grants.set(block.id, grant);
  }));
  const songScripts = songs.length ? { policy: songScriptPolicy(request.url), grants } : undefined;
  const policy = songScripts ? pageContentPolicy.replace("script-src 'none'", songScripts.policy) : pageContentPolicy;
  // WebKit needs the sandbox scripting flag for native audio controls.
  // CSP permits only the exact player script when songs are present.
  return new Response(renderLinkPage(page.content, slug, `https://teag.me/u/${slug}`, songScripts), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": policy + "; frame-ancestors 'none'; sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string; path?: string[] }> }) {
  const { slug, path = [] } = await context.params;
  if (!isPageSlug(slug) || path.length !== 2 || path[0] !== "play") return missing();
  const grant = new URL(request.url).searchParams.get("grant");
  if (!grant || grant.length > 1000) return missing();
  if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return new Response(null, { status: 204 });
  const page = await publicLinkPage(slug);
  const block = page?.content.blocks.find((block) => block.id === path[1]);
  if (!page || !block || block.type !== "song" || !blockIsVisible(page.content, block)) return missing();
  const playId = await verifySongPlayGrant(grant, page.id, block);
  if (!playId) return missing();
  const accepted = await captureSongPlay(playId, page, block);
  return new Response(null, { status: accepted ? 204 : 502, headers: { "Cache-Control": "no-store" } });
}
