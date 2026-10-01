import { test } from "node:test";
import assert from "node:assert/strict";
import { htmlFiles, packagePages, pageFile, read, rel, visibleText } from "./helpers.mjs";

test("every package page has the four required sections", () => {
  for (const route of packagePages) {
    const headings = [...read(pageFile(route)).matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1].trim());
    for (const section of ["Who it is for", "What is included", "What you receive", "What is not included"]) {
      assert.ok(headings.includes(section), `/${route} is missing "${section}"`);
    }
  }
});

test("no page offers ongoing support, retainers or managed services", () => {
  const offer = /\b(retainers?|on-call|24\/7|managed services?|support contracts?|support packages?)\b/gi;
  for (const file of htmlFiles()) {
    const text = visibleText(read(file));
    for (const match of text.matchAll(offer)) {
      const before = text.slice(Math.max(0, match.index - 24), match.index).toLowerCase();
      assert.ok(/\b(no|not|without)\b/.test(before), `${rel(file)}: offers "${match[0]}" ("${before}${match[0]}")`);
    }
  }
});

test("the home page leads with outcomes, not jargon", () => {
  const html = read(pageFile(""));
  const cut = html.indexOf('id="packages"');
  assert.ok(cut > 0, "home page has no packages section");
  const lead = visibleText(html.slice(0, cut));
  for (const term of ["attestation", "provenance", "SHA"]) {
    assert.ok(!new RegExp(`\\b${term}\\b`, term === "SHA" ? "" : "i").test(lead), `"${term}" appears before the packages`);
  }
});

test("pricing shows no invented figures", () => {
  const text = visibleText(read(pageFile("pricing/")));
  assert.ok(!/[£$€]\s?\d/.test(text), "pricing shows a currency amount");
  assert.ok(!/\b\d+\s?(days?|weeks?|hours?)\b/i.test(text), "pricing shows a duration");
});

test("every diagram has a title and a text equivalent", () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    for (const fig of html.matchAll(/<figure class="diagram">([\s\S]*?)<\/figure>/g)) {
      assert.match(fig[1], /<svg[^>]*role="img"[^>]*aria-labelledby="[^"]+"/, `${rel(file)}: diagram without role and label`);
      assert.match(fig[1], /<title id="[^"]+">[^<]+<\/title>/, `${rel(file)}: diagram without a title`);
      assert.match(fig[1], /<figcaption>[\s\S]*<li>/, `${rel(file)}: diagram without a text equivalent`);
    }
  }
});

test("the about page names no former employer or client", () => {
  const text = visibleText(read(pageFile("about/")));
  for (const name of ["Starlizard", "Rackspace", "Volkswagen", "Cabinet Office", "CBRE", "Mountain Warehouse", "PRA Group", "Estar"]) {
    assert.ok(!text.includes(name), `about page names ${name}`);
  }
});
