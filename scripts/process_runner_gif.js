import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DA_GIF_PATH = 'E:/Downloads/Untitled design.gif';
const ANC_GIF_PATH = 'E:/Downloads/download (1).gif';

const DA_CROP_BOX = { left: 200, top: 120, width: 540, height: 790 };
const ANC_CROP_BOX = { left: 215, top: 150, width: 550, height: 785 };

const TARGET_W = 144;
const TARGET_H = 200;

// DA: 31 frames: 85 to 115
const DA_LOOP_START = 85;
const DA_LOOP_COUNT = 31;
const DA_JUMP_FRAME = 105;

// ANC (Cyril Ramaphosa): 26-frame loop (frames 65 to 91) expanded seamlessly to 31 frames
const ANC_LOOP_START = 65;
const ANC_CYCLE_LEN = 26;
const ANC_LOOP_COUNT = 31;
const ANC_JUMP_FRAME = 74;

const UPLOADED_DIR = 'C:/Users/Cheslin Gabriels/.gemini/antigravity-ide/brain/58a26776-398e-49c4-9d31-5b484e6f74e2/.user_uploaded/';
const CANDIDATE_FILES = {
  da: 'media_1788382972032.png',  // Helen Zille thumbs up (DA)
  anc: 'media_1788382962134.png', // Cyril Ramaphosa waving (ANC)
  pa: 'media_1788382876362.png'   // Gayton McKenzie pointing (PA)
};

async function processCandidatePortrait(partyKey, filename) {
  const srcPath = path.join(UPLOADED_DIR, filename);
  if (!fs.existsSync(srcPath)) {
    console.log(`Candidate file not found at ${srcPath}, keeping existing.`);
    return;
  }
  console.log(`Processing ${partyKey.toUpperCase()} candidate image: ${filename}`);

  const rawTrimmed = await sharp(srcPath).trim().toBuffer();
  const rawMeta = await sharp(rawTrimmed).metadata();

  let trimmed = rawTrimmed;
  let meta = rawMeta;
  if (partyKey === 'anc') {
    trimmed = await sharp(rawTrimmed)
      .extract({ left: 0, top: 0, width: rawMeta.width, height: Math.max(10, rawMeta.height - 14) })
      .toBuffer();
    meta = await sharp(trimmed).metadata();
  }

  const scaledH = 185;
  const scaledW = Math.min(140, Math.round((meta.width / meta.height) * scaledH));

  const resized = await sharp(trimmed)
    .resize(scaledW, scaledH, { fit: 'contain' })
    .toBuffer();

  const padTop = TARGET_H - scaledH - 5;
  const padLeft = Math.max(0, Math.floor((TARGET_W - scaledW) / 2));

  const finalPortrait = await sharp({
    create: {
      width: TARGET_W,
      height: TARGET_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized, top: padTop, left: padLeft }])
    .png()
    .toBuffer();

  const outDir = `public/assets/players/${partyKey}`;
  fs.mkdirSync(outDir, { recursive: true });

  await sharp(finalPortrait).toFile(path.join(outDir, `${partyKey}_idle.png`));
  await sharp(finalPortrait).toFile(path.join(outDir, `${partyKey}_idle_2.png`));
  await sharp(finalPortrait).toFile(path.join(outDir, `${partyKey}_talk.png`));
  await sharp(finalPortrait).toFile(path.join(outDir, `${partyKey}_talk_point.png`));
  console.log(`  Saved ${partyKey}_idle.png and ${partyKey}_talk.png`);
}

async function extractSprite(gifPath, cropBox, pageIndex, rotateAngle = 0) {
  let pipeline = sharp(gifPath, { page: pageIndex, limitInputPixels: false }).extract(cropBox);
  
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

async function createColorVariant(pngBuffer, party) {
  const { data, info } = await sharp(pngBuffer).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const a = out[i + 3];

    if (a > 30) {
      if (b > 110 && b > r + 35 && b > g - 20) {
        if (party === 'pa') {
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
      channels: info.channels
    }
  }).png().toBuffer();
}

async function processAll() {
  console.log('--- Processing All Assets with Authentic Candidates (DA & ANC) ---');

  const daDir = 'public/assets/players/da';
  const ancDir = 'public/assets/players/anc';
  const paDir = 'public/assets/players/pa';

  fs.mkdirSync(daDir, { recursive: true });
  fs.mkdirSync(ancDir, { recursive: true });
  fs.mkdirSync(paDir, { recursive: true });

  // 1. Candidate portraits
  for (const [party, file] of Object.entries(CANDIDATE_FILES)) {
    await processCandidatePortrait(party, file);
  }

  // 2. DA (Helen Zille) running cycle (31 frames)
  console.log(`Extracting DA running frames from ${DA_GIF_PATH}...`);
  for (let f = 0; f < DA_LOOP_COUNT; f++) {
    const pageIndex = DA_LOOP_START + f;
    const runBuf = await extractSprite(DA_GIF_PATH, DA_CROP_BOX, pageIndex);
    await sharp(runBuf).toFile(path.join(daDir, `da_run_${f}.png`));

    const paRun = await createColorVariant(runBuf, 'pa');
    await sharp(paRun).toFile(path.join(paDir, `pa_run_${f}.png`));
  }
  const daJump = await extractSprite(DA_GIF_PATH, DA_CROP_BOX, DA_JUMP_FRAME);
  await sharp(daJump).toFile(path.join(daDir, 'da_jump.png'));
  const daHit = await extractSprite(DA_GIF_PATH, DA_CROP_BOX, DA_LOOP_START, -8);
  await sharp(daHit).toFile(path.join(daDir, 'da_hit.png'));

  const paJump = await createColorVariant(daJump, 'pa');
  await sharp(paJump).toFile(path.join(paDir, 'pa_jump.png'));
  const paHit = await createColorVariant(daHit, 'pa');
  await sharp(paHit).toFile(path.join(paDir, 'pa_hit.png'));

  // 3. ANC (Cyril Ramaphosa) running cycle (31 frames from download (1).gif)
  console.log(`Extracting authentic Cyril Ramaphosa running frames from ${ANC_GIF_PATH}...`);
  for (let f = 0; f < ANC_LOOP_COUNT; f++) {
    const pageIndex = ANC_LOOP_START + (f % ANC_CYCLE_LEN);
    const runBuf = await extractSprite(ANC_GIF_PATH, ANC_CROP_BOX, pageIndex);
    await sharp(runBuf).toFile(path.join(ancDir, `anc_run_${f}.png`));
  }

  const ancJump = await extractSprite(ANC_GIF_PATH, ANC_CROP_BOX, ANC_JUMP_FRAME);
  await sharp(ancJump).toFile(path.join(ancDir, 'anc_jump.png'));

  const ancHit = await extractSprite(ANC_GIF_PATH, ANC_CROP_BOX, ANC_LOOP_START, -10);
  await sharp(ancHit).toFile(path.join(ancDir, 'anc_hit.png'));

  // 4. Clean up any obsolete frames (> 30)
  for (let f = 31; f < 50; f++) {
    const oldDa = path.join(daDir, `da_run_${f}.png`);
    const oldAnc = path.join(ancDir, `anc_run_${f}.png`);
    const oldPa = path.join(paDir, `pa_run_${f}.png`);
    if (fs.existsSync(oldDa)) fs.unlinkSync(oldDa);
    if (fs.existsSync(oldAnc)) fs.unlinkSync(oldAnc);
    if (fs.existsSync(oldPa)) fs.unlinkSync(oldPa);
  }

  console.log('✓ All authentic DA (Helen) and ANC (Cyril Ramaphosa) runner animations and actions ready!');
}

processAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
