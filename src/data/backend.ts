export type SocialPlatform =
  | "github"
  | "twitter"
  | "discord"
  | "bilibili"
  | "email"
  | "rss"
  | "custom";

export interface BackendSocialLink {
  platform: SocialPlatform;
  url: string;
  icon?: string;
  label?: string;
}

const env = import.meta.env as Record<string, string | undefined>;

/** The Cloudflare blog the mirror reads. Set BLOG_ORIGIN to override. */
export const BLOG_ORIGIN = (
  process.env.BLOG_ORIGIN ??
  env.BLOG_ORIGIN ??
  "https://your-blog.example.com"
).replace(/\/$/, "");

/** Used when the build cannot reach the backend. */
const FALLBACK_SOCIAL: BackendSocialLink[] = [
  { platform: "github", url: "https://github.com/your-name" },
  { platform: "email", url: "mailto:you@example.com" },
  { platform: "rss", url: "/rss.xml" },
];

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  github: "GitHub",
  twitter: "Twitter / X",
  discord: "Discord",
  bilibili: "Bilibili",
  email: "Email",
  rss: "RSS",
  custom: "Link",
};

let socialPromise: Promise<BackendSocialLink[]> | undefined;

/** The Site Config's social links, fetched once per build. */
export function getBackendSocialLinks() {
  socialPromise ??= fetchSocialLinks();
  return socialPromise;
}

async function fetchSocialLinks(): Promise<BackendSocialLink[]> {
  try {
    const response = await fetch(`${BLOG_ORIGIN}/api/site/config`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const config = (await response.json()) as { social?: unknown };
    if (!Array.isArray(config.social)) return FALLBACK_SOCIAL;

    const links = config.social.filter(isSocialLink);
    return links.length > 0 ? links : FALLBACK_SOCIAL;
  } catch (error) {
    console.warn(
      `[site-config] Could not read ${BLOG_ORIGIN}/api/site/config; using fallback social links.`,
      error,
    );
    return FALLBACK_SOCIAL;
  }
}

function isSocialLink(value: unknown): value is BackendSocialLink {
  if (typeof value !== "object" || value === null) return false;
  const link = value as Record<string, unknown>;
  return typeof link.platform === "string" && typeof link.url === "string";
}

export function socialLabel(link: BackendSocialLink) {
  return SOCIAL_LABELS[link.platform] || link.label || link.platform;
}

export function resolveSocialHref(link: BackendSocialLink) {
  if (link.platform === "email") {
    return link.url.startsWith("mailto:") ? link.url : `mailto:${link.url}`;
  }

  if (
    link.url.startsWith("http://") ||
    link.url.startsWith("https://") ||
    link.url.startsWith("mailto:")
  ) {
    return link.url;
  }

  if (link.url.startsWith("/")) return `${BLOG_ORIGIN}${link.url}`;
  return `https://${link.url}`;
}

export function resolveSocialIcon(link: BackendSocialLink) {
  if (!link.icon) return undefined;
  if (
    link.icon.startsWith("http://") ||
    link.icon.startsWith("https://") ||
    link.icon.startsWith("data:")
  ) {
    return link.icon;
  }
  return link.icon.startsWith("/")
    ? `${BLOG_ORIGIN}${link.icon}`
    : `${BLOG_ORIGIN}/${link.icon}`;
}
