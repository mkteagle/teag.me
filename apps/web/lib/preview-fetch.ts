import { lookup } from "node:dns/promises";
import { once } from "node:events";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

import ipaddr from "ipaddr.js";

import { parseHttpDestination } from "./http-destination";

const MAX_PREVIEW_BYTES = 1_048_576;
const htmlTypes = ["text/html", "application/xhtml+xml"];
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const MAX_REDIRECTS = 3;
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);
const globalIpv6 = ipaddr.IPv6.parse("2000::");
const specialIpv6 = ipaddr.IPv6.parse("2001::");
const documentationIpv6 = ipaddr.IPv6.parse("3fff::");

export function isPublicPreviewAddress(value: string): boolean {
  if (!isIP(value)) return false;
  const address = ipaddr.process(value);
  if (address.range() !== "unicast") return false;
  if (!(address instanceof ipaddr.IPv6)) return true;
  return address.match(globalIpv6, 3) && !address.match(specialIpv6, 23) && !address.match(documentationIpv6, 20);
}

async function getPreviewResponse(url: URL, signal: AbortSignal, types: string[]): Promise<IncomingMessage> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const family = isIP(hostname);
  const addresses = family
    ? [{ address: hostname, family }]
    : await Promise.race([
        lookup(hostname, { all: true }),
        once(signal, "abort").then(() => { throw signal.reason; }),
      ]);
  if (!addresses.length || addresses.some(({ address }) => !isPublicPreviewAddress(address))) {
    throw new Error("Preview destination must resolve to a public address");
  }

  // Connect to the same address we validated. Keep the URL hostname for HTTP and TLS.
  const address = addresses.find((answer) => answer.family === 4) ?? addresses[0];
  const request = url.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const outgoing = request(url, {
      agent: false,
      family: address.family,
      lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
      signal,
      headers: {
        Accept: types.join(","),
        "Accept-Encoding": "identity",
        "User-Agent": "teag.me metadata bot (hello@teag.me)",
      },
    }, resolve);
    outgoing.once("error", reject);
    outgoing.end();
  });
}

async function fetchPreviewResource(destination: string, types: string[]) {
  const signal = AbortSignal.timeout(4_000);
  let url = parseHttpDestination(destination);
  for (let redirects = 0; url && redirects <= MAX_REDIRECTS; redirects++) {
    signal.throwIfAborted();
    // The URL parser clears explicit default ports. Skip previews on any other port.
    if (url.port) return null;
    const response = await getPreviewResponse(url, signal, types);
    try {
      const status = response.statusCode ?? 0;
      const location = response.headers.location;
      if (REDIRECT_CODES.has(status) && location) {
        url = parseHttpDestination(new URL(location, url).href);
        continue;
      }

      const type = response.headers["content-type"]?.split(";")[0].trim().toLowerCase();
      const encoding = response.headers["content-encoding"]?.toLowerCase();
      if (status !== 200 || (!type || !types.includes(type)) ||
          (encoding && encoding !== "identity") || Number(response.headers["content-length"]) > MAX_PREVIEW_BYTES) {
        return null;
      }

      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of response) {
        size += chunk.length;
        if (size > MAX_PREVIEW_BYTES) return null;
        chunks.push(chunk);
      }
      return { data: Buffer.concat(chunks), url };
    } finally {
      if (!response.complete) response.destroy();
    }
  }
  return null;
}

export async function fetchPreviewHtml(destination: string): Promise<{ html: string; url: URL } | null> {
  const preview = await fetchPreviewResource(destination, htmlTypes);
  return preview && { html: preview.data.toString("utf8"), url: preview.url };
}

export async function fetchPreviewImage(destination: string) {
  return (await fetchPreviewResource(destination, imageTypes))?.data;
}
