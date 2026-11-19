import { BLOG_ORIGIN } from "./backend";
import { getPosts } from "./posts";

export interface SearchEntry {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  text: string;
}

let indexPromise: Promise<SearchEntry[]> | undefined;

/** A static index of the remote posts, built once per build. */
export function getSearchIndex() {
  indexPromise ??= buildSearchIndex();
  return indexPromise;
}

async function buildSearchIndex(): Promise<SearchEntry[]> {
  const posts = await getPosts();
  const contentById = await fetchPostContent();

  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    tags: post.tags,
    category: post.category,
    text: contentById.get(post.id ?? -1) ?? post.summary,
  }));
}

async function fetchPostContent() {
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
            ? entry.summary
            : "";
      content.set(id, stripHtml(html));
    }
  } catch (error) {
    console.warn(
      `[search] Could not read ${BLOG_ORIGIN}/feed.json; indexing titles and summaries only.`,
      error,
    );
  }

  return content;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/\s+/g, " ")
    .trim();
}
