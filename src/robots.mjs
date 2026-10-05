// robots.txt content, kept as a pure function so both launch states can be tested.
// Crawler names checked on 2026-10-05 against each operator's documentation:
//   OpenAI      https://developers.openai.com/api/docs/bots
//   Anthropic   https://support.claude.com/en/articles/8896518
//   Perplexity  https://docs.perplexity.ai/guides/bots
//   Google      https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
export const SEARCH_CRAWLERS = [
  "Googlebot", "Bingbot",
  "OAI-SearchBot", "ChatGPT-User",
  "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
];
export const TRAINING_CRAWLERS = ["GPTBot", "ClaudeBot", "Google-Extended"];

export function robotsTxt({ indexable, crawlers, sitemapUrl }) {
  if (!indexable) return "User-agent: *\nDisallow: /\n";
  const group = (agents, allow) => `${agents.map((a) => `User-agent: ${a}`).join("\n")}\n${allow ? "Allow: /" : "Disallow: /"}\n`;
  return [
    "# Search engines and AI search assistants are welcome.",
    group(SEARCH_CRAWLERS, crawlers.search),
    "# AI model training crawlers.",
    group(TRAINING_CRAWLERS, crawlers.training),
    group(["*"], true),
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");
}
