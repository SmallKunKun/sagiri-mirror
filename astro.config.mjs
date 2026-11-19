import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";

const repository = process.env.GITHUB_REPOSITORY ?? "";
const [owner, repo] = repository.split("/");
const isUserSite = Boolean(
  owner && repo && repo.toLowerCase() === `${owner.toLowerCase()}.github.io`,
);

const rawBase =
  process.env.BASE_PATH || (repo && !isUserSite ? `/${repo}` : "/");
const base =
  rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}`;

export default defineConfig({
  site: process.env.SITE_ORIGIN || undefined,
  base,
  integrations: [vue()],
});
