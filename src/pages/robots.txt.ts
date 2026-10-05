import type { APIRoute } from "astro";
import { absolute, site } from "../lib";
import { robotsTxt } from "../robots.mjs";

export const GET: APIRoute = () =>
  new Response(robotsTxt({ indexable: site.indexable, crawlers: site.crawlers, sitemapUrl: absolute("sitemap-index.xml") }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
