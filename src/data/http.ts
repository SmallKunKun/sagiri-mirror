const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

const API_TOKEN = process.env.BLOG_API_TOKEN?.trim();

/**
 * Fetch from the blog backend with browser-like headers.
 *
 * The backend is behind Cloudflare bot protection. Requests from Node or CI
 * without a browser User-Agent can be rejected with a 403 before reaching the
 * API. When the zone has a WAF skip rule for BLOG_API_TOKEN, the same value is
 * sent in the x-blog-mirror-token header.
 */
export function blogFetch(input: string | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  for (const [name, value] of Object.entries(DEFAULT_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }

  if (API_TOKEN && !headers.has("x-blog-mirror-token")) {
    headers.set("x-blog-mirror-token", API_TOKEN);
  }

  return fetch(input, { ...init, headers });
}
