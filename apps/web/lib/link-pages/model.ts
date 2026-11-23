import { parseHttpDestination } from "../http-destination";

export const blockTypes = ["link", "video", "song", "text", "divider", "social"] as const;
export type BlockType = typeof blockTypes[number];

export const rowStyles = ["plain", "outlined", "filled", "accented"] as const;
export type RowStyle = typeof rowStyles[number];

export type LinkBlock = {
  id: string;
  createdAt: number;
  type: BlockType;
  title: string;
  description: string;
  url: string;
  audio: string;
  image: string;
  section: "featured" | "latest" | "pinned";
  hidden: boolean;
  rowStyle?: RowStyle;
};

export type LinkPageContent = {
  name: string;
  bio: string;
  cover: string;
  avatar: string;
  coverHeight: number;
  coverPosition: number;
  avatarSize: number;
  avatarBorder: number;
  avatarBorderColor: string;
  avatarOverlap: number;
  avatarGap: number;
  background: string;
  textColor: string;
  accent: string;
  rowStyle?: RowStyle;
  showAddress: boolean;
  latestHeading: string;
  pinnedHeading: string;
  showLatest: boolean;
  showPinned: boolean;
  showFeatured: boolean;
  showThumbnails: boolean;
  newestFirst: boolean;
  pinnedFirst: boolean;
  css: string;
  blocks: LinkBlock[];
};

export const defaultContent: LinkPageContent = {
  name: "", bio: "", cover: "", avatar: "", coverHeight: 316, coverPosition: 45,
  avatarSize: 86, avatarBorder: 4, avatarBorderColor: "#ffffff", avatarOverlap: 50,
  avatarGap: 24, background: "#1c1c1c", textColor: "#ffffff", accent: "#e6ba59",
  showAddress: true, latestHeading: "Latest", pinnedHeading: "Pinned",
  showLatest: true, showPinned: true, showFeatured: true, showThumbnails: true,
  newestFirst: true, pinnedFirst: false, css: "", blocks: [],
};

export const selectors = [
  ["Page", "#link-page"], ["Cover area", "#cover"], ["Cover photo", ".link-page__cover-image"], ["Avatar frame", "#avatar"],
  ["Avatar image", ".link-page__avatar-image"], ["Display name", "#display-name"], ["Bio", "#bio"],
  ["Page address", "#page-address"], ["Featured", "#featured"], ["Song", ".link-page__song"],
  ["Latest", "#latest"], ["Pinned", "#pinned"], ["Section headings", ".link-page__heading"],
  ["All blocks", ".link-page__block"], ["Content rows", ".link-page__row"], ["Link block", ".link-page__link"],
  ["Video block", ".link-page__video"], ["Text block", ".link-page__text"],
  ["Divider", ".link-page__divider"], ["Social block", ".link-page__social"],
  ["Thumbnail", ".link-page__thumbnail"], ["Play control", ".link-page__audio"],
] as const;

export const maxBlocks = 60;
export const maxCssLength = 12_000;
export const maxContentBytes = 800_000;
export const maxImageLength = 210_000;

const imagePattern = /^data:image\/(?:webp|jpeg|png);base64,[a-zA-Z0-9+/]+={0,2}$/;
export function isLinkPageImage(value: string) {
  return value.length <= maxImageLength && imagePattern.test(value);
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");
}

export function isPageSlug(value: string) {
  return value.length >= 3 && value === slugify(value);
}

export function newBlock(id: string, type: BlockType = "link", createdAt = 0): LinkBlock {
  return { id, createdAt, type, title: "", description: "", url: "", audio: "", image: "",
    section: type === "song" ? "featured" : "latest", hidden: false };
}

export function blockDestination(block: LinkBlock) {
  if (block.type === "divider" || block.type === "text") return null;
  return parseHttpDestination(block.url.trim());
}

export function blockIsVisible(content: LinkPageContent, block: LinkBlock) {
  if (block.hidden) return false;
  if (block.section === "featured") return content.showFeatured;
  return block.section === "pinned" ? content.showPinned : content.showLatest;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid page settings.");
  return value as Record<string, unknown>;
}

function string(value: unknown, length: number) {
  if (typeof value !== "string" || value.length > length) throw new Error("A field exceeds its length limit.");
  return value;
}

function image(value: unknown) {
  const data = string(value, maxImageLength);
  if (data && !isLinkPageImage(data)) throw new Error("Choose a JPEG, PNG, or WebP image.");
  return data;
}

function number(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error("A size is outside its allowed range.");
  }
  return value;
}

function toggle(value: unknown) {
  if (typeof value !== "boolean") throw new Error("Invalid section setting.");
  return value;
}

function color(value: unknown) {
  const hex = string(value, 7);
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error("Choose a hex color.");
  return hex;
}

function rowStyle(value: unknown): RowStyle | undefined {
  if (value === undefined) return undefined;
  if (rowStyles.some((style) => style === value)) return value as RowStyle;
  throw new Error("Choose a valid row style.");
}

export function validateContent(value: unknown, publishing: boolean): LinkPageContent {
  const content = record(value);
  if (!Array.isArray(content.blocks) || content.blocks.length > maxBlocks) {
    throw new Error(`You can add up to ${maxBlocks} blocks to a page.`);
  }
  const ids = new Set<string>();
  const blocks = content.blocks.map((value): LinkBlock => {
    const block = record(value);
    const id = string(block.id, 40);
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id) || ids.has(id)) throw new Error("Invalid block ID.");
    ids.add(id);
    const type = block.type as BlockType;
    if (!blockTypes.includes(type)) throw new Error("Invalid block type.");
    const { section } = block;
    if (section !== "latest" && section !== "pinned" && section !== "featured") throw new Error("Invalid block section.");
    const url = string(block.url, 2_048);
    const audio = string(block.audio, 2_048);
    if (url && !parseHttpDestination(url.trim())) throw new Error("Use an http or https destination URL.");
    if (audio && parseHttpDestination(audio.trim())?.protocol !== "https:") throw new Error("Use an HTTPS audio file URL.");
    return { id, type, section, createdAt: number(block.createdAt ?? 0, 0, 8_640_000_000_000_000), url: url.trim(), audio: audio.trim(), title: string(block.title, 150).trim(),
      description: string(block.description, 1_000).trim(), image: image(block.image), hidden: toggle(block.hidden), rowStyle: rowStyle(block.rowStyle) };
  });
  const result: LinkPageContent = {
    name: string(content.name, 100).trim(), bio: string(content.bio, 500).trim(),
    cover: image(content.cover), avatar: image(content.avatar),
    coverHeight: number(content.coverHeight, 80, 520), coverPosition: number(content.coverPosition, 0, 100),
    avatarSize: number(content.avatarSize, 32, 140), avatarBorder: number(content.avatarBorder, 0, 16),
    avatarBorderColor: color(content.avatarBorderColor), avatarOverlap: number(content.avatarOverlap, 0, 100),
    avatarGap: number(content.avatarGap, 0, 80),
    background: color(content.background), textColor: color(content.textColor), accent: color(content.accent), rowStyle: rowStyle(content.rowStyle),
    showAddress: toggle(content.showAddress), latestHeading: string(content.latestHeading, 60).trim(),
    pinnedHeading: string(content.pinnedHeading, 60).trim(), showLatest: toggle(content.showLatest),
    showPinned: toggle(content.showPinned), showFeatured: toggle(content.showFeatured),
    showThumbnails: toggle(content.showThumbnails), newestFirst: toggle(content.newestFirst),
    pinnedFirst: toggle(content.pinnedFirst), css: string(content.css, maxCssLength), blocks,
  };
  if (new TextEncoder().encode(JSON.stringify(result)).length > maxContentBytes) {
    throw new Error("This page has too many large images. Remove an image and try again.");
  }
  if (publishing) {
    if (!result.name) throw new Error("Add a display name before publishing.");
    for (const block of blocks.filter((item) => blockIsVisible(result, item))) {
      if (block.type === "divider") continue;
      if (block.type === "text") {
        if (!block.title && !block.description) throw new Error("Add text to each visible text block.");
        continue;
      }
      if (block.type === "song" && block.audio && block.title) continue;
      if (!blockDestination(block)) throw new Error("Add a URL to every visible link, song, video, and social block.");
    }
  }
  return result;
}
