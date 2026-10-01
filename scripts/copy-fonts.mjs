// Copy the self-hosted typeface from node_modules into public/fonts, so the
// version is pinned in package-lock.json and updated by Dependabot.
import { copyFileSync, mkdirSync } from "node:fs";

const from = new URL("../node_modules/@fontsource-variable/inter/files/", import.meta.url);
const to = new URL("../public/fonts/", import.meta.url);
mkdirSync(to, { recursive: true });
copyFileSync(new URL("inter-latin-wght-normal.woff2", from), new URL("inter-latin-wght-normal.woff2", to));
copyFileSync(new URL("../LICENSE", from), new URL("LICENSE-inter.txt", to));
