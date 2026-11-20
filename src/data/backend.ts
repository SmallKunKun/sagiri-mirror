import { blogSource } from "../blog.config";
import { fixedNavigation, type NavItem } from "./navigation";
import { blogFetch } from "./http";

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

export interface BackendSiteIcons {
  faviconSvg?: string;
  favicon96?: string;
  appleTouchIcon?: string;
  webApp192?: string;
  webApp512?: string;
}

export interface BackendSiteConfig {
  title: string;
  author: string;
  description: string;
  tagline: string;
  avatar: string;
  bannerImage: string;
  social: BackendSocialLink[];
  navLinks: NavItem[];
  icons: BackendSiteIcons;
}

const env = import.meta.env as Record<string, string | undefined>;

/** The Cloudflare blog this mirror reads. */
const configuredOrigin = (
  process.env.BLOG_ORIGIN ??
  env.BLOG_ORIGIN ??
  blogSource.origin
).trim();

if (!configuredOrigin) {
  throw new Error(
    "[site-config] BLOG_ORIGIN is not configured. Set it in src/blog.config.ts or as a BLOG_ORIGIN environment variable.",
  );
}

export const BLOG_ORIGIN = configuredOrigin.replace(/\/$/, "");

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
    const response = await blogFetch(`${BLOG_ORIGIN}/api/site/config`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return normalizeConfig(await response.json());
  } catch (error) {
    throw new Error(
      `[site-config] Could not read ${BLOG_ORIGIN}/api/site/config: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function normalizeConfig(value: unknown): BackendSiteConfig {
  const config =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  const description = text(config.description);
  const tagline = text(config.tagline) || description;

  return {
    title: text(config.title),
    author: text(config.author),
    description,
    tagline,
    avatar: resolveAsset(config.avatar) ?? "",
    bannerImage: resolveAsset(config.bannerImage) ?? "",
    social: Array.isArray(config.social)
      ? config.social.filter(isSocialLink)
      : [],
    navLinks: normalizeNavLinks(config.navLinks),
    icons: normalizeIcons(config.icons),
  };
}

function normalizeIcons(value: unknown): BackendSiteIcons {
  const icons =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    faviconSvg: resolveAsset(icons.faviconSvg),
    favicon96: resolveAsset(icons.favicon96),
    appleTouchIcon: resolveAsset(icons.appleTouchIcon),
    webApp192: resolveAsset(icons.webApp192),
    webApp512: resolveAsset(icons.webApp512),
  };
}

function normalizeNavLinks(value: unknown): NavItem[] {
  const remote = Array.isArray(value)
    ? value.map(toNavItem).filter((link): link is NavItem => link !== null)
    : [];

  const merged = [...fixedNavigation];
  const seenHrefs = new Set(fixedNavigation.map((link) => link.href));
  const seenLabels = new Set(fixedNavigation.map((link) => link.label));

  for (const link of remote) {
    if (seenHrefs.has(link.href) || seenLabels.has(link.label)) continue;
    merged.push(link);
    seenHrefs.add(link.href);
    seenLabels.add(link.label);
  }

  return merged;
}

function toNavItem(value: unknown): NavItem | null {
  if (typeof value !== "object" || value === null) return null;
  const item = value as Record<string, unknown>;
  const label = text(item.label);
  if (!label) return null;

  if (Array.isArray(item.children)) {
    const children = item.children
      .map((child) => {
        if (typeof child !== "object" || child === null) return null;
        const link = child as Record<string, unknown>;
        const childLabel = text(link.label);
        const childHref = text(link.href);
        return childLabel && childHref
          ? { label: childLabel, href: childHref }
          : null;
      })
      .filter(
        (child): child is { label: string; href: string } => child !== null,
      );

    return children.length > 0
      ? { label, href: "#", icon: iconForLabel(label), children }
      : null;
  }

  const href = text(item.href);
  return href ? { label, href, icon: iconForLabel(label) } : null;
}

function iconForLabel(label: string) {
  const icons: Record<string, string> = {
    首页: "home",
    文章: "archive",
    归档: "archive",
    友链: "heart",
    后宫: "heart",
    关于: "user",
    关于我: "user",
    实验室: "flask",
    留言板: "message",
  };
  return icons[label];
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
