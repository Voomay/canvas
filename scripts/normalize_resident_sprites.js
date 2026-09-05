import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function normalizeAllResidents() {
  console.log('--- Starting Resident Sprite Normalization ---');

  for (let i = 1; i <= 17; i++) {
    const idlePath = `public/assets/residents/idle/resident_${i}.png`;
    if (!fs.existsSync(idlePath)) {
      console.warn(`Idle sprite missing for resident ${i}: ${idlePath}`);
      continue;
    }

    // Get reference character height from idle
    const idleTrim = await sharp(idlePath).trim().toBuffer({ resolveWithObject: true });
    const targetHeight = idleTrim.info.height; // e.g. 184 or 180

    const states = ['frustrated', 'doubtful', 'happy'];

    for (const state of states) {
      const filePath = `public/assets/residents/${state}/resident_${i}_${state}.png`;
      if (!fs.existsSync(filePath)) continue;

      const trimBuffer = await sharp(filePath).trim().toBuffer({ resolveWithObject: true });
      const currentH = trimBuffer.info.height;
      const currentW = trimBuffer.info.width;

      // Only normalize if height deviates from targetHeight by more than 2px
      if (currentH < targetHeight - 2) {
        const scale = targetHeight / currentH;
        let newW = Math.round(currentW * scale);
        let newH = targetHeight;

        // Ensure within canvas bounds
        if (newW > 150) {
          const ratio = 148 / newW;
          newW = 148;
          newH = Math.round(newH * ratio);
        }

        const resizedBuffer = await sharp(trimBuffer.data)
          .resize(newW, newH, {
            kernel: sharp.kernel.lanczos3,
            fit: 'fill'
          })
          .toBuffer();

        const left = Math.max(0, Math.round((150 - newW) / 2));
        const top = Math.max(0, 192 - newH); // align feet to y = 192 (btm = 8px)

        const finalImage = await sharp({
          create: {
            width: 150,
            height: 200,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite([
          {
            input: resizedBuffer,
            left: left,
            top: top
          }
        ])
        .png()
        .toBuffer();

        await sharp(finalImage).toFile(filePath);
        console.log(`Normalized Res ${i} ${state}: ${currentW}x${currentH} -> ${newW}x${newH} (scaled ${scale.toFixed(3)}, top=${top})`);
      } else {
        console.log(`Res ${i} ${state}: already optimal (${currentW}x${currentH}, target ${targetHeight})`);
      }
    }
  }

  console.log('--- Resident Sprite Normalization Complete! ---');
}

normalizeAllResidents();
