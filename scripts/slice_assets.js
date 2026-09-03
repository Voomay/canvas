import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function sliceAllAssets() {
  console.log('--- Starting Asset Slicing & Integration ---');

  // Ensure directories exist
  const dirs = [
    'public/assets/backgrounds/houses',
    'public/assets/backgrounds/clouds',
    'public/assets/roads/clean',
    'public/assets/players/da',
    'public/assets/players/anc',
    'public/assets/players/pa'
  ];
  dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

  // 1. Copy & process Pixel Clouds
  console.log('Processing Clouds...');
  await sharp('6c3e7c02-c985-416e-87bd-2478689b7bf2.png')
    .toFile('public/assets/backgrounds/clouds/clouds.png');
  await sharp('6c3e7c02-c985-416e-87bd-2478689b7bf2 (1).png')
    .toFile('public/assets/backgrounds/clouds/clouds_puffy.png');

  // 2. Copy & process Houses strip
  console.log('Processing Houses strip...');
  await sharp('corprocoating linked post (40) (1).png')
    .extract({ left: 0, top: 80, width: 2550, height: 326 })
    .resize({ height: 260 })
    .toFile('public/assets/backgrounds/houses/suburb_houses.png');

  // 3. Copy & process Road & Pavement strip
  console.log('Processing Road strip...');
  await sharp('fb47915e-9a9d-4071-9106-ba1c998bddf0.png')
    .extract({ left: 0, top: 167, width: 2172, height: 556 })
    .resize({ height: 292 })
    .toFile('public/assets/roads/clean/pavement_road.png');

  // 4. Slice Character Frames from 6d0c0b76-15cf-4e3c-9a44-7f2c1bd30abc.png
  console.log('Cutting Character Frames...');
  const charSheet = '6d0c0b76-15cf-4e3c-9a44-7f2c1bd30abc.png';
  const cellW = 256;
  const cellH = 512;

  // Standard target output size for Phaser character
  const targetW = 140;
  const targetH = 200;

  // Extract each of the 12 frames
  // Row 0: 6 run frames (col 0..5)
  // Row 1:
  //   col 0: idle 1
  //   col 1: idle 2
  //   col 2: hit / stumble
  //   col 3: jump / dodge
  //   col 4: talk / gesturing
  //   col 5: talk / pointing

  const frameMap = [
    // Row 0: Run frames 0..5
    { row: 0, col: 0, name: 'run_0' },
    { row: 0, col: 1, name: 'run_1' },
    { row: 0, col: 2, name: 'run_2' },
    { row: 0, col: 3, name: 'run_3' },
    { row: 0, col: 4, name: 'run_4' },
    { row: 0, col: 5, name: 'run_5' },

    // Row 1: Idle, Jump, Hit, Talk
    { row: 1, col: 0, name: 'idle' },
    { row: 1, col: 1, name: 'idle_2' },
    { row: 1, col: 2, name: 'hit' },
    { row: 1, col: 3, name: 'jump' },
    { row: 1, col: 4, name: 'talk' },
    { row: 1, col: 5, name: 'talk_point' }
  ];

  for (const f of frameMap) {
    // Add safety inset to prevent adjacent frame bleed
    const insetX = 14;
    const left = f.col * cellW + insetX;
    const top = f.row * cellH + 6;
    const extractW = cellW - insetX * 2;
    const extractH = cellH - 34; // Exclude horizontal row divider line

    // Extract cell
    const cellBuf = await sharp(charSheet)
      .extract({ left, top, width: extractW, height: extractH })
      .toBuffer();

    // Trim transparent borders
    const trimmed = await sharp(cellBuf).trim().toBuffer();
    const meta = await sharp(trimmed).metadata();

    // Crop bottom 6 pixels to cleanly remove the ground reference line
    const cleanChar = await sharp(trimmed)
      .extract({ 
        left: 0, 
        top: 0, 
        width: meta.width, 
        height: Math.max(10, meta.height - 6) 
      })
      .toBuffer();

    const cleanMeta = await sharp(cleanChar).metadata();

    // Scale to fit nicely within target height while preserving aspect ratio
    const scaledH = 180;
    const scaledW = Math.round((cleanMeta.width / cleanMeta.height) * scaledH);

    const resized = await sharp(cleanChar)
      .resize({ height: scaledH, width: scaledW, fit: 'contain' })
      .toBuffer();

    // Extend onto a consistent canvas (140x200), bottom-aligned
    const padTop = targetH - scaledH - 8;
    const padLeft = Math.max(0, Math.floor((targetW - scaledW) / 2));

    const finalDA = await sharp({
      create: {
        width: targetW,
        height: targetH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resized, top: padTop, left: padLeft }])
      .png()
      .toBuffer();

    // Save DA frame
    await sharp(finalDA).toFile(`public/assets/players/da/da_${f.name}.png`);

    // Create ANC variant (shift blue shirt #005ba6 towards ANC green #007a3d)
    const ancBuf = await createColorVariant(finalDA, 'anc');
    await sharp(ancBuf).toFile(`public/assets/players/anc/anc_${f.name}.png`);

    // Create PA variant (shift blue shirt towards PA emerald/gold #1e6b38)
    const paBuf = await createColorVariant(finalDA, 'pa');
    await sharp(paBuf).toFile(`public/assets/players/pa/pa_${f.name}.png`);
  }

  // 5. Slice Residents (Idle, Happy, Doubtful, Frustrated)
  console.log('Cutting Resident Frames...');
  const resDirs = [
    'public/assets/residents/idle',
    'public/assets/residents/happy',
    'public/assets/residents/doubtful',
    'public/assets/residents/frustrated'
  ];
  resDirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

  const resFile = '678a77a1-6d0d-4908-a0d3-3bfc8937f081.png';
  const resCellW = 256;
  const resRows = [
    { top: 0, height: 350, state: 'positive' },
    { top: 358, height: 325, state: 'doubtful' },
    { top: 694, height: 328, state: 'frustrated' }
  ];

  for (let r = 0; r < resRows.length; r++) {
    const row = resRows[r];
    for (let col = 0; col < 6; col++) {
      const left = col * resCellW;
      const cell = await sharp(resFile)
        .extract({ left: left + 10, top: row.top, width: resCellW - 20, height: row.height })
        .toBuffer();

      const trimmed = await sharp(cell).trim().toBuffer();
      const meta = await sharp(trimmed).metadata();

      const cleanChar = await sharp(trimmed)
        .extract({ left: 0, top: 0, width: meta.width, height: Math.max(10, meta.height - 5) })
        .toBuffer();
      const cleanMeta = await sharp(cleanChar).metadata();

      const resTargetH = 200;
      const resTargetW = 150;
      const resScaledH = 180;
      const resScaledW = Math.round((cleanMeta.width / cleanMeta.height) * resScaledH);

      const resized = await sharp(cleanChar)
        .resize({ width: resScaledW, height: resScaledH, fit: 'contain' })
        .toBuffer();

      const padTop = resTargetH - resScaledH - 8;
      const padLeft = Math.max(0, Math.floor((resTargetW - resScaledW) / 2));

      const finalRes = await sharp({
        create: {
          width: resTargetW,
          height: resTargetH,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([{ input: resized, top: padTop, left: padLeft }])
        .png()
        .toBuffer();

      const resId = col + 1;
      if (row.state === 'positive') {
        await sharp(finalRes).toFile(`public/assets/residents/happy/resident_${resId}_happy.png`);
        await sharp(finalRes).toFile(`public/assets/residents/idle/resident_${resId}.png`);
      } else if (row.state === 'doubtful') {
        await sharp(finalRes).toFile(`public/assets/residents/doubtful/resident_${resId}_doubtful.png`);
      } else {
        await sharp(finalRes).toFile(`public/assets/residents/frustrated/resident_${resId}_frustrated.png`);
      }
    }
  }

  console.log('Successfully cut all character frames for DA, ANC, and PA, and all Residents!');
}

async function createColorVariant(pngBuffer, party) {
  const { data, info } = await sharp(pngBuffer).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const a = out[i + 3];

    if (a > 30) {
      // Check if pixel is predominantly blue (Candidate Dan's shirt and sneakers)
      // Blue channel significantly higher than red
      if (b > 120 && b > r + 40 && b > g - 10) {
        if (party === 'anc') {
          // Green shirt with gold accents
          out[i] = Math.min(255, Math.floor(r * 0.3));       // R
          out[i + 1] = Math.min(255, Math.floor(b * 0.85));  // G
          out[i + 2] = Math.min(255, Math.floor(r * 0.4));   // B
        } else if (party === 'pa') {
          // Emerald green / gold
          out[i] = Math.min(255, Math.floor(b * 0.25));
          out[i + 1] = Math.min(255, Math.floor(b * 0.75));
          out[i + 2] = Math.min(255, Math.floor(r * 0.2));
        }
      }
    }
  }

  return sharp(out, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  }).png().toBuffer();
}

sliceAllAssets().catch(err => {
  console.error('Error slicing assets:', err);
  process.exit(1);
});
