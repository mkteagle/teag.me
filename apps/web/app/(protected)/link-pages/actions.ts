"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-session";
import { isPageSlug, validateContent } from "@/lib/link-pages/model";
import { createLinkPage, LinkPageError, removeLinkPage, updateLinkPage } from "@/lib/link-pages/store";

export async function createPage(slug: string, name: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to create a page." };
  if (typeof slug !== "string" || !isPageSlug(slug)) return { error: "Use 3–40 lowercase letters, numbers, or hyphens." };
  if (typeof name !== "string" || !name.trim() || name.length > 100) return { error: "Enter a display name." };

  try {
    return await createLinkPage(user.id, slug, name.trim());
  } catch (error) {
    if (error instanceof LinkPageError) return { error: error.message };
    console.error("Failed to create link page", error);
    return { error: "Could not create the page. Try again." };
  }
}

export async function savePage(id: string, version: number, content: unknown, publish: boolean) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again to save this page." };
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{21}$/.test(id) ||
      !Number.isSafeInteger(version) || version < 1 || typeof publish !== "boolean") {
    return { error: "Invalid page request." };
  }
  let validated;
  try {
    validated = validateContent(content, publish);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Check your page settings." };
  }
  try {
    return await updateLinkPage(user.id, id, version, validated, publish);
  } catch (error) {
    if (error instanceof LinkPageError) return { error: error.message };
    console.error("Failed to save link page", error);
    return { error: "Could not save the page. Try again." };
  }
}

export async function deletePage(id: string) {
  const user = await getCurrentUser();
  if (!user || typeof id !== "string" || !/^[a-zA-Z0-9_-]{21}$/.test(id)) return { error: "Sign in again to delete this page." };
  try {
    await removeLinkPage(user.id, id);
  } catch (error) {
    console.error("Failed to delete link page", error);
    return { error: "Could not delete the page. Try again." };
  }
  redirect("/link-pages");
}

export async function getLinkPreview(destination: string) {
  if (!await getCurrentUser() || typeof destination !== "string" || destination.length > 2_048) return null;
  const { fetchUrlMetadata } = await import("@/lib/metadata");
  const meta = await fetchUrlMetadata(destination);
  let image = "";
  if (meta.image) {
    try {
      const [{ fetchPreviewImage }, { default: sharp }] = await Promise.all([
        import("@/lib/preview-fetch"), import("sharp"),
      ]);
      const bytes = await fetchPreviewImage(meta.image);
      if (bytes) {
        const input = sharp(bytes, { limitInputPixels: 8_000_000 });
        const { format } = await input.metadata();
        if (format === "jpeg" || format === "png" || format === "webp") {
          const thumbnail = await input.rotate().resize(320, 220, { fit: "inside", withoutEnlargement: true }).webp().toBuffer();
          image = `data:image/webp;base64,${thumbnail.toString("base64")}`;
        }
      }
    } catch {
      // The destination title is still usable when its image isn't available.
    }
  }
  return { title: meta.title?.trim().slice(0, 150), image };
}
