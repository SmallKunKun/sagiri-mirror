import { BLOG_ORIGIN } from "./backend";
import type { PostSummary } from "./posts";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface ArticleContent {
  html: string;
  toc: TocItem[];
}

let feedPromise: Promise<Map<number, string>> | undefined;

/** The article body and its headings, from the remote feed. */
export async function getArticleContent(
  post: PostSummary,
): Promise<ArticleContent> {
  const content = await getFeedContent();
  const body = content.get(post.id ?? -1);
  const html = absolutizeImages(
    body || `<p>${escapeHtml(post.summary || post.title)}</p>`,
  );

  return { html, toc: extractToc(html) };
}

function getFeedContent() {
  feedPromise ??= fetchFeedContent();
  return feedPromise;
}

async function fetchFeedContent() {
  const content = new Map<number, string>();

  try {
    const response = await fetch(`${BLOG_ORIGIN}/feed.json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`${response.status}`);

    const feed = (await response.json()) as { items?: unknown };
    if (!Array.isArray(feed.items)) return content;

    for (const item of feed.items) {
      if (typeof item !== "object" || item === null) continue;
      const entry = item as Record<string, unknown>;
      const id = Number(entry.id);
      if (!Number.isFinite(id)) continue;

      const html =
        typeof entry.content_html === "string"
          ? entry.content_html
          : typeof entry.summary === "string"
            ? `<p>${escapeHtml(entry.summary)}</p>`
            : "";
      content.set(id, html);
    }
  } catch (error) {
    console.warn(
      `[article] Could not read ${BLOG_ORIGIN}/feed.json; articles show summaries only.`,
      error,
    );
  }

  return content;
}

function extractToc(html: string) {
  const items: TocItem[] = [];
  const heading = /<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi;

  for (const match of html.matchAll(heading)) {
    const id = match[2]?.match(/\bid=["']([^"']+)["']/i)?.[1];
    const text = stripTags(match[3] ?? "");
    if (id && text) {
      items.push({ id, text, level: Number(match[1]) });
    }
  }

  return items;
}

function absolutizeImages(html: string) {
  return html.replace(
    /src=(["'])(\/[^"']+)\1/gi,
    (_match, quote: string, path: string) => `src=${quote}${BLOG_ORIGIN}${path}${quote}`,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripTags(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
