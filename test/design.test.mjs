import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { dist, htmlFiles, read, rel } from "./helpers.mjs";

const css = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");

function tokens(block) {
  return Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]));
}
const light = tokens(css.slice(css.indexOf(":root {"), css.indexOf("@media (prefers-color-scheme: dark)")));
const dark = { ...light, ...tokens(css.slice(css.indexOf("@media (prefers-color-scheme: dark)"), css.indexOf("/* base */"))) };

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = [
  ["text", "bg"], ["text", "surface"], ["text", "surface-2"], ["text", "accent-soft"],
  ["muted", "bg"], ["muted", "surface"], ["muted", "surface-2"],
  ["accent", "bg"], ["accent", "surface"], ["accent", "accent-soft"],
  ["on-accent", "accent"], ["on-accent", "accent-strong"],
];

for (const [name, scheme] of [["light", light], ["dark", dark]]) {
  test(`colour contrast meets WCAG AA in ${name} mode`, () => {
    for (const [fg, bg] of pairs) {
      assert.ok(scheme[fg] && scheme[bg], `missing token --${fg} or --${bg}`);
      const ratio = contrast(scheme[fg], scheme[bg]);
      assert.ok(ratio >= 4.5, `--${fg} on --${bg} is ${ratio.toFixed(2)}:1 in ${name} mode`);
    }
  });
}

test("fonts are self-hosted and within budget", () => {
  const dir = join(dist, "fonts");
  const fonts = readdirSync(dir).filter((f) => f.endsWith(".woff2"));
  assert.ok(fonts.length > 0, "no font files in the build");
  const total = fonts.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
  assert.ok(total <= 120 * 1024, `fonts total ${Math.round(total / 1024)} KB, over 120 KB`);
  const built = readdirSync(join(dist, "_astro")).filter((f) => f.endsWith(".css")).map((f) => read(join(dist, "_astro", f))).join("\n");
  for (const m of built.matchAll(/url\(([^)]+)\)/g)) {
    assert.ok(!/^["']?(https?:)?\/\//.test(m[1]), `stylesheet loads ${m[1]} from another origin`);
  }
});

test("no stylesheet, script or font is loaded from another origin", () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    for (const m of html.matchAll(/<(link|script)\b[^>]*\b(href|src)="([^"]+)"/g)) {
      const isNavigation = m[1] === "link" && /rel="(canonical|sitemap|icon)"/.test(m[0]);
      if (isNavigation) continue;
      assert.ok(!/^(https?:)?\/\//.test(m[3]), `${rel(file)}: loads ${m[3]} from another origin`);
    }
  }
});
