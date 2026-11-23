import { createHash, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { rabbitsSongSlug, type LinkBlock } from "./model";
import { songPlayerScript } from "./song-player";

const artistOrigin = "https://www.2001rabbits.com";
const analyticsAudience = "teag-link-page-song-play";
const streamingHeaders = {
  "Cache-Control": "private, no-store",
  "Content-Disposition": "inline",
  "Content-Type": "audio/mpeg",
  "X-Content-Type-Options": "nosniff",
};

const playerHash = createHash("sha256").update(songPlayerScript).digest("base64");
export function songScriptPolicy(requestUrl: string) {
  // In WebKit, 'self' is the opaque sandbox origin. Allow the page's actual
  // origin explicitly so the player can send its signed playback event.
  const origin = new URL(requestUrl).origin;
  return `script-src 'sha256-${playerHash}'; connect-src ${origin}`;
}

function signingKey() {
  const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;
  return secret ? createHash("sha256").update("teag-link-page-song-play\0").update(secret).digest() : null;
}

function sourceVersion(block: LinkBlock) {
  return createHash("sha256").update(JSON.stringify([block.url, block.audio])).digest("base64url");
}

export async function issueSongPlayGrant(pageId: string, block: LinkBlock) {
  const key = signingKey();
  if (!key) return null;
  return new SignJWT({ blockId: block.id, sourceVersion: sourceVersion(block) })
    .setProtectedHeader({ alg: "HS256" }).setAudience(analyticsAudience)
    .setSubject(pageId).setJti(randomUUID()).setExpirationTime("24h").sign(key);
}

export async function verifySongPlayGrant(grant: string, pageId: string, block: LinkBlock) {
  const key = signingKey();
  if (!key || grant.length > 1000) return null;
  try {
    const { payload } = await jwtVerify(grant, key, { algorithms: ["HS256"], audience: analyticsAudience, subject: pageId });
    if (payload.blockId !== block.id || payload.sourceVersion !== sourceVersion(block)) return null;
    return payload.jti ?? null;
  } catch {
    return null;
  }
}

export async function streamRabbitsSong(request: Request, slug: string) {
  const destination = request.headers.get("sec-fetch-dest");
  if (destination && destination !== "audio" && destination !== "video") return new Response(null, { status: 403 });
  const range = request.headers.get("range");
  if (range && !/^bytes=(?:\d{1,16}-\d{0,16}|-\d{1,16})$/.test(range)) return new Response(null, { status: 416 });

  try {
    const session = await fetch(`${artistOrigin}/api/play/${slug}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(6_000),
    });
    if (!session.ok) return new Response(null, { status: session.status === 404 ? 404 : 502 });
    const sessionData: { streamUrl?: unknown } = await session.json();
    const streamUrl = sessionData.streamUrl;
    if (typeof streamUrl !== "string" || !/^\/api\/stream\/[A-Za-z0-9_-]{1,2048}\.[A-Za-z0-9_-]{1,128}$/.test(streamUrl)) {
      return new Response(null, { status: 502 });
    }
    const upstream = await fetch(artistOrigin + streamUrl, {
      headers: range ? { Range: range } : undefined,
      cache: "no-store", redirect: "error", signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
    });
    const headers = new Headers(streamingHeaders);
    for (const key of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(key);
      if (value) headers.set(key, value);
    }
    if (upstream.status === 416) {
      await upstream.body?.cancel();
      headers.delete("content-length");
      return new Response(null, { status: 416, headers });
    }
    if (upstream.status !== 200 && upstream.status !== 206) {
      await upstream.body?.cancel();
      return new Response(null, { status: 502 });
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response(null, { status: 502 });
  }
}

export async function captureSongPlay(playId: string, page: { id: string; slug: string }, block: LinkBlock) {
  const slug = rabbitsSongSlug(block.url);
  const defaultToken = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const targets = new Map<string, string>();
  if (defaultToken) targets.set(defaultToken, process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com");
  const artistToken = process.env.RABBITS_POSTHOG_PROJECT_TOKEN;
  if (slug && artistToken) targets.set(artistToken, process.env.RABBITS_POSTHOG_HOST || "https://us.i.posthog.com");
  const sourceUrl = `https://teag.me/u/${page.slug}`;
  const results = await Promise.allSettled([...targets].map(async ([apiKey, host]) => {
    const response = await fetch(new URL("/i/v0/e/", host), {
      method: "POST", headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(4_000),
      body: JSON.stringify({
        api_key: apiKey, event: "song_played", distinct_id: playId, uuid: playId,
        properties: {
          slug: slug ?? block.id, title: block.title, source: "teag.me",
          source_url: sourceUrl, $current_url: sourceUrl,
          link_page_id: page.id, song_block_id: block.id, $geoip_disable: true, $process_person_profile: false,
        },
      }),
    });
    return response.ok;
  }));
  const accepted = Boolean(defaultToken && (!slug || artistToken)) &&
    results.every((result) => result.status === "fulfilled" && result.value);
  if (!accepted) console.error("Song play analytics capture was incomplete");
  return accepted;
}
