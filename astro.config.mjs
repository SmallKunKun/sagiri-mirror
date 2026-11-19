import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";

const repository = process.env.GITHUB_REPOSITORY ?? "";
const [owner, repo] = repository.split("/");
const isUserSite = Boolean(
  owner && repo && repo.toLowerCase() === `${owner.toLowerCase()}.github.io`,
);

const customDomain = (process.env.CNAME || process.env.CUSTOM_DOMAIN || "")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "");

const rawBase = customDomain
  ? "/"
  : process.env.BASE_PATH || (repo && !isUserSite ? `/${repo}` : "/");
const base =
  rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}`;

const cname = {
  name: "custom-domain-cname",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      if (!customDomain) return;
      await writeFile(
        join(fileURLToPath(dir), "CNAME"),
        `${customDomain}\n`,
        "utf8",
      );
    },
  },
};

export default defineConfig({
  site: customDomain
    ? `https://${customDomain}`
    : process.env.SITE_ORIGIN || undefined,
  base,
  integrations: [vue(), cname],
});
