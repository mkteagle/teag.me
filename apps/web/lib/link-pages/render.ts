import { blockDestination, blockIsVisible, isLinkPageImage, rabbitsSongSlug, type LinkBlock, type LinkPageContent, type RowStyle } from "./model";

import { songPlayerScript } from "./song-player";

export const pageContentPolicy = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; media-src 'self' https:; base-uri 'none'; form-action 'none'";

function escape(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function image(value: string, className: string) {
  if (isLinkPageImage(value)) return `<img class="${className}" src="${escape(value)}" alt="">`;
  return `<span class="${className} link-page__placeholder" aria-hidden="true"></span>`;
}

function isolatedCss(css: string) {
  return css.replace(/<(?=\/style\b)/gi, "\\3c ");
}

const layout = `
*,*::before,*::after { box-sizing: border-box }
html { color-scheme: dark }
body { margin: 0; background: var(--background); color: var(--ink); font: 16px/1.45 system-ui, sans-serif }
a { color: inherit }
#link-page { width: 100%; max-width: 34rem; margin-inline: auto; isolation: isolate; overflow: hidden; min-height: 100svh }
#cover { position: relative; height: var(--cover-height); background: #414141; overflow: hidden }
#cover img { width: 100%; height: 100%; object-fit: cover; object-position: center var(--cover-position); display: block }
#cover::after { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 54%, var(--background)) }
.link-page__content { margin-inline: clamp(17px, 5vw, 27px); position: relative; padding-bottom: 26px }
#avatar { position: relative; isolation: isolate; width: var(--avatar-size); height: var(--avatar-size); border-radius: 50%;
  margin-top: calc(-1 * var(--avatar-overlap)); margin-bottom: var(--avatar-gap); border: var(--avatar-border) solid var(--avatar-rim);
  background: var(--background); display: grid; place-items: center }
.link-page__avatar-image { width: 100%; height: 100%; min-width: 0; min-height: 0; object-fit: cover; border-radius: inherit; display: block }
.link-page__placeholder { background: #777 }
.link-page__cover-image.link-page__placeholder { display: block; width: 100%; height: 100%; background: #4b4b4b }
#display-name { margin: 0; font-size: clamp(1.55rem, 6vw, 2rem); line-height: 1.15; letter-spacing: -.045em; overflow-wrap: anywhere }
#page-address { margin: 3px 0 0; opacity: .71; font-size: .88rem; overflow-wrap: anywhere }
#bio { white-space: pre-wrap; margin: 9px 0 0; opacity: .85; overflow-wrap: anywhere }
.link-page__section { margin-top: 15px }
.link-page__heading { margin: 0 0 4px; font-size: 1.2rem; letter-spacing: -.025em }
.link-page__block { min-width: 0; overflow-wrap: anywhere }
.link-page__row { display: flex; align-items: center; gap: 13px; min-height: 48px; padding: 7px 1px; text-decoration: none; width: 100% }
a.link-page__row:hover, a.link-page__row:focus-visible { color: var(--accent) }
a:focus-visible, audio:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.link-page__block[data-row-style="plain"] + .link-page__block[data-row-style="plain"] { border-top: 1px solid color-mix(in srgb, var(--ink) 14%, transparent) }
.link-page__block:not([data-row-style="plain"]) + .link-page__block,
.link-page__block + .link-page__block:not([data-row-style="plain"]) { margin-top: 8px }
.link-page__block:is([data-row-style="outlined"], [data-row-style="filled"], [data-row-style="accented"]) {
  border-radius: 9px; padding-inline: 10px;
}
.link-page__block[data-row-style="outlined"] { border: 1px solid color-mix(in srgb, var(--ink) 24%, transparent) }
.link-page__block[data-row-style="filled"] { background: color-mix(in srgb, var(--ink) 10%, var(--background)) }
.link-page__block[data-row-style="accented"] {
  border-inline-start: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 13%, var(--background))
}
.link-page__thumbnail { width: 58px; height: 38px; object-fit: cover; border-radius: 6px; flex: none; display: block }
.link-page__song .link-page__thumbnail { width: 65px; height: 61px }
.link-page__title { display: block }
.link-page__song .link-page__title { font-weight: 700 }
.link-page__description { display: block; color: color-mix(in srgb, var(--ink) 72%, transparent); font-size: .86rem; white-space: pre-wrap }
.link-page__indicator { margin-left: auto; flex: none }
.link-page__purchase { font-size: .76rem; color: var(--accent); min-width: 0; text-align: end }
.link-page__play { display: grid; place-items: center; border-radius: 50%; width: 30px; height: 30px; background: var(--ink); color: var(--background); font-size: .85rem }
.link-page__audio-note { margin: 0 0 8px; font-size: .8rem; opacity: .72 }
.link-page__audio { display: block; width: 100%; max-width: 320px; height: 34px; margin: 0 0 8px }
.link-page__divider { margin: 14px 0; height: 1px; background: color-mix(in srgb, var(--ink) 20%, transparent) }
`;

function renderBlock(block: LinkBlock, basePath: string, showThumbnail: boolean, defaultRowStyle: RowStyle, grant?: string) {
  const destination = blockDestination(block);
  const className = `link-page__block link-page__${block.type}`;
  const artistTrack = block.type === "song" && rabbitsSongSlug(block.url);
  const audioSource = artistTrack ? (basePath && `${basePath}/stream/${block.id}`) : block.audio;
  const eventPath = grant && basePath ? `${basePath}/play/${block.id}?grant=${encodeURIComponent(grant)}` : "";
  const audio = block.type === "song" && audioSource
    ? `<audio aria-label="${escape(block.title || "Song preview")}" class="link-page__audio" controls controlslist="nodownload" preload="metadata" src="${escape(audioSource)}"${eventPath ? ` data-play-event="${escape(eventPath)}"` : ""}></audio>`
    : "";
  if (block.type === "divider") return `<div class="${className}" data-row-style="plain" role="separator"></div>`;
  const title = block.title || destination?.hostname || (block.description ? "" : "Untitled block");
  const indicator = destination || block.type === "song";
  const hasThumbnail = showThumbnail && (block.image || ["song", "video", "link"].includes(block.type));
  const row = `${hasThumbnail ? image(block.image, "link-page__thumbnail") : ""}
    <span>${title ? `<span class="link-page__title">${escape(title)}</span>` : ""}
    ${block.description ? `<span class="link-page__description">${escape(block.description)}</span>` : ""}</span>
    ${artistTrack ? '<span class="link-page__indicator link-page__purchase">Buy &amp; download ↗</span>' : indicator ? `<span class="link-page__indicator ${block.type === "song" && !audio ? "link-page__play" : ""}" aria-hidden="true">${block.type === "song" ? (audio ? "" : "▶") : "↗"}</span>` : ""}`;
  const entry = destination && basePath
    ? `<a class="link-page__row" href="${basePath}/go/${escape(block.id)}" target="_blank" rel="noopener noreferrer">${row}</a>`
    : `<div class="link-page__row">${row}</div>`;
  const previewNote = artistTrack && !basePath ? '<p class="link-page__audio-note">Private stream available on the published page.</p>' : "";
  return `<div id="block-${escape(block.id)}" class="${className}" data-row-style="${escape(block.rowStyle ?? defaultRowStyle)}">${entry}${audio}${previewNote}</div>`;
}

export function renderLinkPage(content: LinkPageContent, slug: string, canonical?: string, songScripts?: { policy: string; grants: ReadonlyMap<string, string> }) {
  const pagePath = `/u/${encodeURIComponent(slug)}`;
  const basePath = canonical ? pagePath : "";
  const style = [
    `--background:${content.background}`, `--ink:${content.textColor}`, `--accent:${content.accent}`,
    `--cover-height:${content.coverHeight}px`, `--cover-position:${content.coverPosition}%`,
    `--avatar-size:${content.avatarSize}px`, `--avatar-border:${content.avatarBorder}px`,
    `--avatar-rim:${content.avatarBorderColor}`, `--avatar-gap:${content.avatarGap}px`,
    `--avatar-overlap:${Math.min(content.avatarOverlap, content.avatarSize, content.coverHeight)}px`,
  ].join(";");
  const name = content.name || "Your display name";
  const visible = content.blocks.filter((block) => blockIsVisible(content, block));
  const section = (id: LinkBlock["section"], heading: string, reverse = false) => {
    const blocks = visible.filter((block) => block.section === id);
    if (!blocks.length) return "";
    if (reverse) blocks.sort((a, b) => b.createdAt - a.createdAt);
    return `<section id="${id}" class="link-page__section"${heading ? ` aria-labelledby="${id}-heading"` : ""}>
      ${heading ? `<h2 id="${id}-heading" class="link-page__heading">${escape(heading)}</h2>` : ""}
      ${blocks.map((block) => {
        const showThumbnail = id === "featured" || (content.showThumbnails && (id === "latest" || Boolean(block.image)));
        return renderBlock(block, basePath, showThumbnail, content.rowStyle ?? "plain", songScripts?.grants.get(block.id));
      }).join("")}</section>`;
  };
  const featured = section("featured", "");
  const latest = content.showLatest ? section("latest", content.latestHeading, content.newestFirst) : "";
  const pinned = content.showPinned ? section("pinned", content.pinnedHeading) : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="${songScripts ? pageContentPolicy.replace("script-src 'none'", songScripts.policy) : pageContentPolicy}">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="referrer" content="no-referrer"><title>${escape(name)}</title>
    ${canonical ? `<link rel="canonical" href="${escape(canonical)}">
    <meta property="og:type" content="website"><meta property="og:url" content="${escape(canonical)}">
    <meta property="og:title" content="${escape(name)}">
    ${content.cover || content.avatar ? `<meta property="og:image" content="${escape(canonical)}/image">` : ""}` : ""}
    <meta name="description" content="${escape(content.bio)}"><meta property="og:description" content="${escape(content.bio)}">
    <style>${layout}</style><style>${isolatedCss(content.css)}</style></head>
    <body style="${escape(style)}"><main id="link-page"><div id="cover">${image(content.cover, "link-page__cover-image")}</div>
    <div class="link-page__content"><div id="avatar">${image(content.avatar, "link-page__avatar-image")}</div>
    <h1 id="display-name">${escape(name)}</h1>
    ${content.showAddress ? `<p id="page-address">teag.me${escape(pagePath)}</p>` : ""}
    ${content.bio ? `<p id="bio">${escape(content.bio)}</p>` : ""}
    ${featured}${content.pinnedFirst ? pinned + latest : latest + pinned}</div></main>${songScripts ? `<script>${songPlayerScript}</script>` : ""}</body></html>`;
}
