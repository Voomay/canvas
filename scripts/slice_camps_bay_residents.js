import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function sliceCampsBayResidents() {
  console.log('--- Starting Slicing of Camps Bay & Clifton Residents ---');

  const sheetPath = '5f142e3d-0152-4c3d-b5c4-beb772037b6d (1).png';
  if (!fs.existsSync(sheetPath)) {
    throw new Error(`File not found: ${sheetPath}`);
  }

  // Ensure directories exist
  const resDirs = [
    'public/assets/residents/idle',
    'public/assets/residents/happy',
    'public/assets/residents/doubtful',
    'public/assets/residents/frustrated'
  ];
  resDirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

  // Exact bounding boxes derived from projection: [x1, x2, y1, y2]
  // Row 0: Happy / Thumbs Up (5 characters)
  // Row 1: Doubtful / Arms Crossed (5 characters)
  // Row 2: Frustrated / Hands Gesturing (5 characters)
  const charBoxes = [
    // Row 0: Happy
    [
      { x1: 93, x2: 285, y1: 27, y2: 366 },   // Char 0: Sunglasses gentleman in loafers & polo
      { x1: 347, x2: 533, y1: 37, y2: 367 },  // Char 1: Blonde lady in sunhat & floral dress
      { x1: 606, x2: 810, y1: 27, y2: 367 },  // Char 2: Bearded gentleman with kippah & glasses
      { x1: 916, x2: 1099, y1: 27, y2: 367 }, // Char 3: Athletic lady with visor & water bottle
      { x1: 1207, x2: 1420, y1: 38, y2: 367 } // Char 4: Glamorous lady with dog on leash
    ],
    // Row 1: Doubtful
    [
      { x1: 96, x2: 235, y1: 378, y2: 698 },  // Char 0
      { x1: 356, x2: 528, y1: 383, y2: 701 }, // Char 1
      { x1: 635, x2: 786, y1: 376, y2: 701 }, // Char 2
      { x1: 946, x2: 1088, y1: 376, y2: 701 },// Char 3
      { x1: 1201, x2: 1405, y1: 378, y2: 700 }// Char 4
    ],
    // Row 2: Frustrated
    [
      { x1: 43, x2: 274, y1: 705, y2: 1014 }, // Char 0
      { x1: 337, x2: 553, y1: 714, y2: 1014 },// Char 1
      { x1: 610, x2: 829, y1: 705, y2: 1014 },// Char 2
      { x1: 895, x2: 1118, y1: 705, y2: 1014 },// Char 3
      { x1: 1201, x2: 1430, y1: 707, y2: 1014 }// Char 4
    ]
  ];

  const targetW = 150;
  const targetH = 200;
  const bottomMargin = 8; // Feet rest at y = 192
  const maxAvailableH = targetH - bottomMargin - 8; // 184px max height inside canvas

  const states = ['positive', 'doubtful', 'frustrated'];

  // Resident IDs: 13, 14, 15, 16, 17
  for (let c = 0; c < 5; c++) {
    const resId = 13 + c;
    console.log(`Processing Camps Bay Resident ${resId} (Column ${c})...`);

    // Calculate maximum dimension across all 3 expressions for this character
    let maxH = 0;
    let maxW = 0;
    for (let s = 0; s < 3; s++) {
      const box = charBoxes[s][c];
      const bw = box.x2 - box.x1 + 1;
      const bh = box.y2 - box.y1 + 1;
      if (bh > maxH) maxH = bh;
      if (bw > maxW) maxW = bw;
    }

    const scale = Math.min(maxAvailableH / maxH, 142 / maxW);
    console.log(`  Resident ${resId} scale: ${scale.toFixed(3)} (maxH: ${maxH}, maxW: ${maxW})`);

    for (let s = 0; s < 3; s++) {
      const state = states[s];
      const box = charBoxes[s][c];
      const cropW = box.x2 - box.x1 + 1;
      const cropH = box.y2 - box.y1 + 1;

      // 1. Extract exact sprite area
      const cropped = await sharp(sheetPath)
        .extract({
          left: box.x1,
          top: box.y1,
          width: cropW,
          height: cropH
        })
        .toBuffer();

      // 2. Resize maintaining character proportion
      const scaledW = Math.round(cropW * scale);
      const scaledH = Math.round(cropH * scale);

      const resized = await sharp(cropped)
        .resize({ width: scaledW, height: scaledH })
        .toBuffer();

      // 3. Anchor feet firmly to y = 192, and center horizontally in 150px canvas
      const padTop = targetH - bottomMargin - scaledH;
      const padLeft = Math.max(0, Math.floor((targetW - scaledW) / 2));

      const finalSprite = await sharp({
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

      // 4. Save to corresponding directory
      if (state === 'positive') {
        await sharp(finalSprite).toFile(`public/assets/residents/happy/resident_${resId}_happy.png`);
        await sharp(finalSprite).toFile(`public/assets/residents/idle/resident_${resId}.png`);
      } else if (state === 'doubtful') {
        await sharp(finalSprite).toFile(`public/assets/residents/doubtful/resident_${resId}_doubtful.png`);
      } else if (state === 'frustrated') {
        await sharp(finalSprite).toFile(`public/assets/residents/frustrated/resident_${resId}_frustrated.png`);
      }
    }
  }

  console.log('--- Successfully sliced all 5 Camps Bay Residents (13 to 17) ---');

  // Process Camps Bay Location Background (fe24f361-4e5f-4c1e-ae36-0b2ecea192ea.png)
  const bgPath = 'fe24f361-4e5f-4c1e-ae36-0b2ecea192ea.png';
  if (fs.existsSync(bgPath)) {
    console.log('Processing Camps Bay background panorama...');
    const locationsDir = 'public/assets/backgrounds/locations';
    fs.mkdirSync(locationsDir, { recursive: true });

    // Target height 432 px matches capetown.png & joburg.png
    await sharp(bgPath)
      .resize({ height: 432 })
      .toFile(path.join(locationsDir, 'campsbay.png'));
    console.log('Created public/assets/backgrounds/locations/campsbay.png');
  }
}

sliceCampsBayResidents().catch(err => {
  console.error('Error slicing Camps Bay residents:', err);
  process.exit(1);
});
