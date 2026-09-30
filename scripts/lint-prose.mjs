// Check the rendered text of every page against the house style:
// no exclamation marks and no em-dashes. Code and preformatted text are
// ignored. Run after a build.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const files = (function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : name.endsWith(".html") ? [path] : [];
  });
})(dist);

const problems = [];
for (const file of files) {
  const text = readFileSync(file, "utf8")
    .replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<!doctype[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (e) => (e === "&#33;" || e === "&excl;" ? "!" : e === "&mdash;" || e === "&#8212;" ? "—" : " "));
  for (const [char, name] of [["!", "exclamation mark"], ["—", "em-dash"]]) {
    let index = text.indexOf(char);
    while (index !== -1) {
      const context = text.slice(Math.max(0, index - 40), index + 20).replace(/\s+/g, " ").trim();
      problems.push(`${relative(dist, file)}: ${name} in "${context}"`);
      index = text.indexOf(char, index + 1);
    }
  }
}

for (const problem of problems) console.log(problem);
console.log(`${files.length} page(s) checked, ${problems.length} problem(s)`);
process.exit(problems.length ? 1 : 0);
