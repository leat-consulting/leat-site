# Cloudflare configuration

Cloudflare sits in front of GitHub Pages for TLS, security headers and analytics. GitHub Pages cannot set response headers, so they are added at the edge. These settings live outside GitHub, so they are recorded here and checked continuously by `header-check.yml` once the domain is live.

Status: not yet applied. The domain has not been bought.

## SSL/TLS

- Mode: Full (strict).
- Always Use HTTPS: on.
- Minimum TLS version: 1.2.

## Response headers

One Response Header Transform Rule, matching the site's hostname, sets:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; img-src 'self' data:; style-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

HSTS `preload` is a separate, later decision, because it is hard to undo.

## DNS hardening

- DNSSEC on, with the DS record added at the registrar.
- CAA records allowing only the certificate authorities used by GitHub Pages and by Cloudflare's edge certificates (check both in their dashboards when setting up).
- SPF `v=spf1 -all` and DMARC `v=DMARC1; p=reject`, since the domain sends no mail.

## Web Analytics

Cloudflare Web Analytics with the beacon added to the site's layout by pull request, not by automatic injection, so it appears in the source and in the CSP.

## If GitHub's certificate renewal fails

Renewal can fail while the records are proxied. If the header check reports the origin certificate close to expiry, switch the records to DNS only until GitHub renews it, then proxy them again.
