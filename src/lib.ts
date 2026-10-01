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

/** The three packages, in the order they are presented everywhere. */
export const packages = [
  {
    path: "delivery-review/",
    name: "Delivery review",
    summary: "A fixed-scope review of how code reaches production, from source control and CI/CD to cloud access, with findings ranked and a plan to fix them.",
    receive: "A ranked report, a prioritised plan and a walkthrough",
  },
  {
    path: "secure-delivery/",
    name: "Secure delivery setup",
    summary: "Hardened, reusable pipelines and protection rules installed in your own GitHub organisation, then handed over for your team to own.",
    receive: "Working pipelines, documentation and a handover session",
  },
  {
    path: "ai-code-review/",
    name: "AI code review setup",
    summary: "AI review on every pull request, with tight permissions and spend limits, tuned to your codebase and handed over.",
    receive: "Configured review, documented rules and a handover session",
  },
];

/** Header navigation. Services points at the package list on the home page. */
export const nav = [
  { path: "#packages", label: "Services" },
  { path: "how-we-build/", label: "How we build" },
  { path: "pricing/", label: "Pricing" },
  { path: "demo/", label: "Demo" },
  { path: "articles/", label: "Articles" },
  { path: "about/", label: "About" },
  { path: "contact/", label: "Contact" },
];

export { site };
