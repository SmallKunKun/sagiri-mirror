const rawBase = import.meta.env.BASE_URL || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

/**
 * Prefix a root-relative path with the deployed base path.
 * External URLs, anchors and protocol links are returned unchanged.
 */
export function withBase(path: string) {
  if (!path) return base;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("data:") ||
    path.startsWith("#")
  ) {
    return path;
  }

  if (base !== "/" && path.startsWith(base)) {
    return path;
  }

  const relative = path.startsWith("/") ? path.slice(1) : path;
  return relative ? `${base}${relative}` : base;
}
