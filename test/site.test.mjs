import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { attr, attrs, dist, htmlFiles, pageFile, pages, read, rel, resolveLocal, site } from "./helpers.mjs";

const origin = new URL(site.siteUrl).origin;
const basePrefix = `${site.siteUrl}${site.basePath.replace(/\/$/, "")}/`;
const files = htmlFiles();

test("every listed page is built", () => {
  for (const route of pages) {
    assert.ok(existsSync(pageFile(route)), `missing page: /${route}`);
  }
});

test("internal links and assets all resolve", () => {
  const broken = [];
  for (const file of files) {
    const html = read(file);
    for (const tag of [...attrs(html, "a"), ...attrs(html, "link")]) {
      const value = attr(tag, "href");
      if (!value || value.startsWith("mailto:") || value.startsWith("#")) continue;
      const url = new URL(value, `${origin}/`);
      if (url.origin !== origin) continue;
      if (!resolveLocal(url.pathname)) broken.push(`${rel(file)} -> ${value}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("titles are unique and every page has full metadata", () => {
  const seen = new Map();
  for (const file of files.filter((f) => !f.endsWith("404.html"))) {
    const html = read(file);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    assert.ok(title, `${rel(file)}: no title`);
    assert.ok(!seen.has(title), `${rel(file)}: title duplicates ${seen.get(title)}`);
    seen.set(title, rel(file));
    const metas = attrs(html, "meta");
    const content = (key, value) => metas.map((m) => (attr(m, key) === value ? attr(m, "content") : null)).find(Boolean);
    const description = content("name", "description");
    assert.ok(description && description.length >= 50, `${rel(file)}: description missing or too short`);
    for (const prop of ["og:title", "og:description", "og:url", "og:image", "og:type"]) {
      assert.ok(content("property", prop), `${rel(file)}: no ${prop}`);
    }
    assert.ok(content("property", "og:image").startsWith(basePrefix), `${rel(file)}: og:image not absolute`);
    const canonical = attrs(html, "link").find((l) => attr(l, "rel") === "canonical");
    assert.ok(canonical && attr(canonical, "href").startsWith(basePrefix), `${rel(file)}: canonical missing or off-site`);
  }
});

test("no forms, no inline scripts, no inline styles", () => {
  for (const file of files) {
    const html = read(file);
    assert.ok(!/<form\b/i.test(html), `${rel(file)}: contains a form`);
    assert.ok(!/<style\b/i.test(html), `${rel(file)}: contains a <style> element`);
    assert.ok(!/\sstyle="/i.test(html), `${rel(file)}: contains a style attribute`);
    for (const tag of attrs(html, "script")) {
      const external = attr(tag, "src");
      const data = attr(tag, "type") === "application/ld+json";
      assert.ok(external || data, `${rel(file)}: inline script ${tag}`);
    }
  }
});

test("home page has honest ProfessionalService structured data", () => {
  const html = read(pageFile(""));
  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(block, "no JSON-LD on the home page");
  const data = JSON.parse(block);
  assert.equal(data["@type"], "ProfessionalService");
  assert.equal(data.name, site.name);
  assert.ok(!("aggregateRating" in data) && !("review" in data), "invented ratings or reviews");
  assert.ok(!("address" in data), "street address should not be published");
});

test("sitemap lists every page and article", () => {
  assert.ok(existsSync(`${dist}sitemap-index.xml`));
  const sitemap = read(`${dist}sitemap-0.xml`);
  const articles = files.filter((f) => /articles\/[^/]+\/index\.html$/.test(f)).map((f) => rel(f).replace("index.html", ""));
  for (const route of [...pages, ...articles]) {
    assert.ok(sitemap.includes(`<loc>${basePrefix}${route}</loc>`), `sitemap missing /${route}`);
  }
  assert.ok(!sitemap.includes("404"), "sitemap lists the 404 page");
});

test("indexing follows the indexable setting", () => {
  const robots = read(`${dist}robots.txt`);
  const index = read(pageFile(""));
  if (site.indexable) {
    assert.match(robots, /Allow: \//);
    assert.match(robots, /Sitemap: /);
    assert.ok(!index.includes('name="robots"'), "indexable site must not carry noindex");
  } else {
    assert.match(robots, /Disallow: \//);
    for (const file of files) {
      assert.ok(read(file).includes('content="noindex, nofollow"'), `${rel(file)}: missing noindex before launch`);
    }
  }
});

test("security.txt is valid and expires within a year", () => {
  const body = read(`${dist}.well-known/security.txt`);
  assert.match(body, /^Contact: https:\/\//m);
  const expires = new Date(body.match(/^Expires: (.+)$/m)[1]);
  const days = (expires - Date.now()) / 86_400_000;
  assert.ok(days > 30 && days <= 365, `Expires is ${Math.round(days)} days away`);
});
