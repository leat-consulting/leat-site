import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readFileSync, readdirSync } from "node:fs";
import site from "./site.config.mjs";

// lastmod for the sitemap: an article's updated (or publication) date from its
// frontmatter, and the build date for every other page.
const buildDate = new Date().toISOString().slice(0, 10);
const articleDates = Object.fromEntries(
  readdirSync("./src/content/articles").filter((f) => f.endsWith(".md")).map((f) => {
    const front = readFileSync(`./src/content/articles/${f}`, "utf8").split("---")[1] ?? "";
    const field = (name) => front.match(new RegExp(`^${name}:\\s*(\\S+)`, "m"))?.[1];
    return [f.replace(/\.md$/, ""), field("updated") ?? field("date")];
  }),
);

if (site.indexable && (!site.bookingUrl || !site.email)) {
  throw new Error("site.config.mjs: set bookingUrl and email before making the site indexable");
}

export default defineConfig({
  site: site.siteUrl,
  base: site.basePath,
  output: "static",
  trailingSlash: "always",
  build: {
    // No inline <style> or <script>, so the CSP can forbid them.
    inlineStylesheets: "never",
    format: "directory",
  },
  devToolbar: { enabled: false },
  markdown: {
    // Syntax highlighting writes inline style attributes, which the CSP forbids.
    syntaxHighlight: false,
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
      serialize(item) {
        const slug = item.url.match(/\/articles\/([^/]+)\/$/)?.[1];
        item.lastmod = new Date(articleDates[slug] ?? buildDate).toISOString();
        return item;
      },
    }),
  ],
});
