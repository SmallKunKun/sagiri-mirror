const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

/**
 * Fetch from the blog backend with browser-like headers.
 *
 * The backend is behind Cloudflare bot protection. Requests from Node or CI
 * without a browser User-Agent can be rejected with a 403 before reaching the
 * API, so every build-time request goes through this helper.
 */
export function blogFetch(input: string | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  for (const [name, value] of Object.entries(DEFAULT_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }

  return fetch(input, { ...init, headers });
}
