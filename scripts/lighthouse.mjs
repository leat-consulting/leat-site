// Run Lighthouse against the built site and fail if any category scores
// below the threshold. Each page runs three times and the median counts,
// to smooth out noise on shared CI runners.
//
// Needs a built site (npm run build) and Chrome. Before launch every page is
// noindex on purpose, so the "is crawlable" audit is skipped until
// site.config.mjs sets indexable: true.
import { spawn } from "node:child_process";
import { appendFileSync } from "node:fs";
import site from "../site.config.mjs";

const THRESHOLD = 0.95;
const RUNS = 3;
const PORT = 4321;
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const base = site.basePath.replace(/\/$/, "");
const PAGES = ["", "pricing/", "articles/pinning-actions-to-commits/"];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "inherit"] });
    let out = "";
    child.stdout.on("data", (chunk) => (out += chunk));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`${command} exited ${code}`))));
  });
}

async function waitFor(url, attempts = 50) {
  for (let i = 0; i < attempts; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`preview server did not start at ${url}`);
}

const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];

const preview = spawn("npx", ["astro", "preview", "--host", "127.0.0.1", "--port", String(PORT)], {
  stdio: "ignore",
});

let failed = false;
const rows = [];
try {
  const root = `http://127.0.0.1:${PORT}${base}/`;
  await waitFor(root);
  for (const page of PAGES) {
    const url = `${root}${page}`;
    const scores = Object.fromEntries(CATEGORIES.map((c) => [c, []]));
    for (let i = 0; i < RUNS; i++) {
      const args = [
        "lighthouse", url, "--quiet", "--output=json", "--output-path=stdout",
        `--only-categories=${CATEGORIES.join(",")}`,
        "--chrome-flags=--headless=new --no-sandbox",
      ];
      if (!site.indexable) args.push("--skip-audits=is-crawlable");
      const report = JSON.parse(await run("npx", args));
      for (const c of CATEGORIES) scores[c].push(report.categories[c].score);
    }
    const result = Object.fromEntries(CATEGORIES.map((c) => [c, median(scores[c])]));
    rows.push({ page: `/${page}`, ...result });
    if (Object.values(result).some((s) => s < THRESHOLD)) failed = true;
  }
} finally {
  preview.kill();
}

const pct = (s) => `${Math.round(s * 100)}${s < THRESHOLD ? " (below target)" : ""}`;
const table = [
  `| Page | ${CATEGORIES.join(" | ")} |`,
  `|---|${CATEGORIES.map(() => "---").join("|")}|`,
  ...rows.map((r) => `| ${r.page} | ${CATEGORIES.map((c) => pct(r[c])).join(" | ")} |`),
].join("\n");
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Lighthouse (median of ${RUNS}, target ${THRESHOLD * 100})\n\n${table}\n`);
}
process.exit(failed ? 1 : 0);
