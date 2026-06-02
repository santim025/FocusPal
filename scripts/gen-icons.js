/**
 * Generates the Cadencia app icons from the brand mark (open ring "C").
 * Run with: node scripts/gen-icons.js
 *
 * Outputs (paths referenced by app.json):
 *   assets/images/icon.png                    1024  full-bleed tomato + white mark
 *   assets/images/android-icon-foreground.png 1024  white mark on transparent (~58%)
 *   assets/images/android-icon-monochrome.png 1024  white mark on transparent (themed)
 *   assets/images/splash-icon.png              512  white mark on transparent
 *   assets/images/favicon.png                   48  full icon
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// Full icon: radial tomato background + centered white ring mark.
const masterSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="120%">
      <stop offset="0%" stop-color="#F0604F"/>
      <stop offset="55%" stop-color="#E1493B"/>
      <stop offset="100%" stop-color="#C73C30"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" rx="230" fill="url(#bg)"/>
  <g transform="translate(512,512) scale(4.05) translate(-50,-50)" fill="none">
    <path d="M 71 26 A 32 32 0 1 0 71 74" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
    <circle cx="71" cy="26" r="7" fill="#fff"/>
  </g>
</svg>`;

// Bare mark on a transparent 1024 canvas, scaled to occupy the safe zone.
const markSvg = (color, scale) => `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(512,512) scale(${scale}) translate(-50.5,-50)" fill="none">
    <path d="M 71 26 A 32 32 0 1 0 71 74" stroke="${color}" stroke-width="11" stroke-linecap="round"/>
    <circle cx="71" cy="26" r="7" fill="${color}"/>
  </g>
</svg>`;

async function render(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT, file));
  console.log('  ✓', file, `(${size}px)`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('Generating Cadencia icons →', OUT);
  await render(masterSvg, 1024, 'icon.png');
  await render(markSvg('#ffffff', 6.4), 1024, 'android-icon-foreground.png');
  await render(markSvg('#ffffff', 6.4), 1024, 'android-icon-monochrome.png');
  await render(markSvg('#ffffff', 7.4), 512, 'splash-icon.png');
  await render(masterSvg, 48, 'favicon.png');
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
