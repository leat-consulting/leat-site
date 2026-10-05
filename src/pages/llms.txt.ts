// /llms.txt: a plain Markdown summary of the site for AI tools, following the
// llms.txt proposal (https://llmstxt.org). Generated, so it stays current.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { absolute, packages, site } from "../lib";

export const GET: APIRoute = async () => {
  const articles = (await getCollection("articles", ({ data }) => !data.draft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const link = (name: string, path: string, note: string) => `- [${name}](${absolute(path)}): ${note}`;
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.name} is a UK-based platform engineering consultancy founded by ${site.founder.name}. It sets up the path from laptop to production for engineering teams: source control, CI/CD on GitHub or GitLab, AWS infrastructure as code and short-lived OIDC access, in fixed-scope packages that end with a handover.`,
    "",
    "Every package has a fixed scope and price agreed in writing before work starts. There are no retainers or ongoing support contracts: the client owns everything delivered.",
    "",
    "## Services",
    "",
    ...packages.map((p) => link(p.name, p.path, p.summary)),
    "",
    "## About the work",
    "",
    link("How we build", "how-we-build/", "the architecture and principles behind Leat's own delivery platform, with diagrams"),
    link("Demo", "demo/", "the public repositories that build and protect this site"),
    link("About", "about/", "who founded Leat and the experience behind it"),
    link("Pricing", "pricing/", "how fixed prices are set"),
    link("Contact", "contact/", "how to get in touch"),
    "",
    "## Articles",
    "",
    ...articles.map((a) => link(a.data.title, `articles/${a.id}/`, a.data.description)),
    "",
    "## Optional",
    "",
    `- [Source code](${site.github}): the public repositories behind this site`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
