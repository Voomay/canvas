import Phaser from 'phaser';

/**
 * Procedural Texture Generator
 * Draws high-quality stylized placeholder graphics matching the South African suburban aesthetic.
 * All textures are registered in Phaser's TextureManager and can be swapped seamlessly with PNGs.
 */
export class PlaceholderGenerator {
  public static generateAll(scene: Phaser.Scene) {
    this.createSkyTexture(scene);
    this.createCloudsTexture(scene);
    this.createHousesTexture(scene);
    this.createStreetlightTexture(scene);
    this.createRoadTexture(scene);
    this.createPlayerTextures(scene);
    this.createResidentTextures(scene);
    this.createObstacleTextures(scene);
    this.createUITextures(scene);
  }

  private static createSkyTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('bg_sky')) return;
    const canvas = scene.textures.createCanvas('bg_sky', 1280, 720);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Identical vibrant South African clear sky blue matching Cape Town & Joburg artwork (#007dfb / #0183fb)
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, '#007dfb');
    grad.addColorStop(0.5, '#0080fb');
    grad.addColorStop(1, '#0183fb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    canvas.refresh();
  }

  private static createCloudsTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('bg_clouds')) return;
    const canvas = scene.textures.createCanvas('bg_clouds', 1280, 200);
    if (!canvas) return;
    const ctx = canvas.getContext();

    const drawCloud = (cx: number, cy: number, scale: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 25 * scale, cy - 10 * scale, 34 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 60 * scale, cy - 6 * scale, 28 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 85 * scale, cy + 5 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Flat base
      ctx.fillRect(cx - 20 * scale, cy + 4 * scale, 110 * scale, 18 * scale);
    };

    drawCloud(120, 60, 1.1);
    drawCloud(450, 90, 0.9);
    drawCloud(780, 50, 1.2);
    drawCloud(1100, 80, 0.85);

    canvas.refresh();
  }

  private static createHousesTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('bg_houses')) return;
    const width = 1600;
    const height = 340;
    const canvas = scene.textures.createCanvas('bg_houses', width, height);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // House definitions (South African suburban pastel/vibrant colors)
    const houses = [
      { x: 20, w: 280, h: 220, wallColor: '#e05d7b', roofColor: '#363d47', num: '3', doorColor: '#5c321d' },
      { x: 330, w: 260, h: 210, wallColor: '#e5a32b', roofColor: '#5a3d31', num: '7', doorColor: '#204732' },
      { x: 620, w: 300, h: 230, wallColor: '#2fa3a0', roofColor: '#2b303a', num: '9', doorColor: '#5c321d' },
      { x: 950, w: 270, h: 215, wallColor: '#8a4ca8', roofColor: '#423b47', num: '11', doorColor: '#3d2b1f' },
      { x: 1250, w: 310, h: 225, wallColor: '#6e963b', roofColor: '#383e42', num: '13', doorColor: '#5c321d' }
    ];

    // Background trees & shrubs behind fences
    const drawTree = (tx: number, ty: number, tr: number) => {
      ctx.fillStyle = '#2d5e23';
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.arc(tx + 20, ty - 15, tr * 0.9, 0, Math.PI * 2);
      ctx.arc(tx - 20, ty - 10, tr * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3c7a30';
      ctx.beginPath();
      ctx.arc(tx + 5, ty - 5, tr * 0.7, 0, Math.PI * 2);
      ctx.fill();
    };

    // Trees between houses
    drawTree(310, 160, 45);
    drawTree(600, 150, 50);
    drawTree(930, 165, 42);
    drawTree(1230, 155, 48);

    houses.forEach(h => {
      const baseY = height - 40;
      const topY = baseY - h.h;

      // House main wall
      ctx.fillStyle = h.wallColor;
      ctx.fillRect(h.x, topY, h.w, h.h);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      ctx.strokeRect(h.x, topY, h.w, h.h);

      // Pitched roof
      ctx.fillStyle = h.roofColor;
      ctx.beginPath();
      ctx.moveTo(h.x - 15, topY);
      ctx.lineTo(h.x + h.w / 2, topY - 55);
      ctx.lineTo(h.x + h.w + 15, topY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Roof tiles details
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      for (let r = 0; r < 4; r++) {
        ctx.beginPath();
        const ry = topY - 10 - r * 11;
        const offset = (4 - r) * 15;
        ctx.moveTo(h.x - 10 + offset, ry);
        ctx.lineTo(h.x + h.w + 10 - offset, ry);
        ctx.stroke();
      }

      // Wooden Front Door
      const doorW = 46;
      const doorH = 85;
      const doorX = h.x + 35;
      const doorY = baseY - doorH;
      ctx.fillStyle = h.doorColor;
      ctx.fillRect(doorX, doorY, doorW, doorH);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(doorX, doorY, doorW, doorH);

      // Door panels
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeRect(doorX + 6, doorY + 8, doorW - 12, 30);
      ctx.strokeRect(doorX + 6, doorY + 45, doorW - 12, 32);

      // Door handle
      ctx.fillStyle = '#fcb813';
      ctx.beginPath();
      ctx.arc(doorX + doorW - 8, doorY + doorH / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // House Number plaque
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(doorX - 22, doorY + 12, 16, 16);
      ctx.strokeStyle = '#222';
      ctx.strokeRect(doorX - 22, doorY + 12, 16, 16);
      ctx.fillStyle = '#111';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(h.num, doorX - 14, doorY + 24);

      // Windows
      const winW = 60;
      const winH = 55;
      const winX = h.x + h.w - 85;
      const winY = baseY - 130;

      // Window frame
      ctx.fillStyle = '#bce2f5';
      ctx.fillRect(winX, winY, winW, winH);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      ctx.strokeRect(winX, winY, winW, winH);

      // Curtains
      ctx.fillStyle = '#643275';
      ctx.beginPath();
      ctx.moveTo(winX, winY);
      ctx.lineTo(winX + 15, winY);
      ctx.lineTo(winX + 10, winY + winH);
      ctx.lineTo(winX, winY + winH);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(winX + winW, winY);
      ctx.lineTo(winX + winW - 15, winY);
      ctx.lineTo(winX + winW - 10, winY + winH);
      ctx.lineTo(winX + winW, winY + winH);
      ctx.closePath();
      ctx.fill();

      // Window cross grid
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winY);
      ctx.lineTo(winX + winW / 2, winY + winH);
      ctx.moveTo(winX, winY + winH / 2);
      ctx.lineTo(winX + winW, winY + winH / 2);
      ctx.stroke();

      // Low boundary wall / palisade fence in front
      const fenceH = 45;
      const fenceY = baseY - fenceH;
      ctx.fillStyle = '#dcd7cd';
      ctx.fillRect(h.x - 10, fenceY, h.w + 20, fenceH);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(h.x - 10, fenceY, h.w + 20, fenceH);

      // Fence pillars
      for (let p = 0; p <= h.w + 20; p += 70) {
        ctx.fillStyle = '#bcb5a7';
        ctx.fillRect(h.x - 12 + p, fenceY - 8, 14, fenceH + 8);
        ctx.strokeRect(h.x - 12 + p, fenceY - 8, 14, fenceH + 8);
      }
    });

    canvas.refresh();
  }

  private static createStreetlightTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('obj_streetlight')) return;
    const canvas = scene.textures.createCanvas('obj_streetlight', 70, 240);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Curved silver streetlight pole
    ctx.strokeStyle = '#5a6e85';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(35, 240);
    ctx.lineTo(35, 45);
    // Arc to the right
    ctx.arcTo(35, 10, 60, 10, 25);
    ctx.lineTo(65, 10);
    ctx.stroke();

    // Lamp head casing
    ctx.fillStyle = '#3a4a5e';
    ctx.fillRect(45, 8, 22, 12);
    ctx.strokeStyle = '#1b2636';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(45, 8, 22, 12);

    // Glowing bulb / diffuser
    ctx.fillStyle = '#fff8b8';
    ctx.fillRect(47, 18, 18, 6);

    // Pole base mount
    ctx.fillStyle = '#2e3a47';
    ctx.fillRect(27, 225, 16, 15);

    canvas.refresh();
  }

  private static createRoadTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('bg_road')) return;
    const width = 1280;
    const height = 260; // pavement + road
    const canvas = scene.textures.createCanvas('bg_road', width, height);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Pavement (sidewalk) top part
    const pavementHeight = 65;
    ctx.fillStyle = '#c7c2b5';
    ctx.fillRect(0, 0, width, pavementHeight);

    // Pavement tile lines
    ctx.strokeStyle = '#b0aba0';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, pavementHeight);
      ctx.stroke();
    }

    // Grass tufts / weeds along the kerb
    ctx.fillStyle = '#4e8536';
    for (let x = 15; x < width; x += 75) {
      ctx.beginPath();
      ctx.moveTo(x, pavementHeight);
      ctx.lineTo(x - 5, pavementHeight - 8);
      ctx.lineTo(x, pavementHeight - 12);
      ctx.lineTo(x + 5, pavementHeight - 7);
      ctx.lineTo(x + 8, pavementHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Kerbstone edge
    ctx.fillStyle = '#8f887b';
    ctx.fillRect(0, pavementHeight, width, 10);
    ctx.strokeStyle = '#5c574e';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, pavementHeight, width, 10);

    // Asphalt Road
    const roadY = pavementHeight + 10;
    const roadH = height - roadY;
    ctx.fillStyle = '#393e46';
    ctx.fillRect(0, roadY, width, roadH);

    // Asphalt speckle texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 400; i++) {
      const rx = (i * 37) % width;
      const ry = roadY + ((i * 23) % roadH);
      ctx.fillRect(rx, ry, 3, 2);
    }

    // Dashed white center road lane marking
    const laneY = roadY + (roadH / 2) - 3;
    ctx.fillStyle = '#e8ecf2';
    for (let x = 10; x < width; x += 90) {
      ctx.fillRect(x, laneY, 50, 6);
    }

    canvas.refresh();
  }

  private static createPlayerTextures(scene: Phaser.Scene) {
    // Generate DA, ANC, PA player sprites with 4-frame run cycle, jump, talk, hit
    const parties = [
      { id: 'da', color: '#005ba6', text: 'DA', skin: '#8d5524', shoe: '#005ba6' },
      { id: 'anc', color: '#007a3d', text: 'ANC', skin: '#633917', shoe: '#ffcc00' },
      { id: 'pa', color: '#4ea81e', text: 'PA', skin: '#7a4b22', shoe: '#f5a623' }
    ];

    parties.forEach(p => {
      // If player textures already loaded from real PNG assets, skip procedural generation!
      if (scene.textures.exists(`player_${p.id}_idle`)) return;

      // 1. Idle / Standing frame (64x96)
      this.drawPlayerFrame(scene, `player_${p.id}_idle`, p, 0, 'idle');
      // 2. Run cycle frames 0..3
      this.drawPlayerFrame(scene, `player_${p.id}_run_0`, p, 0, 'run');
      this.drawPlayerFrame(scene, `player_${p.id}_run_1`, p, 1, 'run');
      this.drawPlayerFrame(scene, `player_${p.id}_run_2`, p, 2, 'run');
      this.drawPlayerFrame(scene, `player_${p.id}_run_3`, p, 3, 'run');
      // 3. Jump frame
      this.drawPlayerFrame(scene, `player_${p.id}_jump`, p, 0, 'jump');
      // 4. Hit frame
      this.drawPlayerFrame(scene, `player_${p.id}_hit`, p, 0, 'hit');
      // 5. Talk frame
      this.drawPlayerFrame(scene, `player_${p.id}_talk`, p, 0, 'talk');
    });
  }

  private static drawPlayerFrame(
    scene: Phaser.Scene, 
    key: string, 
    party: { id: string; color: string; text: string; skin: string; shoe: string }, 
    frameIdx: number, 
    action: 'idle' | 'run' | 'jump' | 'hit' | 'talk'
  ) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 80, 110);
    if (!canvas) return;
    const ctx = canvas.getContext();

    const cx = 40;
    const cy = 26;

    // Head / Face
    ctx.fillStyle = party.skin;
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();

    // Short dark hair
    ctx.fillStyle = '#1a110a';
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 18, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 2, cy - 3, 5, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx + 4, cy - 2, 3, 4);

    // Smile or expression
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (action === 'hit') {
      // Surprised 'O'
      ctx.arc(cx + 4, cy + 8, 4, 0, Math.PI * 2);
    } else {
      // Big friendly smile
      ctx.arc(cx + 4, cy + 5, 6, 0.1, Math.PI * 0.9);
    }
    ctx.stroke();

    // Body / Shirt with party branding
    const bodyY = cy + 17;
    const bodyW = 28;
    const bodyH = 34;
    ctx.fillStyle = party.color;
    ctx.fillRect(cx - bodyW / 2, bodyY, bodyW, bodyH);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - bodyW / 2, bodyY, bodyW, bodyH);

    // Party Text on shirt
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(party.text, cx, bodyY + 21);

    // Canvassing Clipboard / Pamphlet in hand
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 16, bodyY + 12, 12, 16);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 16, bodyY + 12, 12, 16);
    // Tiny ballot cross
    ctx.strokeStyle = party.color;
    ctx.strokeRect(cx - 13, bodyY + 16, 6, 6);

    // Legs & Running animation offsets
    const legY = bodyY + bodyH;
    const legW = 9;
    const legH = 26;

    ctx.fillStyle = '#22334d'; // Navy pants

    if (action === 'run') {
      const legOffsets = [
        { l1: -8, l2: 8, h1: 0, h2: -4 },
        { l1: 0, l2: 0, h1: -2, h2: -2 },
        { l1: 8, l2: -8, h1: -4, h2: 0 },
        { l1: 0, l2: 0, h1: -2, h2: -2 }
      ];
      const off = legOffsets[frameIdx % 4];

      // Left leg
      ctx.fillRect(cx - 12 + off.l1, legY, legW, legH + off.h1);
      // Right leg
      ctx.fillRect(cx + 3 + off.l2, legY, legW, legH + off.h2);

      // Running takkies (shoes)
      ctx.fillStyle = party.shoe;
      ctx.fillRect(cx - 14 + off.l1, legY + legH + off.h1 - 4, 13, 8);
      ctx.fillRect(cx + 1 + off.l2, legY + legH + off.h2 - 4, 13, 8);
    } else if (action === 'jump') {
      // Tucked jumping legs
      ctx.fillRect(cx - 12, legY, legW, 16);
      ctx.fillRect(cx + 3, legY, legW, 14);
      ctx.fillStyle = party.shoe;
      ctx.fillRect(cx - 14, legY + 12, 13, 8);
      ctx.fillRect(cx + 1, legY + 10, 13, 8);
    } else {
      // Standing legs
      ctx.fillRect(cx - 11, legY, legW, legH);
      ctx.fillRect(cx + 2, legY, legW, legH);
      ctx.fillStyle = party.shoe;
      ctx.fillRect(cx - 13, legY + legH - 4, 13, 8);
      ctx.fillRect(cx, legY + legH - 4, 13, 8);
    }

    canvas.refresh();
  }

  private static createResidentTextures(scene: Phaser.Scene) {
    // Diverse South African adult community members
    const residents = [
      { id: '1', name: 'Auntie with Doek', skin: '#7a4b22', doek: '#d63031', top: '#f1c40f', skirt: '#8e44ad', hoop: true },
      { id: '2', name: 'Uncle in Cap', skin: '#8d5524', cap: '#27ae60', top: '#2c3e50', pants: '#7f8c8d' },
      { id: '3', name: 'Young Local', skin: '#593315', cap: '#e67e22', top: '#2980b9', pants: '#34495e' },
      { id: '4', name: 'Senior Gogo', skin: '#6e401f', doek: '#3498db', top: '#e056fd', skirt: '#2ecc71', glasses: true },
      { id: '5', name: 'Civic Member', skin: '#8d5524', top: '#e74c3c', pants: '#bdc3c7' },
      { id: '6', name: 'Shopkeeper', skin: '#633917', top: '#16a085', apron: '#ecf0f1', pants: '#2c3e50' }
    ];

    residents.forEach(r => {
      if (scene.textures.exists(`resident_${r.id}`)) return;
      this.drawResident(scene, `resident_${r.id}`, r);
    });

    // Alert Exclamation Badge
    this.createAlertBadge(scene);
  }

  private static drawResident(scene: Phaser.Scene, key: string, r: { id: string; skin: string; doek?: string; top: string; skirt?: string; pants?: string; hoop?: boolean; cap?: string; glasses?: boolean }) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 80, 110);
    if (!canvas) return;
    const ctx = canvas.getContext();

    const cx = 40;
    const cy = 28;

    // Head
    ctx.fillStyle = r.skin;
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();

    // Doek / Cap / Hair
    if (r.doek) {
      ctx.fillStyle = r.doek;
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 19, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // Doek knot
      ctx.fillRect(cx + 12, cy - 14, 8, 8);
    } else if (r.cap) {
      ctx.fillStyle = r.cap;
      ctx.fillRect(cx - 18, cy - 16, 36, 12);
      // Peak
      ctx.fillRect(cx - 24, cy - 8, 14, 5);
    } else {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 18, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // Hoop earrings
    if (r.hoop) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 16, cy + 4, 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 8, cy - 3, 5, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 7, cy - 2, 3, 3);

    // Expressive mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 4, cy + 6, 5, 0, Math.PI);
    ctx.stroke();

    // Torso / Top
    const bodyY = cy + 17;
    ctx.fillStyle = r.top;
    ctx.fillRect(cx - 15, bodyY, 30, 32);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 15, bodyY, 30, 32);

    // Hands on hips / expressive gesture
    ctx.fillStyle = r.skin;
    ctx.fillRect(cx - 22, bodyY + 10, 8, 8);
    ctx.fillRect(cx + 14, bodyY + 10, 8, 8);

    // Skirt or Pants
    const lowerY = bodyY + 32;
    if (r.skirt) {
      ctx.fillStyle = r.skirt;
      ctx.beginPath();
      ctx.moveTo(cx - 16, lowerY);
      ctx.lineTo(cx + 16, lowerY);
      ctx.lineTo(cx + 22, lowerY + 28);
      ctx.lineTo(cx - 22, lowerY + 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = r.pants || '#333';
      ctx.fillRect(cx - 13, lowerY, 11, 28);
      ctx.fillRect(cx + 2, lowerY, 11, 28);
    }

    // Shoes
    ctx.fillStyle = '#222';
    ctx.fillRect(cx - 16, lowerY + 27, 13, 7);
    ctx.fillRect(cx + 3, lowerY + 27, 13, 7);

    canvas.refresh();
  }

  private static createAlertBadge(scene: Phaser.Scene) {
    if (scene.textures.exists('ui_alert_badge')) return;
    const canvas = scene.textures.createCanvas('ui_alert_badge', 44, 44);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Glowing yellow/gold circle with exclamation mark
    ctx.fillStyle = '#fcb813';
    ctx.beginPath();
    ctx.arc(22, 22, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = '900 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 22, 30);

    canvas.refresh();
  }

  private static createObstacleTextures(scene: Phaser.Scene) {
    // 1. Pothole (small)
    this.createPothole(scene, 'obs_potholeSmall', 70, 35, '#1e2229');
    // 2. Pothole (large) - like reference image
    this.createPothole(scene, 'obs_potholeLarge', 110, 48, '#14181f');
    // 3. Water-filled pothole
    this.createWaterPothole(scene, 'obs_potholeWater', 95, 42);
    // 4. Rubbish bag
    this.createRubbishBag(scene, 'obs_rubbishBag');
    // 5. Broken drain
    this.createBrokenDrain(scene, 'obs_brokenDrain');
    // 6. Open manhole
    this.createOpenManhole(scene, 'obs_openManhole');
    // 7. Leaking pipe
    this.createLeakingPipe(scene, 'obs_leakingPipe');
    // 8. Fallen campaign poster
    this.createFallenPoster(scene, 'obs_fallenPoster');
  }

  private static createPothole(scene: Phaser.Scene, key: string, w: number, h: number, depthColor: string) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Jagged tar asphalt rim
    ctx.fillStyle = '#7a7060';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.48, h * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Deep jagged crater hole
    ctx.fillStyle = depthColor;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.40, h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Loose pebbles / tar chunks around rim
    ctx.fillStyle = '#524b40';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = w / 2 + Math.cos(angle) * (w * 0.44);
      const py = h / 2 + Math.sin(angle) * (h * 0.42);
      ctx.fillRect(px - 3, py - 2, 6, 4);
    }

    canvas.refresh();
  }

  private static createWaterPothole(scene: Phaser.Scene, key: string, w: number, h: number) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Muddy rim
    ctx.fillStyle = '#6e5a42';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.48, h * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water puddle with sky reflection
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.40, h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sky reflection shimmer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 10, h / 2 - 4, w * 0.2, h * 0.15, -0.2, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  private static createRubbishBag(scene: Phaser.Scene, key: string) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 60, 55);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Black plastic garbage bag
    ctx.fillStyle = '#1c1e22';
    ctx.beginPath();
    ctx.ellipse(30, 32, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tied yellow drawstring / top knot
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(26, 12, 8, 7);

    // Wrinkles highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(22, 24);
    ctx.lineTo(26, 38);
    ctx.moveTo(34, 25);
    ctx.lineTo(38, 36);
    ctx.stroke();

    canvas.refresh();
  }

  private static createBrokenDrain(scene: Phaser.Scene, key: string) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 75, 45);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Concrete frame
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(4, 4, 67, 37);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 67, 37);

    // Dark pit
    ctx.fillStyle = '#111';
    ctx.fillRect(10, 10, 55, 25);

    // Bent / broken metal bars
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 3;
    for (let x = 18; x < 60; x += 10) {
      ctx.beginPath();
      if (x === 28 || x === 38) {
        // Broken bent bar
        ctx.moveTo(x, 10);
        ctx.lineTo(x + 5, 20);
        ctx.lineTo(x - 2, 35);
      } else {
        ctx.moveTo(x, 10);
        ctx.lineTo(x, 35);
      }
      ctx.stroke();
    }

    canvas.refresh();
  }

  private static createOpenManhole(scene: Phaser.Scene, key: string) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 80, 50);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Concrete collar
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.ellipse(40, 25, 36, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark pitch black hole
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.ellipse(40, 25, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red warning flag / stick
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 25);
    ctx.lineTo(40, 4);
    ctx.stroke();

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(40, 4, 16, 10);

    canvas.refresh();
  }

  private static createLeakingPipe(scene: Phaser.Scene, key: string) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 70, 50);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Blue water pipe
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(5, 32, 60, 12);
    ctx.strokeStyle = '#1b4f72';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 32, 60, 12);

    // Water spray fountain
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(35, 20, 12, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.arc(35, 14, 7, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  private static createFallenPoster(scene: Phaser.Scene, key: string) {
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 65, 35);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Tilted yellow/green poster
    ctx.save();
    ctx.translate(32, 17);
    ctx.rotate(0.18);
    ctx.fillStyle = '#fcb813';
    ctx.fillRect(-26, -12, 52, 24);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(-26, -12, 52, 24);

    // Text "VOTE!"
    ctx.fillStyle = '#111';
    ctx.font = '900 10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOTE FOR ME', 0, 3);
    ctx.restore();

    canvas.refresh();
  }

  private static createUITextures(scene: Phaser.Scene) {
    // Ballot Box Icon
    if (!scene.textures.exists('icon_ballot')) {
      const canvas = scene.textures.createCanvas('icon_ballot', 40, 40);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(4, 12, 32, 24);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 12, 32, 24);

        // Slot
        ctx.fillStyle = '#111';
        ctx.fillRect(12, 10, 16, 4);

        // Ballot paper being dropped
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 3, 12, 12);
        ctx.strokeStyle = '#005ba6';
        ctx.strokeRect(17, 6, 6, 6);

        canvas.refresh();
      }
    }

    // Thumbs up / Victory Reaction icon
    if (!scene.textures.exists('icon_thumbs_up')) {
      const canvas = scene.textures.createCanvas('icon_thumbs_up', 48, 48);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👍', 24, 32);
        canvas.refresh();
      }
    }

    // Folded arms / Doubtful reaction icon
    if (!scene.textures.exists('icon_folded_arms')) {
      const canvas = scene.textures.createCanvas('icon_folded_arms', 48, 48);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🤔', 24, 32);
        canvas.refresh();
      }
    }

    // Frustrated reaction icon
    if (!scene.textures.exists('icon_frustrated')) {
      const canvas = scene.textures.createCanvas('icon_frustrated', 48, 48);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🤦', 24, 32);
        canvas.refresh();
      }
    }
  }
}
