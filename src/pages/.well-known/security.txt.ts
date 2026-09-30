import type { APIRoute } from "astro";
import { absolute } from "../../lib";

// RFC 9116. Expires is set 180 days after each build, so every deploy
// renews it; the scheduled header check alerts if it gets close.
export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    "Contact: https://github.com/leat-consulting/leat-site/security/advisories/new",
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en",
    `Canonical: ${absolute(".well-known/security.txt")}`,
    "Policy: https://github.com/leat-consulting/leat-site/security/policy",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
