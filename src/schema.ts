// Structured data (JSON-LD) for every page, built from site.config.mjs and
// page props so it cannot drift from the visible page. Base.astro emits one
// @graph per page; entities refer to each other by @id.
import { absolute, site } from "./lib";
import type { Faq } from "./faqs";

type Node = Record<string, unknown>;

const home = absolute("");
export const ids = {
  organization: `${home}#organization`,
  website: `${home}#website`,
  founder: `${home}#founder`,
};

const country = { "@type": "Country", name: "United Kingdom" };

export function siteGraph(): Node[] {
  return [
    {
      "@type": "Organization",
      "@id": ids.organization,
      name: site.name,
      url: home,
      logo: { "@type": "ImageObject", url: absolute("logo-512.png"), width: 512, height: 512 },
      description: site.description,
      founder: { "@id": ids.founder },
      address: { "@type": "PostalAddress", addressCountry: site.country },
      areaServed: country,
      sameAs: [site.github],
    },
    {
      "@type": "Person",
      "@id": ids.founder,
      name: site.founder.name,
      jobTitle: site.founder.jobTitle,
      worksFor: { "@id": ids.organization },
      sameAs: [site.founder.linkedin],
    },
    {
      "@type": "WebSite",
      "@id": ids.website,
      name: site.name,
      url: home,
      inLanguage: "en-GB",
      publisher: { "@id": ids.organization },
    },
  ];
}

export function professionalService(): Node {
  return {
    "@type": "ProfessionalService",
    "@id": `${home}#service`,
    name: site.name,
    url: home,
    description: site.description,
    provider: { "@id": ids.organization },
    address: { "@type": "PostalAddress", addressCountry: site.country },
    areaServed: country,
    knowsAbout: ["Platform engineering", "CI/CD", "GitLab CI/CD", "GitHub Actions", "AWS", "Terraform", "OIDC", "AI code review"],
  };
}

export function service(name: string, path: string, description: string): Node {
  return {
    "@type": "Service",
    "@id": `${absolute(path)}#service`,
    name,
    url: absolute(path),
    description,
    serviceType: "Platform engineering consultancy",
    provider: { "@id": ids.organization },
    areaServed: country,
  };
}

export function faqPage(path: string, faqs: Faq[]): Node {
  return {
    "@type": "FAQPage",
    "@id": `${absolute(path)}#faq`,
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]): Node {
  const items = [{ name: "Home", path: "" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absolute(item.path) })),
  };
}

export function article(a: { title: string; description: string; path: string; date: Date; updated?: Date }): Node {
  return {
    "@type": "Article",
    "@id": `${absolute(a.path)}#article`,
    headline: a.title,
    description: a.description,
    url: absolute(a.path),
    datePublished: a.date.toISOString().slice(0, 10),
    dateModified: (a.updated ?? a.date).toISOString().slice(0, 10),
    inLanguage: "en-GB",
    author: { "@id": ids.founder },
    publisher: { "@id": ids.organization },
    image: absolute("og-default.png"),
  };
}

/** The full JSON-LD document for one page. */
export function graph(extra: Node[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [...siteGraph(), ...extra] });
}
