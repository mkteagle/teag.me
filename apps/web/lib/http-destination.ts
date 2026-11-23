export function parseHttpDestination(value: unknown): URL | null {
  if (typeof value !== "string" || value.length > 8_192) return null;

  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    if (url.href.length > 8_192) return null;
    return url;
  } catch {
    return null;
  }
}
