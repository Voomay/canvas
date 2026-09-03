import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const GIF_PATH = 'Untitled design (1).gif';
const OUT_DIR = 'public/assets/vehicles';
const OUT_FILE = path.join(OUT_DIR, 'taxi_minibus.png');

// Crop bounding box across all frames: left 175, top 280, width 666, height 405
const CROP_BOX = { left: 175, top: 280, width: 666, height: 405 };
const FRAME_W = 380;
const FRAME_H = 230;

async function processTaxi() {
  console.log('--- Processing Hanover Park Minibus Taxi Animated Spritesheet ---');

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const meta = await sharp(GIF_PATH).metadata();
  console.log(`Total source frames: ${meta.pages}`);

  // Sample every 2nd frame for 51 crisp, high-framerate frames (~15-18 FPS)
  const frameIndices = [];
  for (let i = 0; i < meta.pages; i += 2) {
    frameIndices.push(i);
  }

  const cols = 6;
  const rows = Math.ceil(frameIndices.length / cols);
  const sheetW = cols * FRAME_W;
  const sheetH = rows * FRAME_H;

  console.log(`Spritesheet grid: ${cols} cols x ${rows} rows (${sheetW}x${sheetH}px, ${frameIndices.length} frames)`);

  const composites = [];

  for (let idx = 0; idx < frameIndices.length; idx++) {
    const page = frameIndices[idx];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * FRAME_W;
    const y = row * FRAME_H;

    const frameBuf = await sharp(GIF_PATH, { page })
      .extract(CROP_BOX)
      .resize(FRAME_W, FRAME_H, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    composites.push({ input: frameBuf, left: x, top: y });
  }

  console.log('Assembling full spritesheet...');
  const assembled = await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(composites)
    .png({ palette: true, quality: 85, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(OUT_FILE, assembled);
  const sizeMB = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2);
  console.log(`Successfully saved ${OUT_FILE} (${sizeMB} MB, ${frameIndices.length} frames)!`);
}

processTaxi().catch(err => {
  console.error('Failed to process taxi spritesheet:', err);
  process.exit(1);
});
