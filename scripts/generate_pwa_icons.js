import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generatePwaIcons() {
  console.log('--- Generating High-Res PWA Icons ---');

  const outDir = 'public/assets/icons';
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Create 512x512 Master App Icon
  // Background: Deep dark navy #0c1524 with subtle golden gradient border and voting checkmark + player sprite
  const masterSize = 512;

  // We can composite the candidate sprite (holding ballot or thumbs up)
  const candidateBuf = fs.existsSync('public/assets/players/da/da_talk_point.png')
    ? 'public/assets/players/da/da_talk_point.png'
    : 'public/assets/players/da/da_idle.png';

  // Resize candidate to fit nicely inside icon
  const charResized = await sharp(candidateBuf)
    .resize({ height: 340, fit: 'contain' })
    .toBuffer();

  const svgBadge = Buffer.from(`
    <svg width="${masterSize}" height="${masterSize}" viewBox="0 0 ${masterSize} ${masterSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#142236"/>
          <stop offset="100%" stop-color="#080e18"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd54f"/>
          <stop offset="100%" stop-color="#fcb813"/>
        </linearGradient>
        <linearGradient id="saGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#007a3d"/>
          <stop offset="100%" stop-color="#1e6b38"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Rounded App Icon Background -->
      <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="12"/>

      <!-- Inner decorative glowing ring -->
      <circle cx="256" cy="256" r="210" fill="none" stroke="#1f3c6e" stroke-width="4" opacity="0.6"/>

      <!-- South African Flag accent stripes in top corner -->
      <path d="M 120 28 L 392 28 C 440 28 474 62 474 110 L 474 130 Z" fill="#007a3d" opacity="0.85"/>
      <path d="M 28 120 L 28 392 C 28 440 62 474 110 474 L 130 474 Z" fill="#fcb813" opacity="0.25"/>

      <!-- Top Title Ribbon: "CAMPAIGN TRAIL" -->
      <rect x="76" y="52" width="360" height="54" rx="27" fill="#0c1524" stroke="#fcb813" stroke-width="3"/>
      <text x="256" y="88" font-family="'Outfit', sans-serif" font-size="24" font-weight="900" fill="#fcb813" text-anchor="middle" letter-spacing="2">CAMPAIGN TRAIL</text>

      <!-- Ballot Box / Vote Checkmark Emblem -->
      <g transform="translate(330, 320)" filter="url(#shadow)">
        <rect x="0" y="0" width="120" height="120" rx="24" fill="#fcb813" stroke="#ffffff" stroke-width="4"/>
        <path d="M 28 60 L 52 84 L 92 36" fill="none" stroke="#080d14" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  `);

  // Composite SVG background with the character sprite
  const icon512 = await sharp(svgBadge)
    .composite([
      {
        input: charResized,
        top: 130,
        left: 60
      }
    ])
    .png()
    .toBuffer();

  // Save 512x512 icon
  await sharp(icon512).toFile(path.join(outDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // Generate 192x192 icon
  await sharp(icon512)
    .resize(192, 192)
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  // Generate Apple Touch Icon (180x180)
  await sharp(icon512)
    .resize(180, 180)
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Generate 512x512 Maskable Icon (Full-bleed with 20% safe-zone margin)
  const maskableSvg = Buffer.from(`
    <svg width="${masterSize}" height="${masterSize}" viewBox="0 0 ${masterSize} ${masterSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#142236"/>
          <stop offset="100%" stop-color="#080e18"/>
        </linearGradient>
        <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd54f"/>
          <stop offset="100%" stop-color="#fcb813"/>
        </linearGradient>
      </defs>
      <!-- Edge-to-edge solid background for maskable adaptive clipping -->
      <rect x="0" y="0" width="${masterSize}" height="${masterSize}" fill="url(#bgGrad2)"/>
      <circle cx="256" cy="256" r="236" fill="none" stroke="url(#goldGrad2)" stroke-width="8"/>
      <rect x="96" y="64" width="320" height="48" rx="24" fill="#0c1524" stroke="#fcb813" stroke-width="3"/>
      <text x="256" y="96" font-family="'Outfit', sans-serif" font-size="22" font-weight="900" fill="#fcb813" text-anchor="middle">CAMPAIGN TRAIL</text>
    </svg>
  `);

  const charMaskable = await sharp(candidateBuf)
    .resize({ height: 290, fit: 'contain' })
    .toBuffer();

  const voteSmall = Buffer.from(`
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="18" fill="#fcb813" stroke="#ffffff" stroke-width="4"/>
      <path d="M 22 50 L 42 70 L 78 28" fill="none" stroke="#080d14" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `);

  const icon512Maskable = await sharp(maskableSvg)
    .composite([
      { input: charMaskable, top: 145, left: 110 },
      { input: voteSmall, top: 320, left: 320 }
    ])
    .png()
    .toBuffer();

  await sharp(icon512Maskable).toFile(path.join(outDir, 'icon-512-maskable.png'));
  console.log('Created icon-512-maskable.png');

  console.log('All PWA Icons created successfully!');
}

generatePwaIcons().catch(err => {
  console.error('Error generating PWA icons:', err);
  process.exit(1);
});
