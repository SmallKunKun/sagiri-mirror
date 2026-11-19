import { BLOG_ORIGIN } from "./backend";
import { blogFetch } from "./http";

export interface PostCover {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface PostSummary {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  tags: string[];
  readingTime: number;
  cover?: PostCover | null;
}

export const POSTS_PER_PAGE = 5;

let postsPromise: Promise<PostSummary[]> | undefined;

/** Published posts from the backend, fetched once per build. */
export function getPosts() {
  postsPromise ??= fetchPosts();
  return postsPromise;
}

export function totalPagesFor(allPosts: PostSummary[]) {
  return Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
}

export function pagePosts(allPosts: PostSummary[], page: number) {
  const start = (page - 1) * POSTS_PER_PAGE;
  return allPosts.slice(start, start + POSTS_PER_PAGE);
}

async function fetchPosts(): Promise<PostSummary[]> {
  const collected: PostSummary[] = [];
  let cursor: number | null = null;

  try {
    while (true) {
      const url = new URL(`${BLOG_ORIGIN}/api/posts`);
      url.searchParams.set("limit", "50");
      if (cursor !== null) url.searchParams.set("cursor", String(cursor));

      const response = await blogFetch(url, {
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as {
        items?: unknown;
        nextCursor?: unknown;
      };
      const items = Array.isArray(data.items) ? data.items : [];

      for (const item of items) {
        const post = toPostSummary(item);
        if (post) collected.push(post);
      }

      cursor =
        typeof data.nextCursor === "number" && data.nextCursor > 0
          ? data.nextCursor
          : null;
      if (cursor === null) break;
    }

    return collected;
  } catch (error) {
    throw new Error(
      `[posts] Could not read ${BLOG_ORIGIN}/api/posts: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function toPostSummary(value: unknown): PostSummary | null {
  if (typeof value !== "object" || value === null) return null;
  const item = value as Record<string, unknown>;

  if (typeof item.slug !== "string" || typeof item.title !== "string") {
    return null;
  }

  const category =
    typeof item.category === "object" &&
    item.category !== null &&
    typeof (item.category as Record<string, unknown>).name === "string"
      ? String((item.category as Record<string, unknown>).name)
      : "未分类";

  const tags = Array.isArray(item.tags)
    ? item.tags
        .map((tag) =>
          typeof tag === "object" &&
          tag !== null &&
          typeof (tag as Record<string, unknown>).name === "string"
            ? String((tag as Record<string, unknown>).name)
            : null,
        )
        .filter((tag): tag is string => tag !== null)
    : [];

  const cover =
    typeof item.cover === "object" &&
    item.cover !== null &&
    typeof (item.cover as Record<string, unknown>).url === "string"
      ? {
          url: absoluteUrl(
            String((item.cover as Record<string, unknown>).url),
          ),
          width:
            typeof (item.cover as Record<string, unknown>).width === "number"
              ? Number((item.cover as Record<string, unknown>).width)
              : null,
          height:
            typeof (item.cover as Record<string, unknown>).height === "number"
              ? Number((item.cover as Record<string, unknown>).height)
              : null,
        }
      : null;

  const publishedAt =
    typeof item.publishedAt === "string"
      ? item.publishedAt
      : typeof item.createdAt === "string"
        ? item.createdAt
        : new Date(0).toISOString();

  return {
    id: typeof item.id === "number" ? item.id : undefined,
    slug: item.slug,
    title: item.title,
    summary: typeof item.summary === "string" ? item.summary : "",
    publishedAt,
    category,
    tags,
    readingTime:
      typeof item.readTimeInMinutes === "number"
        ? item.readTimeInMinutes
        : 1,
    cover,
  };
}

function absoluteUrl(url: string) {
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return url.startsWith("/") ? `${BLOG_ORIGIN}${url}` : `${BLOG_ORIGIN}/${url}`;
}
