import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import site from "./site.config.mjs";

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
    }),
  ],
});
