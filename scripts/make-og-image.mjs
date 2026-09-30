// Generates public/og-default.png, the default Open Graph image.
// Shapes only, so it renders the same anywhere without fonts.
// Run: node scripts/make-og-image.mjs
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1f5c46"/>
  <g fill="none" stroke="#7fcaa9" stroke-width="6" opacity="0.55">
    <path d="M120 470 H420 L520 370 H760 L860 270 H1080"/>
    <circle cx="420" cy="470" r="14" fill="#1f5c46"/>
    <circle cx="760" cy="370" r="14" fill="#1f5c46"/>
    <circle cx="1080" cy="270" r="14" fill="#1f5c46"/>
  </g>
  <rect x="120" y="120" width="120" height="120" rx="18" fill="#ffffff"/>
  <path d="M160 145 V215 H210 V199 H176 V145 Z" fill="#1f5c46"/>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/og-default.png");
console.log("wrote public/og-default.png");
