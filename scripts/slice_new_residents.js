import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function sliceNewResidents() {
  console.log('--- Starting Slicing of New Residents ---');

  const sheetPath = 'residents_sheet_2.png';
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

  // Exact bounding boxes derived from pixel projection: [x1, x2, y1, y2]
  const charBoxes = [
    // positive (row 0: thumbs up & ballot)
    [
      { x1: 31, x2: 173, y1: 31, y2: 241 },   // Char 0: Gogo in purple cardigan
      { x1: 196, x2: 334, y1: 20, y2: 241 },  // Char 1: Young man in blue cap & track jacket
      { x1: 358, x2: 490, y1: 22, y2: 241 },  // Char 2: Woman in pink top & hoop earrings
      { x1: 516, x2: 645, y1: 17, y2: 241 },  // Char 3: Man in olive cap & polo
      { x1: 675, x2: 805, y1: 6, y2: 242 },   // Char 4: Young woman with high bun
      { x1: 835, x2: 963, y1: 18, y2: 241 }   // Char 5: Senior gentleman with glasses & blue sweater
    ],
    // doubtful (row 1: arms crossed)
    [
      { x1: 58, x2: 149, y1: 256, y2: 458 },  // Char 0
      { x1: 222, x2: 307, y1: 253, y2: 459 }, // Char 1
      { x1: 385, x2: 465, y1: 254, y2: 460 }, // Char 2
      { x1: 534, x2: 619, y1: 252, y2: 460 }, // Char 3
      { x1: 697, x2: 786, y1: 249, y2: 459 }, // Char 4
      { x1: 863, x2: 939, y1: 254, y2: 460 }  // Char 5
    ],
    // frustrated (row 2: hands out questioning)
    [
      { x1: 27, x2: 173, y1: 477, y2: 659 },  // Char 0
      { x1: 192, x2: 331, y1: 472, y2: 659 }, // Char 1
      { x1: 355, x2: 488, y1: 473, y2: 659 }, // Char 2
      { x1: 506, x2: 645, y1: 471, y2: 659 }, // Char 3
      { x1: 665, x2: 802, y1: 468, y2: 659 }, // Char 4
      { x1: 831, x2: 972, y1: 472, y2: 659 }  // Char 5
    ]
  ];

  const targetW = 150;
  const targetH = 200;
  const bottomMargin = 8; // Feet rest at y = 192 (same as existing residents 2..6)
  const maxAvailableH = targetH - bottomMargin - 8; // 184px max height inside canvas

  const states = ['positive', 'doubtful', 'frustrated'];

  // For each of the 6 new residents (Col 0..5) -> resident_7 through resident_12
  for (let c = 0; c < 6; c++) {
    const resId = 7 + c;
    console.log(`Processing Resident ${resId} (Column ${c})...`);

    // Calculate maximum dimension across all 3 expressions for this character
    // to maintain 100% natural proportions when switching expressions
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
        // If resident 1 doesn't exist, create an alias for compatibility
        if (resId === 7) {
          await sharp(finalSprite).toFile(`public/assets/residents/happy/resident_1_happy.png`);
          await sharp(finalSprite).toFile(`public/assets/residents/idle/resident_1.png`);
        }
      } else if (state === 'doubtful') {
        await sharp(finalSprite).toFile(`public/assets/residents/doubtful/resident_${resId}_doubtful.png`);
        if (resId === 7) {
          await sharp(finalSprite).toFile(`public/assets/residents/doubtful/resident_1_doubtful.png`);
        }
      } else if (state === 'frustrated') {
        await sharp(finalSprite).toFile(`public/assets/residents/frustrated/resident_${resId}_frustrated.png`);
        if (resId === 7) {
          await sharp(finalSprite).toFile(`public/assets/residents/frustrated/resident_1_frustrated.png`);
        }
      }
    }
  }

  console.log('Successfully generated all frames for Residents 7 through 12 (plus resident 1 compatibility)!');
}

sliceNewResidents().catch(err => {
  console.error('Error slicing new residents:', err);
  process.exit(1);
});
