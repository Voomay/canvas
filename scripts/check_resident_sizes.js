import sharp from 'sharp';
import fs from 'fs';

async function check() {
  for (let i = 1; i <= 17; i++) {
    const files = [
      { type: 'idle', p: `public/assets/residents/idle/resident_${i}.png` },
      { type: 'doubtful', p: `public/assets/residents/doubtful/resident_${i}_doubtful.png` },
      { type: 'happy', p: `public/assets/residents/happy/resident_${i}_happy.png` },
      { type: 'frustrated', p: `public/assets/residents/frustrated/resident_${i}_frustrated.png` }
    ];
    let row = `Resident ${i}:\n`;
    for (const f of files) {
      if (fs.existsSync(f.p)) {
        const img = sharp(f.p);
        const trimInfo = await img.trim().toBuffer({ resolveWithObject: true });
        row += `  ${f.type.padEnd(11)}: content size ${trimInfo.info.width}x${trimInfo.info.height}, trimOffsetTop=${trimInfo.info.trimOffsetTop}, trimOffsetLeft=${trimInfo.info.trimOffsetLeft}\n`;
      }
    }
    console.log(row);
  }
}
check();
