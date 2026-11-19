#!/usr/bin/env node

const API = "https://api.cloudflare.com/client/v4";
const PHASE = "http_request_firewall_custom";
const HEADER = "x-blog-mirror-token";
const DESCRIPTION = "sagiri-mirror build (auto)";

const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
const headerToken = process.env.BLOG_API_TOKEN?.trim();

if (!apiToken || !zoneId || !headerToken) {
  console.log(
    "Cloudflare WAF automation skipped: set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID and BLOG_API_TOKEN to enable it.",
  );
  process.exit(0);
}

function redact(value) {
  return String(value)
    .split(headerToken)
    .join("[redacted]")
    .split(apiToken)
    .join("[redacted]");
}

async function cloudflare(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  return { response, data };
}

function ruleBody() {
  return {
    action: "skip",
    action_parameters: {
      ruleset: "current",
      phases: ["http_request_firewall_managed"],
      products: ["securityLevel", "bic"],
    },
    expression: `http.request.headers["${HEADER}"] eq ${JSON.stringify(headerToken)}`,
    description: DESCRIPTION,
    enabled: true,
  };
}

function apiError(label, { response, data }) {
  const details = data?.errors ? JSON.stringify(data.errors) : JSON.stringify(data);
  return new Error(`${label} failed with HTTP ${response.status}: ${details}`);
}

async function main() {
  const entry = await cloudflare(
    `/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`,
  );

  if (entry.response.status === 404) {
    const created = await cloudflare(`/zones/${zoneId}/rulesets`, {
      method: "POST",
      body: JSON.stringify({
        name: "default",
        kind: "zone",
        phase: PHASE,
        rules: [ruleBody()],
      }),
    });

    if (!created.response.ok) {
      throw apiError("Create Cloudflare WAF ruleset", created);
    }

    console.log("Created Cloudflare WAF skip rule.");
    return;
  }

  if (!entry.response.ok) {
    throw apiError("Read Cloudflare WAF ruleset", entry);
  }

  const ruleset = entry.data.result;
  const rules = Array.isArray(ruleset?.rules) ? ruleset.rules : [];
  const existing = rules.find((rule) => rule.description === DESCRIPTION);
  const body = ruleBody();

  if (existing) {
    const updated = await cloudflare(
      `/zones/${zoneId}/rulesets/${ruleset.id}/rules/${existing.id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    );

    if (!updated.response.ok) {
      throw apiError("Update Cloudflare WAF skip rule", updated);
    }

    console.log("Updated Cloudflare WAF skip rule.");
    return;
  }

  const created = await cloudflare(
    `/zones/${zoneId}/rulesets/${ruleset.id}/rules`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  if (!created.response.ok) {
    throw apiError("Create Cloudflare WAF skip rule", created);
  }

  console.log("Created Cloudflare WAF skip rule.");
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
