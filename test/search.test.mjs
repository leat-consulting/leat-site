import { test } from "node:test";
import assert from "node:assert/strict";
import { dist, htmlFiles, packagePages, pageFile, read, rel, resolveLocal, site, visibleText } from "./helpers.mjs";
import { robotsTxt, SEARCH_CRAWLERS, TRAINING_CRAWLERS } from "../src/robots.mjs";

const files = htmlFiles().filter((f) => !f.endsWith("404.html"));
const graphOf = (file) => {
  const blocks = [...read(file).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1, `${rel(file)}: expected exactly one JSON-LD block`);
  return JSON.parse(blocks[0][1])["@graph"];
};
const types = (g) => g.map((n) => n["@type"]);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

test("every page has valid structured data with the site-wide entities", () => {
  for (const file of files) {
    const g = graphOf(file);
    for (const type of ["Organization", "Person", "WebSite"]) {
      assert.ok(types(g).includes(type), `${rel(file)}: no ${type}`);
    }
    const org = g.find((n) => n["@type"] === "Organization");
    assert.equal(org.address.addressCountry, "GB", `${rel(file)}: organisation not in GB`);
    const person = g.find((n) => n["@type"] === "Person");
    assert.ok(person.sameAs.includes(site.founder.linkedin), `${rel(file)}: founder has no LinkedIn link`);
  }
});

test("structured data makes no claims it cannot back", () => {
  for (const file of files) {
    const json = JSON.stringify(graphOf(file));
    for (const key of ["aggregateRating", "review", "offers", "price", "streetAddress", "postalCode"]) {
      assert.ok(!json.includes(`"${key}"`), `${rel(file)}: structured data contains ${key}`);
    }
  }
});

test("inner pages carry breadcrumbs, package pages a Service and FAQ", () => {
  for (const file of files.filter((f) => rel(f) !== "index.html")) {
    assert.ok(types(graphOf(file)).includes("BreadcrumbList"), `${rel(file)}: no BreadcrumbList`);
  }
  for (const route of packagePages) {
    const g = graphOf(pageFile(route));
    const service = g.find((n) => n["@type"] === "Service");
    assert.ok(service, `/${route}: no Service`);
    assert.equal(service.areaServed.name, "United Kingdom");
    assert.ok(types(g).includes("FAQPage"), `/${route}: no FAQPage`);
  }
});

test("visible FAQ and FAQPage data match word for word", () => {
  for (const route of packagePages) {
    const html = read(pageFile(route));
    const faq = html.match(/<dl class="faq">([\s\S]*?)<\/dl>/)?.[1] ?? "";
    const visible = [...faq.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)].map((m) => [decode(m[1]), decode(m[2])]);
    const data = graphOf(pageFile(route)).find((n) => n["@type"] === "FAQPage").mainEntity.map((q) => [q.name, q.acceptedAnswer.text]);
    assert.ok(visible.length >= 3, `/${route}: fewer than three FAQs`);
    assert.deepEqual(visible, data, `/${route}: visible FAQ differs from structured data`);
  }
});

test("articles carry Article data with author and dates", () => {
  const articleFiles = files.filter((f) => /articles\/[^/]+\/index\.html$/.test(f));
  assert.ok(articleFiles.length > 0);
  for (const file of articleFiles) {
    const a = graphOf(file).find((n) => n["@type"] === "Article");
    assert.ok(a, `${rel(file)}: no Article`);
    assert.match(a.datePublished, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(a.dateModified, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(a.author["@id"].endsWith("#founder"), `${rel(file)}: article has no author`);
  }
});

test("llms.txt summarises the site and every link resolves", () => {
  const body = read(`${dist}llms.txt`);
  assert.ok(body.startsWith(`# ${site.name}\n`), "llms.txt must start with the site name");
  assert.match(body, /UK-based/);
  const links = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]).filter((u) => u.startsWith(site.siteUrl));
  assert.ok(links.length >= 8, "llms.txt links too few pages");
  for (const url of links) {
    assert.ok(resolveLocal(new URL(url).pathname), `llms.txt links to a missing page: ${url}`);
  }
});

test("every sitemap URL has a lastmod date", () => {
  const sitemap = read(`${dist}sitemap-0.xml`);
  const urls = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  assert.ok(urls.length > 0);
  for (const u of urls) assert.match(u, /<lastmod>\d{4}-\d{2}-\d{2}T/, `no lastmod in ${u.slice(0, 80)}`);
});

test("robots.txt blocks everything before launch, whatever the crawler policy", () => {
  for (const training of [true, false]) {
    assert.equal(robotsTxt({ indexable: false, crawlers: { search: true, training }, sitemapUrl: "x" }), "User-agent: *\nDisallow: /\n");
  }
});

test("robots.txt at launch names every search crawler and follows the training decision", () => {
  for (const training of [true, false]) {
    const body = robotsTxt({ indexable: true, crawlers: { search: true, training }, sitemapUrl: "https://example.com/sitemap-index.xml" });
    const groups = body.split(/\n\n/);
    const ruleFor = (agent) => groups.find((g) => g.includes(`User-agent: ${agent}\n`))?.match(/(Allow|Disallow): \//)?.[1];
    for (const agent of SEARCH_CRAWLERS) assert.equal(ruleFor(agent), "Allow", `${agent} not allowed`);
    for (const agent of TRAINING_CRAWLERS) assert.equal(ruleFor(agent), training ? "Allow" : "Disallow", `${agent} wrong for training=${training}`);
    assert.match(body, /Sitemap: https:\/\/example.com\/sitemap-index.xml/);
  }
});

test("UK-based is stated in the hero, on About and in the footer", () => {
  const home = read(pageFile(""));
  const hero = home.slice(0, home.indexOf("</section>"));
  assert.match(visibleText(hero), /UK-based/);
  assert.match(visibleText(read(pageFile("about/"))), /UK-based/);
  const footer = home.slice(home.indexOf("<footer"));
  assert.match(visibleText(footer), /United Kingdom/);
});

test("About lists no certifications", () => {
  assert.ok(!/Certified|Certification/i.test(visibleText(read(pageFile("about/")))), "About mentions certifications");
});
