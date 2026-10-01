# Leat Consulting: leat-site

## Context
Leat Consulting builds secure delivery platforms for engineering teams. This
repository is the company website and the first public consumer of
`platform-workflows`. It is public and part of the demo: treat every file as
something a prospective client will read.

## Rules
- Static output only. No server-side rendering, no client-side frameworks, no forms.
- No inline `<script>` (except JSON-LD) and no inline styles or `<style>` elements; the Content-Security-Policy forbids them. The tests enforce this.
- No third-party scripts except the Cloudflare Web Analytics beacon, once the domain is live.
- Site URL, base path, indexing and contact details live in `site.config.mjs`. Build links with `href()` from `src/lib.ts`, never hard-coded paths.
- Every GitHub Actions job declares minimal `permissions:` and `timeout-minutes:`; every `uses:` is pinned to a full commit SHA with a version comment.
- Diagrams on the How we build page (`src/components/diagrams/`) must match what exists in the public repos. Update a diagram in the same pull request as the change it depicts; each component lists the files it depicts in a comment.
- The offer is three fixed-scope packages that end in a handover. Never offer or imply retainers, on-call, managed services or ongoing support; the tests enforce this.
- Design: every colour, size and space comes from the tokens at the top of `src/styles/global.css` (light and dark). No one-off colours or sizes. Text-led pages, no hero images or animation. Check layout changes with desktop and phone screenshots before review.
- Prose: British English, measured tone, no exclamation marks, no em-dashes, no invented clients, testimonials, prices or metrics.

## Checks to run before committing
```sh
npm run lint    # astro check
npm test        # build, output tests, prose lint
actionlint && zizmor --persona pedantic .
```

## Workflow
- Plan before implementing. Show the plan and wait for approval.
- Small commits with clear messages. Open a pull request as `leat-claude[bot]`; `main` only changes through reviewed pull requests.
- Articles are Markdown in `src/content/articles/`, with title, description, date and tags.
