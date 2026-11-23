"use client";

import Link from "next/link";
import {
  ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Link2, Minus, Music2, Play, ScanLine, Share2, Type,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { deletePage, getLinkPreview, savePage } from "@/app/(protected)/link-pages/actions";
import { Button } from "@/components/ui/button";
import { parseHttpDestination } from "@/lib/http-destination";
import {
  blockTypes, maxBlocks, maxImageLength, newBlock, rowStyles,
  type BlockType, type LinkBlock, type LinkPageContent, type RowStyle,
} from "@/lib/link-pages/model";
import { capture } from "@/lib/posthog";
import { CssEditor } from "./css-editor";
import { EditorPanel, EditorSelect, inputClass } from "./editor-controls";
import { LinkPagePreview } from "./preview";

const typeNames: Record<BlockType, string> = {
  link: "Link", video: "Video", song: "Song", text: "Text", divider: "Divider", social: "Social",
};

const blockIcons = { link: Link2, video: Play, song: Music2, text: Type, divider: Minus, social: Share2 };
const blockOptions = blockTypes.map((value) => ({ value, label: typeNames[value] }));
const sectionOptions = [
  { value: "featured", label: "Featured" },
  { value: "latest", label: "Latest" },
  { value: "pinned", label: "Pinned" },
] as const;
const orderOptions = [
  { value: "newest", label: "Newest first" },
  { value: "manual", label: "Manual order" },
] as const;
const rowStyleNames: Record<RowStyle, string> = {
  plain: "Plain", outlined: "Outlined", filled: "Filled", accented: "Accent edge",
};
const rowStyleOptions = rowStyles.map((value) => ({ value, label: rowStyleNames[value] }));
const blockRowStyleOptions = [{ value: "inherit", label: "Use page style" } as const, ...rowStyleOptions];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block min-w-0 space-y-2 text-sm font-semibold"><span>{label}</span>{children}</label>;
}

function Size({ label, value, min, max, onChange, unit = "px" }: {
  label: string; value: number; min: number; max: number; onChange: (value: number) => void; unit?: string;
}) {
  return <Field label={label}><div className="flex items-center gap-2">
    <input className={inputClass} type="number" min={min} max={max} value={value} onChange={(event) => {
      const next = event.target.valueAsNumber;
      if (Number.isInteger(next)) onChange(next);
    }} onBlur={() => onChange(Math.min(max, Math.max(min, value)))} />
    <span className="text-xs text-muted-foreground">{unit}</span>
  </div></Field>;
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label}><div className="flex min-h-10 items-center gap-2">
    <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="size-9 cursor-pointer rounded-md border bg-background p-1" />
    <code className="text-xs font-normal text-muted-foreground">{value}</code>
  </div></Field>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-8 items-center gap-2 text-sm">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-accent" />{label}
  </label>;
}

async function imageData(file: File, size: number) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 15_000_000) {
    throw new Error("Choose a JPEG, PNG, or WebP image under 15 MB.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Couldn't read this image.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.65, 0.48, 0.32]) {
      const data = canvas.toDataURL("image/webp", quality);
      if (data.length <= maxImageLength) return data;
    }
    throw new Error("This image is too large. Choose a smaller one.");
  } finally {
    bitmap.close();
  }
}

function ImageField({ label, value, onChange, size }: { label: string; value: string; onChange: (data: string) => void; size: number }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return <div className="min-w-0 space-y-1">
    <Field label={label}>
      <input type="file" accept="image/webp,image/jpeg,image/png" disabled={loading} className={`${inputClass} font-normal`}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setLoading(true);
          setError("");
          try { onChange(await imageData(file, size)); }
          catch (error) { setError(error instanceof Error ? error.message : "Couldn't read this image."); }
          finally { setLoading(false); }
        }} />
    </Field>
    {value && <Button variant="ghost" size="sm" type="button" disabled={loading} onClick={() => onChange("")}>Remove {label.toLowerCase()}</Button>}
    {loading && <p className="text-xs text-muted-foreground" role="status">Preparing image…</p>}
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
  </div>;
}

function PageQr({ id, slug }: { id: string; slug: string }) {
  const [qr, setQr] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const path = `/u/${slug}/qr/${id}`;
  async function show() {
    setLoading(true);
    setNote("");
    try {
      const { toDataURL } = await import("qrcode");
      setQr(await toDataURL(new URL(path, window.location.origin).href, { width: 640, margin: 4 }));
      capture("link_page_qr_viewed");
    } catch {
      setNote("Couldn't draw the QR code. Try again.");
    } finally {
      setLoading(false);
    }
  }
  return <div className="space-y-3">
    {!qr && <Button size="sm" type="button" variant="outline" disabled={loading} onClick={show}><ScanLine className="size-4" />{loading ? "Loading…" : "View QR code"}</Button>}
    {qr && <>
      <img src={qr} alt="QR code for this link page" width={160} height={160} className="rounded-xl border" />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild><a download={`${slug}-qr.png`} href={qr} onClick={() => capture("link_page_qr_downloaded")}>Download PNG</a></Button>
        <Button size="sm" variant="outline" type="button" onClick={async () => {
          const url = new URL(path, window.location.origin).href;
          try {
            if (navigator.share) {
              const file = new File([await (await fetch(qr)).blob()], `${slug}-qr.png`, { type: "image/png" });
              if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "Link page QR code" });
              else await navigator.share({ url, title: "Link page QR code" });
            } else {
              await navigator.clipboard.writeText(url);
              setNote("QR link copied.");
            }
            capture("link_page_qr_shared");
          } catch (error) {
            if (!(error instanceof DOMException && error.name === "AbortError")) setNote("Couldn't share this code. Download the PNG to share it.");
          }
        }}>Share QR</Button>
      </div>
    </>}
    {note && <p className="text-sm text-muted-foreground" role="status">{note}</p>}
  </div>;
}

function BlockEditor({ block, index, count, onChange, onMove, onDelete }: {
  block: LinkBlock; index: number; count: number; onChange: (update: Partial<LinkBlock>) => void;
  onMove: (offset: -1 | 1) => void; onDelete: () => void;
}) {
  const acceptsLink = block.type !== "text" && block.type !== "divider";
  const BlockIcon = blockIcons[block.type];
  return <EditorPanel label={block.title || typeNames[block.type]} icon={<BlockIcon className="size-4" />}>
    <div className="grid gap-3 sm:grid-cols-2">
      <EditorSelect label="Type" value={block.type} options={blockOptions} onChange={(type) => onChange({ type })} />
      <EditorSelect label="Section" value={block.section} options={sectionOptions} onChange={(section) => onChange({ section })} />
      {block.type !== "divider" && <EditorSelect label="Row style" value={block.rowStyle ?? "inherit"} options={blockRowStyleOptions}
        onChange={(style) => onChange({ rowStyle: style === "inherit" ? undefined : style })} />}
    </div>
    {block.type !== "divider" && <>
      <Field label="Title"><input className={inputClass} value={block.title} maxLength={150} onChange={(event) => onChange({ title: event.target.value })} /></Field>
      <Field label={block.type === "song" ? "Artist" : "Description"}><textarea className={inputClass} value={block.description}
        rows={2} maxLength={1_000} onChange={(event) => onChange({ description: event.target.value })} /></Field>
    </>}
    {acceptsLink && <>
      <Field label="Destination URL"><input className={inputClass} type="url" value={block.url} maxLength={2_048} onChange={(event) => onChange({ url: event.target.value })} /></Field>
      <ImageField label={block.type === "song" ? "Song artwork" : "Thumbnail"} value={block.image} size={420} onChange={(image) => onChange({ image })} />
    </>}
    {block.type === "song" && <Field label="Audio preview URL"><input className={inputClass} type="url"
      placeholder="https://…/preview.mp3" value={block.audio} maxLength={2_048} onChange={(event) => onChange({ audio: event.target.value })} /></Field>}
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Toggle label="Show on page" checked={!block.hidden} onChange={(shown) => onChange({ hidden: !shown })} />
      <div className="flex flex-wrap gap-1">
        <Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label="Move block up" onClick={() => onMove(-1)}><ArrowUp className="size-4" /></Button>
        <Button type="button" variant="ghost" size="icon" disabled={index === count - 1} aria-label="Move block down" onClick={() => onMove(1)}><ArrowDown className="size-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete}>Remove block</Button>
      </div>
    </div>
    <code className="block break-all text-xs text-muted-foreground">#block-{block.id}</code>
  </EditorPanel>;
}

export function LinkPageEditor({ id, slug, initial, initialVersion, isPublished }: {
  id: string; slug: string; initial: LinkPageContent; initialVersion: number; isPublished: boolean;
}) {
  const [content, setContent] = useState(initial);
  const [version, setVersion] = useState(initialVersion);
  const [published, setPublished] = useState(isPublished);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [quick, setQuick] = useState("");
  const [quickBusy, setQuickBusy] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [lastShared, setLastShared] = useState("");
  const [type, setType] = useState<BlockType>("song");
  const full = content.blocks.length >= maxBlocks;

  const change = <K extends keyof LinkPageContent>(field: K, value: LinkPageContent[K]) => {
    setContent((current) => ({ ...current, [field]: value }));
    setNote("");
  };
  const changeBlock = (id: string, update: Partial<LinkBlock>) => {
    setContent((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === id ? { ...block, ...update } : block) }));
    setNote("");
  };
  const moveBlock = (id: string, offset: number) => {
    setContent((current) => {
      const blocks = [...current.blocks];
      const from = blocks.findIndex((block) => block.id === id);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= blocks.length) return current;
      [blocks[from], blocks[to]] = [blocks[to], blocks[from]];
      return { ...current, blocks };
    });
    setNote("");
  };

  async function save(publish: boolean, next = content) {
    setPending(true);
    setError("");
    setNote("");
    try {
      const result = await savePage(id, version, next, publish);
      if ("error" in result) {
        setError(result.error ?? "Could not save this page.");
        return false;
      }
      setVersion(result.version);
      setPublished(result.published);
      setNote(publish ? "Page published." : "Draft saved.");
      capture(publish ? "link_page_published" : "link_page_draft_saved", { block_count: next.blocks.length, has_custom_css: Boolean(next.css.trim()) });
      return true;
    } catch {
      setError("Could not save the page. Try again.");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function addQuick(publish: boolean) {
    setQuickError("");
    setLastShared("");
    const url = parseHttpDestination(quick.trim());
    if (!url) {
      setQuickError("Paste a valid http or https link.");
      return;
    }
    setQuickBusy(true);
    try {
      const meta = await getLinkPreview(url.href).catch(() => null);
      const video = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname);
      const block = { ...newBlock(crypto.randomUUID(), video ? "video" : "link", Date.now()), url: url.href,
        title: meta?.title || url.hostname, image: meta?.image ?? "" };
      const next = { ...content, showLatest: true, blocks: [...content.blocks, block] };
      setContent(next);
      setQuick("");
      setNote("");
      capture("link_page_quick_link_added", { block_type: block.type });
      if (publish && await save(true, next)) setLastShared(`/u/${slug}/go/${block.id}`);
    } finally {
      setQuickBusy(false);
    }
  }

  return (
    <div className="full-bleed py-7 sm:py-10">
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:gap-12">
        <div className="min-w-0 space-y-7">
          <div>
            <Link href="/link-pages" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Your link pages</Link>
            <h1 className="text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">Edit link page</h1>
            <p className="mt-2 text-muted-foreground">Set up your profile and choose what to share.</p>
            <a href="#live-preview" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 lg:hidden">Jump to live preview</a>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[14rem] flex-1"><Field label="Page URL"><input className={inputClass} readOnly value={`teag.me/u/${slug}`} /></Field></div>
            {published && <Button variant="outline" asChild><a href={`/u/${slug}`} target="_blank" rel="noopener">View page <ArrowUpRight className="size-4" /></a></Button>}
          </div>

          <fieldset disabled={pending || quickBusy} className="min-w-0 space-y-7">
            <section className="rounded-2xl border border-accent/40 bg-accent/5 p-4 sm:p-5">
              <h2 className="mb-3 text-xl font-bold tracking-tight">Quick add</h2>
              <Field label="Paste a link"><input className={inputClass} type="url" placeholder="https://…" value={quick}
                maxLength={2_048} onChange={(event) => setQuick(event.target.value)} /></Field>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="outline" type="button" size="sm" disabled={full || !quick.trim()} onClick={() => addQuick(false)}>{quickBusy ? "Fetching preview…" : "Add to draft"}</Button>
                <Button type="button" size="sm" disabled={full || !quick.trim()} onClick={() => addQuick(true)}>Add and publish page</Button>
              </div>
              {lastShared && <Button variant="ghost" type="button" size="sm" className="mt-2" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(new URL(lastShared, window.location.origin).href);
                  setNote("Direct link copied.");
                  capture("link_page_direct_link_copied");
                } catch {
                  setQuickError("Couldn't copy the link. Open it from your published page.");
                }
              }}>Copy direct link</Button>}
              {quickError && <p role="alert" className="mt-2 text-sm text-destructive">{quickError}</p>}
            </section>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight">Profile and appearance</h2>
              <EditorPanel label="Profile">
                <Field label="Display name"><input className={inputClass} value={content.name} maxLength={100} onChange={(event) => change("name", event.target.value)} /></Field>
                <Field label="Bio"><textarea className={inputClass} value={content.bio} maxLength={500} rows={3} onChange={(event) => change("bio", event.target.value)} /></Field>
                <Toggle label="Show page address below the name" checked={content.showAddress} onChange={(value) => change("showAddress", value)} />
              </EditorPanel>
              <EditorPanel label="Cover and avatar">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ImageField label="Cover photo" value={content.cover} size={1_100} onChange={(value) => change("cover", value)} />
                  <ImageField label="Avatar" value={content.avatar} size={384} onChange={(value) => change("avatar", value)} />
                  <Size label="Cover height" value={content.coverHeight} min={80} max={520} onChange={(value) => change("coverHeight", value)} />
                  <Size label="Cover position" value={content.coverPosition} min={0} max={100} unit="%" onChange={(value) => change("coverPosition", value)} />
                  <Size label="Avatar size" value={content.avatarSize} min={32} max={140} onChange={(value) => change("avatarSize", value)} />
                  <Size label="Avatar overlap" value={content.avatarOverlap} min={0} max={100} onChange={(value) => change("avatarOverlap", value)} />
                  <Size label="Avatar border width" value={content.avatarBorder} min={0} max={16} onChange={(value) => change("avatarBorder", value)} />
                  <Color label="Avatar border color" value={content.avatarBorderColor} onChange={(value) => change("avatarBorderColor", value)} />
                  <Size label="Space between avatar and name" value={content.avatarGap} min={0} max={80} onChange={(value) => change("avatarGap", value)} />
                </div>
              </EditorPanel>
              <EditorPanel label="Page colors and rows">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Color label="Background" value={content.background} onChange={(value) => change("background", value)} />
                  <Color label="Text" value={content.textColor} onChange={(value) => change("textColor", value)} />
                  <Color label="Accent" value={content.accent} onChange={(value) => change("accent", value)} />
                </div>
                <EditorSelect label="Default row style" value={content.rowStyle ?? "plain"} options={rowStyleOptions}
                  onChange={(value) => change("rowStyle", value)} />
              </EditorPanel>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight">Sections</h2>
              <EditorPanel label="Featured"><Toggle label="Show featured blocks" checked={content.showFeatured} onChange={(value) => change("showFeatured", value)} /></EditorPanel>
              <EditorPanel label="Latest">
                <Field label="Heading"><input className={inputClass} value={content.latestHeading} maxLength={60} onChange={(event) => change("latestHeading", event.target.value)} /></Field>
                <EditorSelect label="Order" value={content.newestFirst ? "newest" : "manual"} options={orderOptions}
                  onChange={(value) => change("newestFirst", value === "newest")} />
                <Toggle label="Show latest links" checked={content.showLatest} onChange={(value) => change("showLatest", value)} />
                <Toggle label="Show link thumbnails" checked={content.showThumbnails} onChange={(value) => change("showThumbnails", value)} />
              </EditorPanel>
              <EditorPanel label="Pinned">
                <Field label="Heading"><input className={inputClass} value={content.pinnedHeading} maxLength={60} onChange={(event) => change("pinnedHeading", event.target.value)} /></Field>
                <Toggle label="Show pinned links" checked={content.showPinned} onChange={(value) => change("showPinned", value)} />
                <Toggle label="Show pinned above latest" checked={content.pinnedFirst} onChange={(value) => change("pinnedFirst", value)} />
              </EditorPanel>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight">Blocks</h2>
              {content.blocks.map((block, index) => <BlockEditor key={block.id} block={block} index={index} count={content.blocks.length}
                onChange={(update) => changeBlock(block.id, update)} onMove={(offset) => moveBlock(block.id, offset)}
                onDelete={() => change("blocks", content.blocks.filter((item) => item.id !== block.id))} />)}
              <div className="flex flex-wrap items-end gap-2">
                <EditorSelect label="Block type" value={type} options={blockOptions} onChange={setType} />
                <Button type="button" variant="outline" disabled={full} onClick={() => {
                  change("blocks", [...content.blocks, newBlock(crypto.randomUUID(), type, Date.now())]);
                  capture("link_page_block_added", { block_type: type });
                }}>Add block</Button>
              </div>
            </div>
            <EditorPanel label="Custom CSS and selectors"><CssEditor value={content.css} onChange={(value) => change("css", value)} /></EditorPanel>
          </fieldset>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p role="status" className="text-sm text-muted-foreground">{note || (published ? "Published" : "Draft")}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" type="button" disabled={pending || quickBusy} onClick={() => save(false)}>Save draft</Button>
              <Button type="button" disabled={pending || quickBusy} onClick={() => save(true)}>{pending ? "Saving…" : "Publish page"}</Button>
            </div>
            {error && <p role="alert" className="w-full text-sm text-destructive">{error}</p>}
          </div>
          {published && <PageQr id={id} slug={slug} />}
          <EditorPanel label="Delete page" compact>
            <p className="my-2 text-muted-foreground">Deleting this page removes its public link and QR destination.</p>
            <Button type="button" size="sm" variant="destructive" disabled={pending || quickBusy} onClick={async () => {
              if (!window.confirm("Permanently delete this link page?")) return;
              const result = await deletePage(id);
              if (result?.error) setError(result.error);
              else capture("link_page_deleted");
            }}>Permanently delete</Button>
          </EditorPanel>
        </div>

        <aside id="live-preview" className="min-w-0 scroll-mt-4 lg:border-l lg:pl-7 xl:pl-9">
          <div className="space-y-4 lg:sticky lg:top-5">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Live preview</h2>
              <p className="break-all text-sm text-muted-foreground">teag.me/u/{slug}</p>
            </div>
            <LinkPagePreview content={content} slug={slug} />
          </div>
        </aside>
      </div>
    </div>
  );
}
