# leat-site

Source for the Leat Consulting website: a static [Astro](https://astro.build) site, built, attested and deployed to GitHub Pages through the workflows in [platform-workflows](https://github.com/leat-consulting/platform-workflows).

This repository is built in the open. Every change arrives through a reviewed pull request.

## How a change reaches the site

1. A pull request runs `node-ci` (lint, tests, build), `security-scan`, and a Lighthouse check that fails below 95 in any category.
2. After review and merge, `main.yml` builds the site once, then `pages-deploy` attests the package, verifies the attestation, and deploys exactly that package.

## Working on it

```sh
npm ci --ignore-scripts
npm run dev        # local preview
npm test           # build, output tests and prose lint
npm run lighthouse # needs Chrome
```

Site-wide settings, including the URL, indexing and contact details, are in [`site.config.mjs`](site.config.mjs). The steps for moving to the custom domain and launching are in [`docs/launch.md`](docs/launch.md).
