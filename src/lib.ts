import site from "../site.config.mjs";

/** Join a site-relative path onto the configured base path. */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const clean = path.replace(/^\//, "");
  return `${base}/${clean}`;
}

/** Absolute URL for a site-relative path, for canonical and Open Graph tags. */
export function absolute(path: string): string {
  return new URL(href(path), site.siteUrl).toString();
}

export const nav = [
  { path: "architecture-review/", label: "Architecture review" },
  { path: "platform-build/", label: "Platform build" },
  { path: "ai-code-review/", label: "AI code review" },
  { path: "pricing/", label: "Pricing" },
  { path: "demo/", label: "Demo" },
  { path: "articles/", label: "Articles" },
  { path: "about/", label: "About" },
  { path: "contact/", label: "Contact" },
];

export { site };
