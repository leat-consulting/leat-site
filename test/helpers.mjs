import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import site from "../site.config.mjs";

export const dist = new URL("../dist/", import.meta.url).pathname;
export { site };

export const pages = [
  "", "architecture-review/", "platform-build/", "ai-code-review/", "pricing/",
  "demo/", "about/", "articles/", "contact/",
];

export function htmlFiles(dir = dist) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

export function read(path) {
  return readFileSync(path, "utf8");
}

export function pageFile(route) {
  return join(dist, route, "index.html");
}

/** Resolve a site URL path (including the base path) to a file in dist, or null. */
export function resolveLocal(pathname) {
  const base = site.basePath.replace(/\/$/, "");
  if (!pathname.startsWith(`${base}/`) && pathname !== base) return null;
  const rest = decodeURIComponent(pathname.slice(base.length)).replace(/^\//, "");
  const candidates = [join(dist, rest), join(dist, rest, "index.html")];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

export function rel(path) {
  return relative(dist, path);
}

export function attrs(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map((m) => m[0]);
}

export function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"));
  return m ? m[1].replaceAll("&amp;", "&") : null;
}
