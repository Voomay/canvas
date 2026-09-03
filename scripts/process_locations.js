import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processLocations() {
  console.log('--- Processing Cape Town & Johannesburg Backgrounds ---');

  const uploadDir = 'C:/Users/Cheslin Gabriels/.gemini/antigravity-ide/brain/4d872901-99d6-4104-bd67-a3d0d2d6eec2/.user_uploaded/';
  const ctSource = uploadDir + 'media_1788383150176.png';
  const jhbSource = uploadDir + 'media_1788383168057.png';

  const locationsDir = 'public/assets/backgrounds/locations';
  fs.mkdirSync(locationsDir, { recursive: true });

  // Height 432 fits from y=0 to y=432 (meeting the road at y=428 with 4px overlap)
  const targetHeight = 432;

  // 1. Process Cape Town / Hanover Park
  console.log('Processing Cape Town / Hanover Park artwork...');
  await sharp(ctSource)
    .resize({ height: targetHeight })
    .toFile(path.join(locationsDir, 'capetown.png'));

  // 2. Process Johannesburg artwork
  console.log('Processing Johannesburg artwork...');
  await sharp(jhbSource)
    .resize({ height: targetHeight })
    .toFile(path.join(locationsDir, 'joburg.png'));

  // 3. Process Sky Clouds Tile
  console.log('Processing Sky Clouds tile...');
  await sharp('public/assets/backgrounds/clouds/clouds_tile.png')
    .resize({ height: 120 })
    .toFile('public/assets/backgrounds/clouds/clouds_sky.png');

  console.log('All location backgrounds and cloud assets successfully created!');
}

processLocations().catch(err => {
  console.error('Error processing locations:', err);
  process.exit(1);
});
