import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceDir = 'C:/Users/Cheslin Gabriels/.gemini/antigravity-ide/brain/dfbd4e5d-a0cb-477e-8ac2-387cb06c22c8/.user_uploaded';
const outputDir = path.resolve('public/assets/obstacles');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// File mappings identified from inspection:
// media_1788439248379.png -> Curb drain overflowing with green sludge & fumes
// media_1788439248624.png -> Deep crater pothole filled with murky water
// media_1788439248857.png -> Small shallow asphalt pothole
// media_1788439249602.png -> Round open manhole with tilted lid and green fumes

const obstacleConfigs = [
  {
    src: 'media_1788439248379.png',
    dest: 'broken_drain.png',
    targetWidth: 150 // preserves the curb and rising fumes nicely
  },
  {
    src: 'media_1788439248624.png',
    dest: 'pothole_water.png',
    targetWidth: 160 // wide crater pothole
  },
  {
    src: 'media_1788439248857.png',
    dest: 'pothole_small.png',
    targetWidth: 130 // shallow road pothole
  },
  {
    src: 'media_1788439249602.png',
    dest: 'open_manhole.png',
    targetWidth: 140 // manhole with green fumes
  }
];

async function processAll() {
  console.log('Processing obstacle images...');
  for (const cfg of obstacleConfigs) {
    const srcPath = path.join(sourceDir, cfg.src);
    const destPath = path.join(outputDir, cfg.dest);

    if (!fs.existsSync(srcPath)) {
      console.error(`Source file not found: ${srcPath}`);
      continue;
    }

    // Trim transparent padding, then resize with high quality preservation of pixel art
    await sharp(srcPath)
      .trim()
      .resize({
        width: cfg.targetWidth,
        kernel: sharp.kernel.lanczos3
      })
      .png({ compressionLevel: 9 })
      .toFile(destPath);

    const meta = await sharp(destPath).metadata();
    console.log(`Saved ${cfg.dest}: ${meta.width}x${meta.height}`);
  }
  console.log('All obstacle images successfully generated!');
}

processAll().catch(err => {
  console.error(err);
  process.exit(1);
});
