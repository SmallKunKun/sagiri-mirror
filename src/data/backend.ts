import { blogSource } from "../blog.config";
import { site } from "./site";

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

export interface BackendSiteConfig {
  title: string;
  author: string;
  description: string;
  tagline: string;
  avatar: string;
  bannerImage: string;
  social: BackendSocialLink[];
}

const env = import.meta.env as Record<string, string | undefined>;

/** The Cloudflare blog this mirror reads. */
export const BLOG_ORIGIN = (
  process.env.BLOG_ORIGIN ??
  env.BLOG_ORIGIN ??
  blogSource.origin
).replace(/\/$/, "");

const FALLBACK_SOCIAL: BackendSocialLink[] = [
  { platform: "github", url: "https://github.com/your-name" },
  { platform: "email", url: "mailto:you@example.com" },
  { platform: "rss", url: "/rss.xml" },
];

const FALLBACK_CONFIG: BackendSiteConfig = {
  title: site.title,
  author: site.author,
  description: site.description,
  tagline: site.tagline,
  avatar: site.avatar,
  bannerImage: site.card,
  social: FALLBACK_SOCIAL,
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  github: "GitHub",
  twitter: "Twitter / X",
  discord: "Discord",
  bilibili: "Bilibili",
  email: "Email",
  rss: "RSS",
  custom: "Link",
};

let configPromise: Promise<BackendSiteConfig> | undefined;

/** The remote Site Config, fetched once per build. */
export function getSiteConfig() {
  configPromise ??= fetchSiteConfig();
  return configPromise;
}

async function fetchSiteConfig(): Promise<BackendSiteConfig> {
  try {
    const response = await fetch(`${BLOG_ORIGIN}/api/site/config`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return normalizeConfig(await response.json());
  } catch (error) {
    console.warn(
      `[site-config] Could not read ${BLOG_ORIGIN}/api/site/config; using fallback config.`,
      error,
    );
    return FALLBACK_CONFIG;
  }
}

function normalizeConfig(value: unknown): BackendSiteConfig {
  const config =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  const description = text(config.description) || site.description;
  const tagline = text(config.tagline) || text(config.description) || site.tagline;

  return {
    title: text(config.title) || site.title,
    author: text(config.author) || site.author,
    description,
    tagline,
    avatar: resolveAsset(config.avatar) || site.avatar,
    bannerImage: resolveAsset(config.bannerImage) || site.card,
    social: Array.isArray(config.social)
      ? config.social.filter(isSocialLink)
      : FALLBACK_SOCIAL,
  };
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
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
  return resolveAsset(link.icon);
}

function resolveAsset(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }
  return value.startsWith("/")
    ? `${BLOG_ORIGIN}${value}`
    : `${BLOG_ORIGIN}/${value}`;
}
