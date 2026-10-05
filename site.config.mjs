// Site-wide settings. Moving to the custom domain, or launching, changes
// this file only. See docs/launch.md.
export default {
  name: "Leat Consulting",
  // Public origin of the site, without a trailing slash.
  siteUrl: "https://leat-consulting.github.io",
  // Path the site is served under. "/" once the custom domain is live.
  basePath: "/leat-site",
  // false until launch: every page is noindex and robots.txt disallows all.
  indexable: false,
  description:
    "Leat Consulting sets up the path from laptop to production: source control, CI/CD on GitHub or GitLab, AWS infrastructure as code and secure access, handed over for your team to own.",
  // Where Leat is based and who it serves. Country only: no street address.
  country: "GB",
  areaServed: ["United Kingdom"],
  founder: {
    name: "Fraser Davidson",
    jobTitle: "Founder and platform engineer",
    linkedin: "https://www.linkedin.com/in/fraser-davidson-32a194b4/",
  },
  github: "https://github.com/leat-consulting",
  // Crawler policy, applied only once indexable is true (owner, 2026-10-05).
  // search: AI search and user-request crawlers. training: AI training crawlers.
  crawlers: { search: true, training: true },
  // Booking link and email are not set up yet. Pages show a holding line
  // until they are, and the build refuses to launch without them.
  bookingUrl: null,
  email: null,
};
