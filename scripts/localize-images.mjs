import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const DIST = "dist";
const OUTPUT = join(DIST, "images", "remote");
const TOKEN = process.env.BLOG_API_TOKEN?.trim();
const BASE = normalizeBase(process.env.BASE_PATH || "/");
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const MAX_BYTES = 30 * 1024 * 1024;
const CONCURRENCY = 6;

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

const SKIP_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".mp4",
  ".pdf",
  ".txt",
  ".ttf",
  ".otf",
  ".webm",
  ".woff",
  ".woff2",
  ".xml",
]);

const CONTENT_TYPE_EXTENSIONS = new Map([
  ["image/avif", ".avif"],
  ["image/bmp", ".bmp"],
  ["image/gif", ".gif"],
  ["image/ico", ".ico"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/svg+xml", ".svg"],
  ["image/vnd.microsoft.icon", ".ico"],
  ["image/webp", ".webp"],
  ["image/x-icon", ".ico"],
]);

function normalizeBase(value) {
  const base = value.startsWith("/") ? value : `/${value}`;
  return base.endsWith("/") ? base : `${base}/`;
}

async function collectFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (/\.(html|css)$/i.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

function addUrl(urls, value) {
  if (value && /^https?:\/\//i.test(value)) urls.add(value);
}

function extractImageUrls(text, isCss) {
  const urls = new Set();

  if (isCss) {
    for (const match of text.matchAll(
      /url\(\s*(['"]?)(https?:\/\/[^'")]+)\1\s*\)/gi,
    )) {
      addUrl(urls, match[2]);
    }
    return urls;
  }

  for (const match of text.matchAll(/<(?:img|source|video)\b[^>]*>/gi)) {
    const tag = match[0];

    for (const attribute of ["src", "poster"]) {
      const attributeMatch = tag.match(
        new RegExp(`\\b${attribute}\\s*=\\s*(["'])(https?:\\/\\/[^"']+)\\1`, "i"),
      );
      if (attributeMatch) addUrl(urls, attributeMatch[2]);
    }

    const srcset = tag.match(/\bsrcset\s*=\s*(["'])([^"']+)\1/i);
    if (srcset) {
      for (const candidate of srcset[2].split(",")) {
        addUrl(urls, candidate.trim().split(/\s+/)[0]);
      }
    }
  }

  for (const match of text.matchAll(
    /<link\b[^>]*rel\s*=\s*(["'])[^"']*(?:icon|image_src)[^"']*\1[^>]*>/gi,
  )) {
    const href = match[0].match(
      /\bhref\s*=\s*(["'])(https?:\/\/[^"']+)\1/i,
    );
    if (href) addUrl(urls, href[2]);
  }

  for (const match of text.matchAll(
    /url\(\s*(['"]?)(https?:\/\/[^'")]+)\1\s*\)/gi,
  )) {
    addUrl(urls, match[2]);
  }

  return urls;
}

function extensionFor(url, contentType) {
  const fromType = CONTENT_TYPE_EXTENSIONS.get(contentType);
  if (fromType) return fromType;

  try {
    const extension = extname(new URL(url).pathname).toLowerCase();
    if (IMAGE_EXTENSIONS.has(extension)) {
      return extension === ".jpeg" ? ".jpg" : extension;
    }
  } catch {
    // The URL was already checked, but fall through to the MIME type.
  }

  return ".img";
}

function isLikelyImage(url) {
  try {
    const extension = extname(new URL(url).pathname).toLowerCase();
    return !SKIP_EXTENSIONS.has(extension);
  } catch {
    return false;
  }
}

async function download(url) {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept:
      "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8",
  };

  if (TOKEN) headers["x-blog-mirror-token"] = TOKEN;

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.warn(`[images] ${response.status} ${url}`);
      return null;
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ??
      "";

    if (!contentType.startsWith("image/")) {
      return null;
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES) {
      console.warn(`[images] skipped large image (${contentLength} bytes): ${url}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      console.warn(`[images] skipped large image (${buffer.length} bytes): ${url}`);
      return null;
    }

    const hash = createHash("sha256").update(url).digest("hex").slice(0, 24);
    const name = `${hash}${extensionFor(url, contentType)}`;

    await writeFile(join(OUTPUT, name), buffer);
    return name;
  } catch (error) {
    console.warn(
      `[images] failed ${url}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

async function mapLimit(items, limit, callback) {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await callback(current);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const files = await collectFiles(DIST);
  const candidates = new Map();

  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const serialized of extractImageUrls(text, file.endsWith(".css"))) {
      const url = serialized.replaceAll("&amp;", "&");
      if (isLikelyImage(url)) candidates.set(serialized, url);
    }
  }

  if (candidates.size === 0) {
    console.log("[images] no remote images found");
    return;
  }

  await mkdir(OUTPUT, { recursive: true });

  const replacements = new Map();
  let downloaded = 0;
  let failed = 0;

  await mapLimit([...candidates.entries()], CONCURRENCY, async ([serialized, url]) => {
    const name = await download(url);
    if (!name) {
      failed++;
      return;
    }

    const local = `${BASE}images/remote/${name}`;
    replacements.set(serialized, local);
    replacements.set(url, local);
    downloaded++;
  });

  if (replacements.size > 0) {
    for (const file of files) {
      let text = await readFile(file, "utf8");
      let changed = false;

      for (const [from, to] of replacements) {
        if (!text.includes(from)) continue;
        text = text.split(from).join(to);
        changed = true;
      }

      if (changed) await writeFile(file, text);
    }
  }

  console.log(
    `[images] localized ${downloaded} image(s), ${failed} failed, ${candidates.size} candidate(s)`,
  );
}

main().catch((error) => {
  console.error(
    `[images] localization failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
