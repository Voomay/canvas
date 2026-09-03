import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const GIF_PATH = 'E:/Downloads/Untitled design.gif';
const CROP_BOX = { left: 200, top: 120, width: 540, height: 790 };
const TARGET_W = 144;
const TARGET_H = 200;

// The seamless run cycle is 31 frames: frames 85 to 115
const LOOP_START = 85;
const LOOP_COUNT = 31;

// Standing idle frames
const STAND_FRAME = 30;
const TALK_FRAME = 35;
const JUMP_FRAME = 105;

async function createColorVariant(pngBuffer, party) {
  const { data, info } = await sharp(pngBuffer).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const a = out[i + 3];

    if (a > 30) {
      // Blue cloth detection in DA polo/shoes/bag: blue is dominant
      if (b > 110 && b > r + 35 && b > g - 20) {
        if (party === 'anc') {
          // ANC Green
          out[i] = Math.min(255, Math.floor(r * 0.2));
          out[i + 1] = Math.min(255, Math.floor(b * 0.88 + 20));
          out[i + 2] = Math.min(255, Math.floor(r * 0.2));
        } else if (party === 'pa') {
          // PA Green / Gold accent
          out[i] = Math.min(255, Math.floor(b * 0.15 + 15));
          out[i + 1] = Math.min(255, Math.floor(b * 0.62 + 20));
          out[i + 2] = Math.min(255, Math.floor(r * 0.15));
        }
      }
    }
  }

  return sharp(out, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  }).png().toBuffer();
}

async function extractSprite(pageIndex, rotateAngle = 0) {
  let pipeline = sharp(GIF_PATH, { page: pageIndex }).extract(CROP_BOX);
  
  if (rotateAngle !== 0) {
    pipeline = pipeline.rotate(rotateAngle, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }

  return pipeline
    .resize(TARGET_W, TARGET_H, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
}

async function processAll() {
  console.log('--- Processing Helen Runner GIF Assets ---');
  console.log(`Source: ${GIF_PATH}`);

  const daDir = 'public/assets/players/da';
  const ancDir = 'public/assets/players/anc';
  const paDir = 'public/assets/players/pa';

  fs.mkdirSync(daDir, { recursive: true });
  fs.mkdirSync(ancDir, { recursive: true });
  fs.mkdirSync(paDir, { recursive: true });

  // 1. Standing Idle & Talk Sprites from GIF
  console.log('Extracting standing idle and talk poses...');
  const idleBuf = await extractSprite(STAND_FRAME);
  const talkBuf = await extractSprite(TALK_FRAME);

  await sharp(idleBuf).toFile(path.join(daDir, 'da_idle.png'));
  await sharp(idleBuf).toFile(path.join(daDir, 'da_idle_2.png'));
  await sharp(talkBuf).toFile(path.join(daDir, 'da_talk.png'));
  await sharp(talkBuf).toFile(path.join(daDir, 'da_talk_point.png'));

  // Also create color variants for ANC & PA
  const ancIdle = await createColorVariant(idleBuf, 'anc');
  const paIdle = await createColorVariant(idleBuf, 'pa');
  await sharp(ancIdle).toFile(path.join(ancDir, 'anc_idle.png'));
  await sharp(ancIdle).toFile(path.join(ancDir, 'anc_idle_2.png'));
  await sharp(ancIdle).toFile(path.join(ancDir, 'anc_talk.png'));
  await sharp(paIdle).toFile(path.join(paDir, 'pa_idle.png'));
  await sharp(paIdle).toFile(path.join(paDir, 'pa_idle_2.png'));
  await sharp(paIdle).toFile(path.join(paDir, 'pa_talk.png'));

  // 2. Extract 31-Frame Seamless Running Loop
  console.log(`Extracting ${LOOP_COUNT} run frames (indices 0 to ${LOOP_COUNT - 1}) from frames ${LOOP_START}..${LOOP_START + LOOP_COUNT - 1}...`);
  for (let f = 0; f < LOOP_COUNT; f++) {
    const pageIndex = LOOP_START + f;
    const runBuf = await extractSprite(pageIndex);

    await sharp(runBuf).toFile(path.join(daDir, `da_run_${f}.png`));

    const ancRun = await createColorVariant(runBuf, 'anc');
    await sharp(ancRun).toFile(path.join(ancDir, `anc_run_${f}.png`));

    const paRun = await createColorVariant(runBuf, 'pa');
    await sharp(paRun).toFile(path.join(paDir, `pa_run_${f}.png`));

    if (f % 10 === 0 || f === LOOP_COUNT - 1) {
      console.log(`  Extracted run frame ${f} / ${LOOP_COUNT - 1}`);
    }
  }

  // 3. Jump and Hit Poses
  console.log('Extracting jump and hit poses...');
  const jumpBuf = await extractSprite(JUMP_FRAME);
  await sharp(jumpBuf).toFile(path.join(daDir, 'da_jump.png'));
  const ancJump = await createColorVariant(jumpBuf, 'anc');
  await sharp(ancJump).toFile(path.join(ancDir, 'anc_jump.png'));
  const paJump = await createColorVariant(jumpBuf, 'pa');
  await sharp(paJump).toFile(path.join(paDir, 'pa_jump.png'));

  const hitBuf = await extractSprite(LOOP_START, -8);
  await sharp(hitBuf).toFile(path.join(daDir, 'da_hit.png'));
  const ancHit = await createColorVariant(hitBuf, 'anc');
  await sharp(ancHit).toFile(path.join(ancDir, 'anc_hit.png'));
  const paHit = await createColorVariant(hitBuf, 'pa');
  await sharp(paHit).toFile(path.join(paDir, 'pa_hit.png'));

  // 4. Clean up any obsolete frames (> 30) from old 40-frame set
  for (let f = LOOP_COUNT; f < 50; f++) {
    const oldDa = path.join(daDir, `da_run_${f}.png`);
    const oldAnc = path.join(ancDir, `anc_run_${f}.png`);
    const oldPa = path.join(paDir, `pa_run_${f}.png`);
    if (fs.existsSync(oldDa)) fs.unlinkSync(oldDa);
    if (fs.existsSync(oldAnc)) fs.unlinkSync(oldAnc);
    if (fs.existsSync(oldPa)) fs.unlinkSync(oldPa);
  }

  console.log('✓ Helen character sprites and animations generated successfully!');
}

processAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
