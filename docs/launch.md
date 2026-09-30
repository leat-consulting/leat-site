# Moving to the custom domain and launching

The site starts at `https://leat-consulting.github.io/leat-site/`, marked `noindex`. Moving to the custom domain and launching are separate steps.

## 1. Custom domain

1. Buy the domain and move its DNS to Cloudflare. Turn on 2FA for the Cloudflare account.
2. Verify the domain for GitHub Pages at organisation level, so no other account can claim it: organisation Settings, Pages, Add a domain.
3. In `leat-site` Settings, Pages, set the custom domain. In Cloudflare, add the DNS records GitHub shows, **DNS only (grey cloud)**.
4. Wait until GitHub has issued the certificate and "Enforce HTTPS" can be ticked. Tick it.
5. Switch the records to **Proxied (orange cloud)**, and set Cloudflare SSL/TLS to **Full (strict)**. Proxying before GitHub has a certificate can stop it being issued, and then Full (strict) serves errors.
6. Apply the edge settings in [`cloudflare.md`](cloudflare.md).
7. In `site.config.mjs`, set `siteUrl` to the domain and `basePath` to `"/"`, by pull request.

## 2. Launch

1. Set `bookingUrl` and `email` in `site.config.mjs`.
2. Resolve everything in [`copy-review.md`](copy-review.md).
3. Set `indexable: true`. The build refuses to do this while `bookingUrl` or `email` is missing.
