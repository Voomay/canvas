import * as THREE from './three.module.js';

// Cache for geometries and materials to ensure optimal WebGL performance
const geoCache = new Map();
const matCache = new Map();

function getMat(color, roughness = 0.75, metalness = 0.05, extra = {}) {
  const key = `${color}_${roughness}_${metalness}_${JSON.stringify(extra)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      ...extra
    }));
  }
  return matCache.get(key);
}

function getBoxGeo(w, h, d) {
  const key = `box_${w}_${h}_${d}`;
  if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
  return geoCache.get(key);
}

function getSphereGeo(r, segW = 16, segH = 12) {
  const key = `sph_${r}_${segW}_${segH}`;
  if (!geoCache.has(key)) geoCache.set(key, new THREE.SphereGeometry(r, segW, segH));
  return geoCache.get(key);
}

function getCylGeo(rt, rb, h, seg = 14) {
  const key = `cyl_${rt}_${rb}_${h}_${seg}`;
  if (!geoCache.has(key)) geoCache.set(key, new THREE.CylinderGeometry(rt, rb, h, seg));
  return geoCache.get(key);
}

function createMesh(geo, mat, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}

// Canvas-rendered graphics
function createShirtLogoTexture(text = 'DA', bgColor = '#2462db', textColor = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = textColor;
  ctx.font = 'bold 58px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTaxiMarshalBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  // Fluorescent yellow safety background
  ctx.fillStyle = '#d4ea25';
  ctx.fillRect(0, 0, 256, 128);
  // Reflective stripe
  ctx.fillStyle = '#e2e6e8';
  ctx.fillRect(0, 8, 256, 18);
  ctx.fillRect(0, 102, 256, 18);
  // Text
  ctx.fillStyle = '#111315';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TAXI', 128, 48);
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.fillText('MARSHAL', 128, 82);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Stylized face generator (large warm anime/chibi eyes with reflections)
function addStylizedFace(headMesh, skinColor, hasBeard = false, hasGoatee = false, hasGlasses = false) {
  const eyeWhiteMat = getMat(0xf8fafc, 0.2);
  const eyeIrisMat = getMat(0x211710, 0.1);
  const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const browMat = getMat(0x1a1512, 0.9);

  // Left & Right Eyes
  for (const side of [-1, 1]) {
    // Sclera
    const eyeWhite = createMesh(getSphereGeo(0.065, 12, 10), eyeWhiteMat, headMesh, side * 0.095, 0.04, 0.245);
    eyeWhite.scale.set(0.9, 1.15, 0.45);

    // Iris / Pupil
    const iris = createMesh(getSphereGeo(0.042, 10, 8), eyeIrisMat, eyeWhite, 0, 0, 0.05);
    iris.scale.set(0.95, 1.05, 0.35);

    // Cute catchlight specular
    const highlight = createMesh(getSphereGeo(0.015, 6, 6), eyeHighlightMat, eyeWhite, side * 0.015, 0.02, 0.07);
    highlight.scale.set(1, 1, 0.2);

    // Eyebrow
    const brow = createMesh(getBoxGeo(0.075, 0.018, 0.02), browMat, headMesh, side * 0.095, 0.13, 0.26);
    brow.rotation.z = side * -0.12;

    // Cheerful blush
    const blushMat = getMat(0xc4695a, 0.9, 0, { transparent: true, opacity: 0.35 });
    const blush = createMesh(getSphereGeo(0.035, 8, 6), blushMat, headMesh, side * 0.155, -0.04, 0.21);
    blush.scale.set(1.2, 0.6, 0.3);
  }

  // Cute stylized button nose
  const noseMat = getMat(skinColor, 0.85);
  const nose = createMesh(getSphereGeo(0.032, 10, 8), noseMat, headMesh, 0, -0.015, 0.285);
  nose.scale.set(1, 0.8, 1);

  // Smiling mouth
  const lipMat = getMat(0x5a2d24, 0.8);
  const mouth = createMesh(getBoxGeo(0.08, 0.022, 0.02), lipMat, headMesh, 0, -0.09, 0.265);
  mouth.rotation.x = 0.1;

  // Ears
  for (const side of [-1, 1]) {
    const ear = createMesh(getSphereGeo(0.065, 10, 8), noseMat, headMesh, side * 0.28, 0.01, 0);
    ear.scale.set(0.45, 1, 0.7);
  }

  // Facial Hair
  if (hasGoatee || hasBeard) {
    const beardMat = getMat(0x1a1512, 0.95);
    // Chin goatee
    const goatee = createMesh(getBoxGeo(0.085, 0.08, 0.05), beardMat, headMesh, 0, -0.15, 0.22);
    goatee.rotation.x = -0.3;
    if (hasBeard) {
      // Mustache
      createMesh(getBoxGeo(0.12, 0.025, 0.03), beardMat, headMesh, 0, -0.06, 0.275);
      // Jawline stubble / trim
      for (const side of [-1, 1]) {
        const jaw = createMesh(getBoxGeo(0.09, 0.04, 0.16), beardMat, headMesh, side * 0.17, -0.12, 0.1);
        jaw.rotation.y = side * 0.3;
      }
    }
  }

  // Glasses (Elder)
  if (hasGlasses) {
    const frameMat = getMat(0x18181b, 0.2, 0.8);
    const glassMat = getMat(0xd8e8f0, 0.1, 0.2, { transparent: true, opacity: 0.45 });
    for (const side of [-1, 1]) {
      // Round rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 8, 20), frameMat);
      rim.position.set(side * 0.095, 0.04, 0.28);
      headMesh.add(rim);
      // Lens
      createMesh(getSphereGeo(0.062, 10, 8), glassMat, headMesh, side * 0.095, 0.04, 0.28).scale.set(1, 1, 0.05);
      // Arm to ear
      const arm = createMesh(getBoxGeo(0.008, 0.008, 0.28), frameMat, headMesh, side * 0.18, 0.05, 0.13);
      arm.rotation.y = side * 0.18;
    }
    // Bridge between eyes
    createMesh(getBoxGeo(0.06, 0.012, 0.012), frameMat, headMesh, 0, 0.06, 0.285);
  }
}

// Baseball cap generator (curved visor + button)
function addBaseballCap(headMesh, capColor, rotatedBack = false) {
  const capMat = getMat(capColor, 0.6);
  // Cap dome
  const capDome = createMesh(getSphereGeo(0.292, 16, 12), capMat, headMesh, 0, 0.1, -0.02);
  capDome.scale.set(1.02, 0.85, 1.05);

  // Visor / Brim
  const visor = createMesh(getBoxGeo(0.28, 0.022, 0.22), capMat, headMesh, 0, 0.07, rotatedBack ? -0.32 : 0.32);
  visor.rotation.x = rotatedBack ? 0.25 : -0.22;

  // Cap button on top
  createMesh(getSphereGeo(0.035, 8, 6), capMat, headMesh, 0, 0.32, -0.02);
}

// Archetype Metadata
export const CHARACTER_META = {
  canvasser: {
    id: 'canvasser',
    name: 'Player (Canvasser)',
    role: 'Campaigner / Community Activist',
    description: 'Energetic community canvasser wearing the royal blue DA party shirt, curved blue cap, classic denim jeans, and fresh white sneakers. On a mission to talk to every resident on the street.',
    skin: 0x8a583a,
    height: 1.68
  },
  resident_male: {
    id: 'resident_male',
    name: 'Resident 01',
    role: 'Male Township Resident',
    description: 'Cool local township guy in an olive baseball cap, fitted dark charcoal crewneck tee, relaxed blue denim jeans, and rugged brown leather work boots with a trim goatee.',
    skin: 0x915c3c,
    height: 1.70
  },
  resident_female: {
    id: 'resident_female',
    name: 'Resident 02',
    role: 'Female Resident',
    description: 'Fashionable township resident rocking a sculpted braided topknot bun, statement gold hoop earrings, a black sleeveless crop top showing midriff, high-waisted skinny jeans, and black skate kicks.',
    skin: 0x7a4a30,
    height: 1.67
  },
  resident_elder: {
    id: 'resident_elder',
    name: 'Resident 03',
    role: 'Older Resident (Elder)',
    description: 'Beloved community elder in a vibrant sunflower-yellow hoodie with front kangaroo pocket, curly silver/grey afro hair, stylish round wireframe reading glasses, and athletic charcoal track pants with white side stripes.',
    skin: 0x8c5b3d,
    height: 1.62
  },
  taxi_guard: {
    id: 'taxi_guard',
    name: 'Taxi Guard',
    role: 'Street Marshal',
    description: 'Authoritative local street marshal keeping order along the taxi ranks. Wears a high-visibility fluorescent yellow/orange safety vest boldly emblazoned with "TAXI MARSHAL" on the back, tactical pants, black cap, and heavy combat boots.',
    skin: 0x73482f,
    height: 1.72
  },
  school_youth: {
    id: 'school_youth',
    name: 'School Youth',
    role: 'Young Pedestrian / Student',
    description: 'Local student wearing the iconic South African school uniform: sky-blue collared shirt with navy school tie, charcoal pleated school shorts, high dark socks, polished black school shoes, and a double-strap black backpack.',
    skin: 0x8a593c,
    height: 1.48
  },
  street_vendor: {
    id: 'street_vendor',
    name: 'Street Vendor',
    role: 'Local Worker / Spaza Merchant',
    description: 'Warm, hardworking township vendor selling fresh fruit and vetkoek. Wears a khaki wide-brim sun hat, emerald green t-shirt, royal blue waist apron tied securely at the back with front pockets, and sturdy sneakers.',
    skin: 0x855436,
    height: 1.60
  },
  resident_community: {
    id: 'resident_community',
    name: 'Resident 04',
    role: 'Community Resident',
    description: 'Streetwise neighbourhood local sporting a bright red rolled fisherman beanie, oversized clean white tee, crossbody shoulder sling bag, olive military cargo trousers with side flap pockets, and crisp white sneakers.',
    skin: 0x845236,
    height: 1.69
  }
};

export const CHARACTER_KEYS = Object.keys(CHARACTER_META);

// Main Factory Function to Build Any 3D Character
export function createCharacter(archetype = 'canvasser', options = {}) {
  const meta = CHARACTER_META[archetype] || CHARACTER_META.canvasser;
  const skinColor = options.skin || meta.skin;
  const partyColor = options.partyColor || 0x2462db;
  const partyName = options.partyName || 'DA';

  const group = new THREE.Group();
  group.name = `character_${archetype}`;

  // Scale adjustment for youth/elders
  const scale = meta.height / 1.68;
  group.scale.setScalar(scale);

  // Materials
  const skinMat = getMat(skinColor, 0.85);

  // Root Pelvis / Hip Pivot
  const hips = new THREE.Group();
  hips.position.y = 0.78;
  group.add(hips);

  // Legs & Feet (Left and Right)
  const legs = [];
  for (const side of [-1, 1]) {
    const legPivot = new THREE.Group();
    legPivot.position.set(side * 0.145, 0, 0);
    hips.add(legPivot);

    let pantsMat, shoeMat, sockMat = null;

    if (archetype === 'school_youth') {
      // Charcoal shorts + bare knee + tall socks + black shoes
      pantsMat = getMat(0x353b42, 0.8);
      createMesh(getCylGeo(0.12, 0.11, 0.28), pantsMat, legPivot, 0, -0.14, 0);
      // Skin knee
      createMesh(getCylGeo(0.09, 0.085, 0.14), skinMat, legPivot, 0, -0.32, 0);
      // Tall school socks
      sockMat = getMat(0x282c30, 0.8);
      createMesh(getCylGeo(0.088, 0.082, 0.22), sockMat, legPivot, 0, -0.48, 0);
      // Black school shoes
      shoeMat = getMat(0x121315, 0.35, 0.4);
      const shoe = createMesh(getBoxGeo(0.16, 0.12, 0.28), shoeMat, legPivot, 0, -0.62, 0.05);
      shoe.scale.set(0.9, 0.8, 1.1);
    } else if (archetype === 'resident_female') {
      // Skinny jeans + black skate sneakers with white sole
      pantsMat = getMat(0x3b669b, 0.7);
      createMesh(getCylGeo(0.13, 0.085, 0.58), pantsMat, legPivot, 0, -0.28, 0);
      // Sneaker body
      shoeMat = getMat(0x18181a, 0.6);
      const shoe = createMesh(getBoxGeo(0.15, 0.11, 0.27), shoeMat, legPivot, 0, -0.61, 0.05);
      // White rubber sole
      const soleMat = getMat(0xf4f6f8, 0.4);
      createMesh(getBoxGeo(0.16, 0.035, 0.29), soleMat, shoe, 0, -0.045, 0);
    } else if (archetype === 'resident_elder') {
      // Charcoal track pants with white athletic side stripe
      pantsMat = getMat(0x2b2d30, 0.85);
      createMesh(getCylGeo(0.125, 0.095, 0.58), pantsMat, legPivot, 0, -0.28, 0);
      // White side athletic stripe
      const stripeMat = getMat(0xffffff, 0.5);
      createMesh(getBoxGeo(0.02, 0.56, 0.04), stripeMat, legPivot, side * 0.115, -0.28, 0);
      // White running shoes
      shoeMat = getMat(0xf0f3f6, 0.5);
      createMesh(getBoxGeo(0.16, 0.12, 0.29), shoeMat, legPivot, 0, -0.61, 0.05);
    } else if (archetype === 'taxi_guard') {
      // Dark tactical cargo pants with knee seam + black heavy boots
      pantsMat = getMat(0x282c30, 0.85);
      createMesh(getCylGeo(0.13, 0.105, 0.56), pantsMat, legPivot, 0, -0.27, 0);
      // Cargo pocket on outer thigh
      createMesh(getBoxGeo(0.045, 0.15, 0.12), pantsMat, legPivot, side * 0.125, -0.22, 0);
      // Black service boots with thick sole
      shoeMat = getMat(0x151618, 0.5, 0.2);
      createMesh(getBoxGeo(0.17, 0.16, 0.31), shoeMat, legPivot, 0, -0.59, 0.06);
    } else if (archetype === 'resident_community') {
      // Olive green cargo trousers with flap pockets + clean white sneakers
      pantsMat = getMat(0x4d5f3f, 0.8);
      createMesh(getCylGeo(0.135, 0.105, 0.58), pantsMat, legPivot, 0, -0.28, 0);
      // Flap pocket
      createMesh(getBoxGeo(0.05, 0.14, 0.13), pantsMat, legPivot, side * 0.13, -0.24, 0);
      // White court kicks
      shoeMat = getMat(0xffffff, 0.4);
      createMesh(getBoxGeo(0.16, 0.12, 0.29), shoeMat, legPivot, 0, -0.61, 0.05);
    } else if (archetype === 'resident_male') {
      // Medium blue denim + brown leather boots
      pantsMat = getMat(0x355a88, 0.75);
      createMesh(getCylGeo(0.13, 0.10, 0.58), pantsMat, legPivot, 0, -0.28, 0);
      // Brown leather ankle boots
      shoeMat = getMat(0x5c3c25, 0.6, 0.1);
      const boot = createMesh(getBoxGeo(0.16, 0.14, 0.29), shoeMat, legPivot, 0, -0.60, 0.05);
      createMesh(getBoxGeo(0.17, 0.035, 0.30), getMat(0x221711, 0.9), boot, 0, -0.06, 0);
    } else if (archetype === 'street_vendor') {
      // Dark cropped trousers + comfortable work sneakers
      pantsMat = getMat(0x2e353c, 0.85);
      createMesh(getCylGeo(0.135, 0.10, 0.56), pantsMat, legPivot, 0, -0.27, 0);
      shoeMat = getMat(0x222428, 0.6);
      createMesh(getBoxGeo(0.16, 0.12, 0.28), shoeMat, legPivot, 0, -0.60, 0.05);
    } else {
      // Canvasser: Regular blue jeans + crisp white sneakers
      pantsMat = getMat(0x2e527d, 0.75);
      createMesh(getCylGeo(0.13, 0.10, 0.58), pantsMat, legPivot, 0, -0.28, 0);
      shoeMat = getMat(0xf0f3f6, 0.4);
      const sneaker = createMesh(getBoxGeo(0.16, 0.12, 0.29), shoeMat, legPivot, 0, -0.61, 0.05);
      // Sneaker toe cap
      createMesh(getSphereGeo(0.08, 8, 6), shoeMat, sneaker, 0, -0.02, 0.1).scale.set(0.95, 0.6, 0.8);
    }

    legs.push(legPivot);
  }

  // Torso / Spine
  const spine = new THREE.Group();
  spine.position.y = 0.25;
  hips.add(spine);

  let shirtColor = 0x2462db;
  if (archetype === 'canvasser') shirtColor = partyColor;
  else if (archetype === 'resident_male') shirtColor = 0x2c2d30;
  else if (archetype === 'resident_female') shirtColor = 0x18181b;
  else if (archetype === 'resident_elder') shirtColor = 0xf4c228;
  else if (archetype === 'taxi_guard') shirtColor = 0x1f2122;
  else if (archetype === 'school_youth') shirtColor = 0x6faae2;
  else if (archetype === 'street_vendor') shirtColor = 0x478c43;
  else if (archetype === 'resident_community') shirtColor = 0xf6f6f6;

  const shirtMat = getMat(shirtColor, 0.7);

  // Torso Mesh
  let torsoMesh;
  if (archetype === 'resident_female') {
    // Crop top: black upper chest, skin midriff
    torsoMesh = createMesh(getBoxGeo(0.44, 0.22, 0.26), shirtMat, spine, 0, 0.14, 0);
    // Exposed midriff
    createMesh(getBoxGeo(0.40, 0.14, 0.24), skinMat, spine, 0, -0.04, 0);
  } else if (archetype === 'resident_elder') {
    // Hoodie with front kangaroo pocket
    torsoMesh = createMesh(getBoxGeo(0.48, 0.40, 0.28), shirtMat, spine, 0, 0.05, 0);
    // Kangaroo pocket
    const pocketMat = getMat(0xe5b21e, 0.75);
    createMesh(getBoxGeo(0.30, 0.16, 0.04), pocketMat, torsoMesh, 0, -0.08, 0.15);
    // Hood collar at back of neck
    const hoodCollar = createMesh(getSphereGeo(0.20, 10, 8), pocketMat, torsoMesh, 0, 0.18, -0.10);
    hoodCollar.scale.set(1.2, 0.8, 0.6);
  } else if (archetype === 'taxi_guard') {
    // Undershirt + Fluorescent Safety Vest
    torsoMesh = createMesh(getBoxGeo(0.48, 0.38, 0.28), shirtMat, spine, 0, 0.05, 0);
    // Safety vest overlay
    const vestYellowMat = getMat(0xd4ea25, 0.5);
    const vestOrangeMat = getMat(0xf4651e, 0.5);
    const reflectiveMat = getMat(0xe4e8ea, 0.2, 0.3);

    // Front Vest Left & Right
    for (const side of [-1, 1]) {
      const vestSide = createMesh(getBoxGeo(0.20, 0.38, 0.04), vestYellowMat, torsoMesh, side * 0.12, 0, 0.145);
      // Orange shoulder & bottom panels
      createMesh(getBoxGeo(0.20, 0.08, 0.042), vestOrangeMat, vestSide, 0, 0.14, 0);
      createMesh(getBoxGeo(0.20, 0.08, 0.042), vestOrangeMat, vestSide, 0, -0.14, 0);
      // Silver reflective stripe
      createMesh(getBoxGeo(0.20, 0.04, 0.044), reflectiveMat, vestSide, 0, 0.02, 0);
    }

    // Back Vest with "TAXI MARSHAL" Text Texture
    const taxiBackMat = new THREE.MeshBasicMaterial({
      map: createTaxiMarshalBackTexture(),
      side: THREE.DoubleSide
    });
    const backSign = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.36), taxiBackMat);
    backSign.position.set(0, 0.05, -0.145);
    backSign.rotation.y = Math.PI;
    torsoMesh.add(backSign);
  } else if (archetype === 'street_vendor') {
    // Green tee + Blue apron with utility pocket and tie strings
    torsoMesh = createMesh(getBoxGeo(0.50, 0.40, 0.30), shirtMat, spine, 0, 0.05, 0);
    const apronMat = getMat(0x2164ce, 0.7);
    // Apron bib on chest
    createMesh(getBoxGeo(0.38, 0.32, 0.04), apronMat, torsoMesh, 0, 0.02, 0.155);
    // Apron skirt over hips
    createMesh(getBoxGeo(0.46, 0.24, 0.04), apronMat, spine, 0, -0.16, 0.155);
    // Apron tie string around back
    createMesh(getCylGeo(0.015, 0.015, 0.46), apronMat, spine, 0, -0.10, -0.155).rotation.z = Math.PI / 2;
    // Tie knot at back
    createMesh(getSphereGeo(0.035, 6, 6), apronMat, spine, 0, -0.10, -0.165);
  } else if (archetype === 'school_youth') {
    // Collared school shirt + navy necktie
    torsoMesh = createMesh(getBoxGeo(0.44, 0.36, 0.26), shirtMat, spine, 0, 0.04, 0);
    // Collar flaps
    const collarMat = getMat(0x629cd0, 0.7);
    for (const side of [-1, 1]) {
      const flap = createMesh(getBoxGeo(0.12, 0.06, 0.03), collarMat, torsoMesh, side * 0.08, 0.18, 0.14);
      flap.rotation.z = side * -0.3;
    }
    // Navy school tie
    const tieMat = getMat(0x192338, 0.8);
    const tie = createMesh(getBoxGeo(0.06, 0.24, 0.025), tieMat, torsoMesh, 0, 0.04, 0.15);
    tie.rotation.x = -0.05;

    // School Backpack (on back)
    const bagMat = getMat(0x1a1e24, 0.85);
    const backpack = createMesh(getBoxGeo(0.34, 0.36, 0.16), bagMat, spine, 0, 0.06, -0.22);
    // Backpack front pouch
    createMesh(getBoxGeo(0.28, 0.18, 0.06), bagMat, backpack, 0, -0.08, -0.09);
    // Shoulder straps over shoulders
    for (const side of [-1, 1]) {
      const strap = createMesh(getBoxGeo(0.05, 0.40, 0.02), bagMat, spine, side * 0.12, 0.06, 0.135);
    }
  } else if (archetype === 'resident_community') {
    // White oversized tee + Crossbody shoulder sling bag
    torsoMesh = createMesh(getBoxGeo(0.48, 0.40, 0.28), shirtMat, spine, 0, 0.05, 0);
    // Crossbody bag body (worn over chest/back)
    const bagMat = getMat(0x1d1e21, 0.8);
    const slingBag = createMesh(getBoxGeo(0.24, 0.14, 0.09), bagMat, torsoMesh, -0.06, 0.04, 0.16);
    slingBag.rotation.z = -0.35;
    // Diagonal strap across chest and back
    const strapMat = getMat(0x18191c, 0.9);
    const chestStrap = createMesh(getBoxGeo(0.045, 0.52, 0.015), strapMat, torsoMesh, 0, 0.05, 0.15);
    chestStrap.rotation.z = -0.65;
    const backStrap = createMesh(getBoxGeo(0.045, 0.52, 0.015), strapMat, torsoMesh, 0, 0.05, -0.15);
    backStrap.rotation.z = 0.65;
  } else {
    // Canvasser / Standard: Shirt with Party Branding
    torsoMesh = createMesh(getBoxGeo(0.46, 0.38, 0.26), shirtMat, spine, 0, 0.05, 0);
    // Front & Back "DA" / Party Logo
    const logoTexture = createShirtLogoTexture(partyName, '#' + partyColor.toString(16).padStart(6, '0'));
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });

    const frontSign = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.24), logoMat);
    frontSign.position.set(0, 0.06, 0.132);
    torsoMesh.add(frontSign);

    const backSign = frontSign.clone();
    backSign.position.z = -0.132;
    backSign.rotation.y = Math.PI;
    torsoMesh.add(backSign);
  }

  // Arms (Left & Right)
  const arms = [];
  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.30, 0.20, 0);
    spine.add(armPivot);

    // Sleeve
    let sleeveColor = shirtColor;
    if (archetype === 'resident_female') sleeveColor = skinColor; // sleeveless crop top!
    const sleeveMat = getMat(sleeveColor, 0.7);
    const sleeve = createMesh(getCylGeo(0.10, 0.09, 0.20), sleeveMat, armPivot, 0, -0.08, 0);

    // Forearm & Hand
    const forearm = createMesh(getCylGeo(0.075, 0.065, 0.26), skinMat, armPivot, 0, -0.28, 0);
    // Hand
    const hand = createMesh(getSphereGeo(0.075, 10, 8), skinMat, armPivot, 0, -0.42, 0);
    hand.scale.set(0.9, 1.1, 0.8);

    arms.push(armPivot);
  }

  // Neck & Head
  const neck = createMesh(getCylGeo(0.10, 0.11, 0.14), skinMat, spine, 0, 0.28, 0);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.44, 0);
  spine.add(headGroup);

  const headMesh = createMesh(getSphereGeo(0.285, 18, 14), skinMat, headGroup, 0, 0, 0);
  headMesh.scale.set(1.0, 1.08, 1.02);

  // Add Face Features
  const isMaleResident = archetype === 'resident_male';
  const isTaxiGuard = archetype === 'taxi_guard';
  const isResident04 = archetype === 'resident_community';
  const isElder = archetype === 'resident_elder';

  addStylizedFace(
    headMesh,
    skinColor,
    isTaxiGuard || isResident04, // Beard
    isMaleResident,              // Goatee
    isElder                      // Glasses
  );

  // Hair & Headwear Specifics
  if (archetype === 'canvasser') {
    // Blue baseball cap + sideburns
    addBaseballCap(headMesh, 0x2462db);
    createMesh(getBoxGeo(0.04, 0.08, 0.03), getMat(0x191411, 0.9), headMesh, -0.26, -0.04, 0.05);
    createMesh(getBoxGeo(0.04, 0.08, 0.03), getMat(0x191411, 0.9), headMesh, 0.26, -0.04, 0.05);
  } else if (archetype === 'resident_male') {
    // Olive baseball cap
    addBaseballCap(headMesh, 0x5b6b48);
  } else if (archetype === 'resident_female') {
    // High Braided Afro-Puff Bun + Gold Hoop Earrings
    const hairMat = getMat(0x181412, 0.95);
    // Crown base hair
    createMesh(getSphereGeo(0.288, 16, 12), hairMat, headMesh, 0, 0.12, -0.04).scale.set(1.02, 0.7, 1.04);
    // Braided topknot bun / puff
    const bun = createMesh(getSphereGeo(0.18, 14, 12), hairMat, headMesh, 0, 0.38, -0.02);
    bun.scale.set(1.1, 1.25, 1.05);
    // Textured bun ridges
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      createMesh(getSphereGeo(0.065, 8, 6), hairMat, bun, Math.cos(angle) * 0.12, 0, Math.sin(angle) * 0.12);
    }
    // Gold Hoop Earrings
    const goldMat = getMat(0xe8b838, 0.2, 0.9);
    for (const side of [-1, 1]) {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20), goldMat);
      hoop.position.set(side * 0.28, -0.06, 0);
      hoop.rotation.y = Math.PI / 2;
      headMesh.add(hoop);
    }
  } else if (archetype === 'resident_elder') {
    // Curly Silver/Grey Afro Hair
    const silverMat = getMat(0xa5a29c, 0.9);
    const hairDome = createMesh(getSphereGeo(0.30, 16, 12), silverMat, headMesh, 0, 0.10, -0.03);
    hairDome.scale.set(1.08, 0.85, 1.1);
    // Curly afro puffs
    for (let i = 0; i < 14; i++) {
      const u = (i / 14) * Math.PI * 2;
      createMesh(getSphereGeo(0.08, 8, 6), silverMat, hairDome, Math.sin(u) * 0.24, 0.1 + (i % 3) * 0.05, Math.cos(u) * 0.24);
    }
  } else if (archetype === 'taxi_guard') {
    // Black Cap
    addBaseballCap(headMesh, 0x1f2122);
  } else if (archetype === 'school_youth') {
    // Neat short cropped hair
    const hairMat = getMat(0x181512, 0.9);
    const hair = createMesh(getSphereGeo(0.292, 16, 12), hairMat, headMesh, 0, 0.12, -0.03);
    hair.scale.set(1.02, 0.75, 1.05);
  } else if (archetype === 'street_vendor') {
    // Wide-Brim Khaki Sun Hat
    const hatMat = getMat(0xb8a98c, 0.75);
    // Crown dome
    createMesh(getSphereGeo(0.295, 16, 12), hatMat, headMesh, 0, 0.14, -0.02).scale.set(1.04, 0.8, 1.05);
    // Wide floppy brim
    const brim = createMesh(getCylGeo(0.48, 0.52, 0.035, 20), hatMat, headMesh, 0, 0.08, 0);
    brim.rotation.x = -0.08;
    // Hair tuck visible at back
    createMesh(getSphereGeo(0.14, 10, 8), getMat(0x181412, 0.95), headMesh, 0, -0.10, -0.22);
  } else if (archetype === 'resident_community') {
    // Bright Red Rolled Fisherman Beanie
    const beanieMat = getMat(0xba2828, 0.8);
    // Beanie Dome
    createMesh(getSphereGeo(0.296, 16, 12), beanieMat, headMesh, 0, 0.16, -0.02).scale.set(1.02, 0.85, 1.04);
    // Rolled cuff rim
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 10, 24), beanieMat);
    cuff.position.set(0, 0.14, -0.02);
    cuff.rotation.x = Math.PI / 2 + 0.15;
    headMesh.add(cuff);
  }

  // Animation controller hooks
  const character = {
    group,
    hips,
    spine,
    head: headGroup,
    legs,
    arms,
    archetype,
    meta,
    scale,
    animTime: 0
  };

  return character;
}

// Built-in Character Animation Engine (Runs in 3D Viewer & In-Game)
export function animateCharacter(char, animName = 'idle', dt = 0.016, speed = 1.0) {
  if (!char) return;
  char.animTime += dt * speed;
  const t = char.animTime;

  const [leftLeg, rightLeg] = char.legs;
  const [leftArm, rightArm] = char.arms;
  const { hips, spine, head } = char;

  if (animName === 'idle') {
    // Subtle breathing + gentle sway
    const breath = Math.sin(t * 2.5);
    spine.scale.y = 1 + breath * 0.015;
    spine.rotation.z = Math.sin(t * 1.2) * 0.02;
    head.rotation.y = Math.sin(t * 0.8) * 0.08;
    head.rotation.x = breath * 0.02;

    leftArm.rotation.x = Math.sin(t * 1.5) * 0.06;
    rightArm.rotation.x = -Math.sin(t * 1.5) * 0.06;
    leftArm.rotation.z = 0.12;
    rightArm.rotation.z = -0.12;

    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
    hips.position.y = 0.78;
  } else if (animName === 'walk') {
    // Natural walking stride
    const stepFreq = 5.2;
    const stride = Math.sin(t * stepFreq);

    leftLeg.rotation.x = stride * 0.55;
    rightLeg.rotation.x = -stride * 0.55;

    leftArm.rotation.x = -stride * 0.45;
    rightArm.rotation.x = stride * 0.45;
    leftArm.rotation.z = 0.14;
    rightArm.rotation.z = -0.14;

    // Hip bob
    hips.position.y = 0.78 + Math.abs(Math.cos(t * stepFreq)) * 0.045;
    spine.rotation.y = -stride * 0.08;
    spine.rotation.x = 0.05; // slight forward lean
    head.rotation.y = stride * 0.04;
  } else if (animName === 'run') {
    // Energetic running
    const runFreq = 8.5;
    const stride = Math.sin(t * runFreq);

    leftLeg.rotation.x = stride * 0.85;
    rightLeg.rotation.x = -stride * 0.85;

    leftArm.rotation.x = -stride * 0.75;
    rightArm.rotation.x = stride * 0.75;
    leftArm.rotation.z = 0.22;
    rightArm.rotation.z = -0.22;

    // Stronger forward lean and bounce
    spine.rotation.x = 0.20;
    hips.position.y = 0.78 + Math.abs(Math.cos(t * runFreq)) * 0.085;
    head.rotation.x = -0.10;
  } else if (animName === 'wave') {
    // Right arm waving enthusiastically
    const wave = Math.sin(t * 7.5);
    rightArm.rotation.z = -2.1;
    rightArm.rotation.x = wave * 0.35;
    rightArm.rotation.y = 0.2;

    leftArm.rotation.z = 0.18;
    leftArm.rotation.x = Math.sin(t * 2) * 0.1;

    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
    hips.position.y = 0.78 + Math.sin(t * 4) * 0.02;
    head.rotation.y = 0.15 + Math.sin(t * 3.5) * 0.1;
    head.rotation.z = -0.08;
    spine.rotation.z = 0.05;
  } else if (animName === 'talk') {
    // Expressive conversational gestures
    const g1 = Math.sin(t * 3.2);
    const g2 = Math.sin(t * 4.1 + 1.2);

    rightArm.rotation.x = -0.6 + g1 * 0.25;
    rightArm.rotation.z = -0.3 + g2 * 0.15;
    leftArm.rotation.x = -0.4 - g2 * 0.2;
    leftArm.rotation.z = 0.25;

    head.rotation.x = Math.sin(t * 5.0) * 0.08; // nodding
    head.rotation.y = Math.sin(t * 2.2) * 0.12;
    spine.rotation.y = Math.sin(t * 2.0) * 0.05;
    hips.position.y = 0.78;
  }
}
