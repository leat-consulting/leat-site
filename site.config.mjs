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
    "Leat Consulting builds secure delivery platforms for engineering teams: architecture reviews, hardened CI/CD and AI code review you own.",
  areaServed: ["London", "United Kingdom"],
  github: "https://github.com/leat-consulting",
  // Booking link and email are not set up yet. Pages show a holding line
  // until they are, and the build refuses to launch without them.
  bookingUrl: null,
  email: null,
};
