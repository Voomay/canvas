// Shared realism toolkit for Voter Street.
// Everything is procedural (canvas textures + generated geometry) so the game stays dependency-free.
import * as THREE from './three.module.js';

export const wind = { value: 0 };
export const waterTime = { value: 0 };
const TAU = Math.PI * 2;

/* ───────────────────────────── helpers ───────────────────────────── */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function rgb(hex, f = 1, a = 1) {
  const r = clamp(((hex >> 16) & 255) * f, 0, 255) | 0, g = clamp(((hex >> 8) & 255) * f, 0, 255) | 0, b = clamp((hex & 255) * f, 0, 255) | 0;
  return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
}
function mk(w, h = w) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function toTex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function mergeGeos(list) {
  const pos = [], nor = [], uv = [], col = [];
  for (const src of list) {
    const g = src.index ? src.toNonIndexed() : src;
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv, c = g.attributes.color;
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
      uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
      col.push(c ? c.getX(i) : 1, c ? c.getY(i) : 1, c ? c.getZ(i) : 1);
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}

const _g = new Map();
export const bx = (w, h, d) => { const k = 'bx' + [w, h, d].map(n => +(+n).toFixed(3)).join(','); if (!_g.has(k)) _g.set(k, new THREE.BoxGeometry(w, h, d)); return _g.get(k); };
export const cyl = (rt, rb, h, n = 12) => { const k = 'cy' + [rt, rb, h, n].map(n2 => +(+n2).toFixed(3)).join(','); if (!_g.has(k)) _g.set(k, new THREE.CylinderGeometry(rt, rb, h, n)); return _g.get(k); };
export const sph = (r, ws = 14, hs = 10) => { const k = 'sp' + [r, ws, hs].map(n => +(+n).toFixed(3)).join(','); if (!_g.has(k)) _g.set(k, new THREE.SphereGeometry(r, ws, hs)); return _g.get(k); };
/* ───────────────────────── procedural surfaces ───────────────────────── */
const PAINT = {
  plaster(hex, r) {
    const [a, x] = mk(256), [b, y] = mk(256);
    x.fillStyle = rgb(hex); x.fillRect(0, 0, 256, 256);
    y.fillStyle = '#808080'; y.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 30; i++) {
      const px = r() * 256, py = r() * 256, rad = 30 + r() * 80, g = x.createRadialGradient(px, py, 0, px, py, rad), dark = r() > .5;
      g.addColorStop(0, dark ? 'rgba(40,30,18,.10)' : 'rgba(255,250,235,.11)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    }
    for (let i = 0; i < 5200; i++) {
      const v = r() > .5 ? 255 : 0, s = 1 + r() * 2;
      x.fillStyle = `rgba(${v},${v},${v},${.04 + r() * .08})`; x.fillRect(r() * 256, r() * 256, s, s);
      const h = 105 + (r() * 60 | 0); y.fillStyle = `rgb(${h},${h},${h})`; y.fillRect(r() * 256, r() * 256, s, s);
    }
    for (let i = 0; i < 16; i++) { // hairline cracks
      let cx = r() * 256, cy = r() * 256; x.strokeStyle = 'rgba(40,32,24,.28)'; x.lineWidth = .8; x.beginPath(); x.moveTo(cx, cy);
      for (let k = 0; k < 6; k++) { cx += (r() - .5) * 18; cy += r() * 14; x.lineTo(cx, cy); } x.stroke();
    }
    const dg = x.createLinearGradient(0, 256, 0, 168); dg.addColorStop(0, 'rgba(45,35,22,.34)'); dg.addColorStop(1, 'rgba(45,35,22,0)'); x.fillStyle = dg; x.fillRect(0, 168, 256, 88);
    for (let i = 0; i < 18; i++) { // rain streaks from the eaves
      const sx = r() * 256, ln = 50 + r() * 90, g = x.createLinearGradient(0, 0, 0, ln);
      g.addColorStop(0, 'rgba(34,28,22,.26)'); g.addColorStop(1, 'rgba(34,28,22,0)'); x.fillStyle = g; x.fillRect(sx, 0, 2 + r() * 6, ln);
    }
    return [a, b];
  },
  brick(hex, r) {
    const [a, x] = mk(256), [b, y] = mk(256);
    x.fillStyle = '#b8b0a0'; x.fillRect(0, 0, 256, 256); y.fillStyle = '#2a2a2a'; y.fillRect(0, 0, 256, 256);
    const rows = 16, bh = 16, bw = 48;
    for (let row = 0; row < rows; row++) {
      const off = (row % 2) * bw / 2;
      for (let xx = -bw; xx < 256 + bw; xx += bw) {
        x.fillStyle = rgb(hex, .8 + r() * .38); x.fillRect(xx + off + 1.5, row * bh + 1.5, bw - 3, bh - 3);
        const hv = 175 + (r() * 60 | 0); y.fillStyle = `rgb(${hv},${hv},${hv})`; y.fillRect(xx + off + 1.5, row * bh + 1.5, bw - 3, bh - 3);
      }
    }
    for (let i = 0; i < 3500; i++) { x.fillStyle = `rgba(${r() > .5 ? 255 : 20},${r() > .5 ? 240 : 20},${r() > .5 ? 220 : 20},.07)`; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); }
    const dg = x.createLinearGradient(0, 256, 0, 190); dg.addColorStop(0, 'rgba(30,24,16,.32)'); dg.addColorStop(1, 'rgba(30,24,16,0)'); x.fillStyle = dg; x.fillRect(0, 190, 256, 66);
    return [a, b];
  },
  metal(hex, r, o = {}) {
    const rust = o.rust ?? .5, [a, x] = mk(256), [b, y] = mk(256);
    for (let i = 0; i < 16; i++) { // 16 corrugation ribs per tile
      const g = x.createLinearGradient(i * 16, 0, i * 16 + 16, 0);
      g.addColorStop(0, rgb(hex, .74)); g.addColorStop(.3, rgb(hex, 1.2)); g.addColorStop(.62, rgb(hex, 1.0)); g.addColorStop(1, rgb(hex, .7));
      x.fillStyle = g; x.fillRect(i * 16, 0, 16, 256);
      const gy = y.createLinearGradient(i * 16, 0, i * 16 + 16, 0);
      gy.addColorStop(0, '#202020'); gy.addColorStop(.5, '#f0f0f0'); gy.addColorStop(1, '#202020'); y.fillStyle = gy; y.fillRect(i * 16, 0, 16, 256);
    }
    const rc = o.rustColor || 0x8a3f20;
    for (let i = 0; i < 30 * rust + 4; i++) {
      const sx = r() * 256, ln = 20 + r() * 150, w = 1 + r() * 5, g = x.createLinearGradient(0, 0, 0, ln);
      const sy = r() > .5 ? 0 : r() * (256 - ln); g.addColorStop(0, rgb(rc, .8 + r() * .5, .5 + r() * .25)); g.addColorStop(1, rgb(rc, 1, 0));
      x.save(); x.translate(0, sy); x.fillStyle = g; x.fillRect(sx, 0, w, ln); x.restore();
    }
    for (let i = 0; i < 28; i++) { x.fillStyle = `rgba(20,16,12,${.05 + r() * .09})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 7, 1 + r() * 30); }
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${.04 + r() * .08})`; x.fillRect(r() * 256, r() * 256, 1, 1 + r() * 2); }
    for (let i = 0; i < 20; i++) { // dents
      const px = r() * 256, py = r() * 256, rad = 8 + r() * 24, g = y.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, r() > .5 ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.28)'); g.addColorStop(1, 'rgba(128,128,128,0)'); y.fillStyle = g; y.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    const dg = x.createLinearGradient(0, 256, 0, 190); dg.addColorStop(0, 'rgba(25,20,14,.4)'); dg.addColorStop(1, 'rgba(25,20,14,0)'); x.fillStyle = dg; x.fillRect(0, 190, 256, 66);
    for (const ry of [18, 238]) for (let k = 0; k < 16; k++) { x.fillStyle = 'rgba(30,30,30,.55)'; x.beginPath(); x.arc(k * 16 + 8, ry, 1.6, 0, TAU); x.fill(); }
    return [a, b];
  },
  wood(hex, r) {
    const [a, x] = mk(256), [b, y] = mk(256);
    y.fillStyle = '#808080'; y.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8; i++) {
      x.fillStyle = rgb(hex, .78 + r() * .4); x.fillRect(i * 32, 0, 32, 256);
      for (let k = 0; k < 26; k++) {
        const gx = i * 32 + 2 + r() * 28; x.strokeStyle = `rgba(30,18,8,${.08 + r() * .14})`; x.lineWidth = .6 + r() * .9; x.beginPath(); x.moveTo(gx, 0);
        for (let yy = 0; yy <= 256; yy += 32) x.lineTo(gx + Math.sin(yy * .03 + k) * 1.8, yy); x.stroke();
      }
      if (r() > .55) { const kx = i * 32 + 8 + r() * 16, ky = r() * 256; x.fillStyle = 'rgba(40,24,10,.55)'; x.beginPath(); x.ellipse(kx, ky, 3.4, 6, 0, 0, TAU); x.fill(); }
      x.fillStyle = 'rgba(10,8,6,.85)'; x.fillRect(i * 32, 0, 1.6, 256);
      y.fillStyle = '#101010'; y.fillRect(i * 32, 0, 2, 256);
    }
    for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${r() > .5 ? 255 : 0},${r() > .5 ? 255 : 0},${r() > .5 ? 255 : 0},.05)`; x.fillRect(r() * 256, r() * 256, 1, 4 + r() * 6); }
    return [a, b];
  },
  tile(hex, r) { // rows stack along the U axis so they run down a roof slope
    const [a, x] = mk(256), [b, y] = mk(256);
    x.fillStyle = rgb(hex, .5); x.fillRect(0, 0, 256, 256); y.fillStyle = '#202020'; y.fillRect(0, 0, 256, 256);
    const rows = 8, rw = 32, tw = 32;
    for (let row = 0; row < rows; row++) {
      const off = (row % 2) * tw / 2;
      for (let t = -1; t < 9; t++) {
        const px = row * rw, py = t * tw + off, col = hex, f = .82 + r() * .36;
        const g = x.createLinearGradient(px, 0, px + rw, 0); g.addColorStop(0, rgb(col, f * .55)); g.addColorStop(.35, rgb(col, f * .95)); g.addColorStop(1, rgb(col, f * 1.12));
        x.fillStyle = g; x.fillRect(px, py + 1, rw, tw - 2);
        const gy = y.createLinearGradient(px, 0, px + rw, 0); gy.addColorStop(0, '#3a3a3a'); gy.addColorStop(.85, '#e6e6e6'); gy.addColorStop(1, '#101010');
        y.fillStyle = gy; y.fillRect(px, py + 1, rw, tw - 2);
        if (r() > .7) { x.fillStyle = `rgba(80,110,50,${.12 + r() * .2})`; x.fillRect(px + 4 + r() * 12, py + 2 + r() * 20, 6 + r() * 14, 4 + r() * 10); } // moss
      }
    }
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${r() > .5 ? 255 : 10},${r() > .5 ? 255 : 10},${r() > .5 ? 255 : 10},.06)`; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); }
    return [a, b];
  },
  bark(hex, r) { // fissures run along U, which is trunk length for TubeGeometry
    const [a, x] = mk(256), [b, y] = mk(256);
    x.fillStyle = rgb(hex); x.fillRect(0, 0, 256, 256); y.fillStyle = '#909090'; y.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const yy = r() * 256, len = 40 + r() * 190, x0 = r() * 256, lw = 1.2 + r() * 3.5, dark = r() > .35;
      x.strokeStyle = dark ? rgb(hex, .38, .65) : rgb(hex, 1.35, .45); x.lineWidth = lw; x.beginPath(); x.moveTo(x0, yy);
      for (let k = 1; k <= 8; k++) x.lineTo(x0 + len * k / 8, yy + Math.sin(k * 1.3 + i) * 2.4); x.stroke();
      y.strokeStyle = dark ? '#101010' : '#d8d8d8'; y.lineWidth = lw; y.beginPath(); y.moveTo(x0, yy);
      for (let k = 1; k <= 8; k++) y.lineTo(x0 + len * k / 8, yy + Math.sin(k * 1.3 + i) * 2.4); y.stroke();
    }
    for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(${r() > .5 ? 255 : 0},${r() > .5 ? 255 : 0},${r() > .5 ? 240 : 0},.06)`; x.fillRect(r() * 256, r() * 256, 2, 1 + r() * 2); }
    return [a, b];
  },
  palmbark(hex, r) { // growth rings: bands vary along U
    const [a, x] = mk(256), [b, y] = mk(256);
    x.fillStyle = rgb(hex); x.fillRect(0, 0, 256, 256); y.fillStyle = '#808080'; y.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 24; i++) {
      const xx = i * (256 / 24), g = x.createLinearGradient(xx, 0, xx + 11, 0); g.addColorStop(0, rgb(hex, .5, .8)); g.addColorStop(.5, rgb(hex, 1.15, .1)); g.addColorStop(1, rgb(hex, .8, .0));
      x.fillStyle = g; x.fillRect(xx, 0, 11, 256);
      const gy = y.createLinearGradient(xx, 0, xx + 11, 0); gy.addColorStop(0, '#101010'); gy.addColorStop(1, '#a0a0a0'); y.fillStyle = gy; y.fillRect(xx, 0, 11, 256);
    }
    for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(${r() > .5 ? 255 : 0},${r() > .5 ? 240 : 0},${r() > .5 ? 220 : 0},.07)`; x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3); }
    return [a, b];
  },
  dirt(hex, r) {
    const [a, x] = mk(256), [b, y] = mk(256);
    x.fillStyle = rgb(hex); x.fillRect(0, 0, 256, 256); y.fillStyle = '#808080'; y.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) { const px = r() * 256, py = r() * 256, rad = 20 + r() * 60, g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, r() > .5 ? 'rgba(60,44,26,.14)' : 'rgba(255,235,200,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
    for (let i = 0; i < 6000; i++) { const v = 90 + (r() * 140 | 0), s = 1 + r() * 2.2; x.fillStyle = `rgba(${v},${v * .9 | 0},${v * .72 | 0},.3)`; x.fillRect(r() * 256, r() * 256, s, s); const h = 90 + (r() * 90 | 0); y.fillStyle = `rgb(${h},${h},${h})`; y.fillRect(r() * 256, r() * 256, s, s); }
    for (let i = 0; i < 110; i++) { x.fillStyle = `rgba(${150 + r() * 70 | 0},${140 + r() * 60 | 0},${120 + r() * 50 | 0},.7)`; x.beginPath(); x.ellipse(r() * 256, r() * 256, 1 + r() * 2.5, 1 + r() * 2, r() * 3, 0, TAU); x.fill(); }
    return [a, b];
  },
  sand(hex, r) {
    const [a, x] = mk(256), [b, y] = mk(256);
    x.fillStyle = rgb(hex); x.fillRect(0, 0, 256, 256); y.fillStyle = '#808080'; y.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 30; i++) { // wind ripples
      const yy = r() * 256; x.strokeStyle = r() > .5 ? 'rgba(120,96,60,.12)' : 'rgba(255,248,225,.16)'; x.lineWidth = 1.2 + r() * 2; x.beginPath(); x.moveTo(0, yy);
      for (let k = 1; k <= 16; k++) x.lineTo(k * 16, yy + Math.sin(k * .7 + i) * 4); x.stroke();
      y.strokeStyle = r() > .5 ? '#e0e0e0' : '#303030'; y.lineWidth = 1.4; y.beginPath(); y.moveTo(0, yy); for (let k = 1; k <= 16; k++) y.lineTo(k * 16, yy + Math.sin(k * .7 + i) * 4); y.stroke();
    }
    for (let i = 0; i < 7000; i++) { const v = r() > .5 ? 255 : 90; x.fillStyle = `rgba(${v},${v * .93 | 0},${v * .78 | 0},.14)`; x.fillRect(r() * 256, r() * 256, 1, 1); }
    return [a, b];
  },
};
const SURF = {
  plaster: { rough: .94, metal: 0, bump: 1.3 }, brick: { rough: .9, metal: 0, bump: 4 }, metal: { rough: .46, metal: .5, bump: 3 },
  wood: { rough: .84, metal: 0, bump: 2 }, tile: { rough: .72, metal: 0, bump: 3 }, bark: { rough: .96, metal: 0, bump: 4 },
  palmbark: { rough: .95, metal: 0, bump: 3 }, dirt: { rough: 1, metal: 0, bump: 1.5 }, sand: { rough: 1, metal: 0, bump: 1.4 },
};
const surfCache = new Map();
export function surfaceMat(kind, hex, o = {}) {
  const key = kind + ':' + hex + ':' + JSON.stringify(o);
  if (surfCache.has(key)) return surfCache.get(key);
  const [a, b] = PAINT[kind](hex, rng(hex ^ (kind.length * 7919) ^ ((o.rust ?? 0) * 1000 | 0)), o), s = SURF[kind];
  const m = new THREE.MeshStandardMaterial({
    map: toTex(a), bumpMap: toTex(b, false), bumpScale: s.bump, roughness: s.rough, metalness: s.metal, side: o.double ? THREE.DoubleSide : THREE.FrontSide,
  });
  surfCache.set(key, m);
  return m;
}
const stdCache = new Map();
export function stdMat(hex, rough = .7, metal = 0, o = {}) {
  const key = hex + ':' + rough + ':' + metal + ':' + JSON.stringify(o);
  if (!stdCache.has(key)) stdCache.set(key, new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal, ...o }));
  return stdCache.get(key);
}
let _glass;
export function glassMat() {
  return _glass ??= new THREE.MeshStandardMaterial({ color: 0x24404e, roughness: .05, metalness: .9, envMapIntensity: 1.6 });
}

/* box with world-scaled UVs so textures never stretch. vfit => side faces map v 0..1 (grime top, damp bottom) */
const boxCache = new Map();
export function scaledBox(w, h, d, tile = 2, vfit = false) {
  const key = [w, h, d, tile, vfit].map(n => +(+n).toFixed(3)).join(',');
  if (boxCache.has(key)) return boxCache.get(key);
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k, side = f < 2 || f > 3;
    uv.setXY(i, uv.getX(i) * dims[f][0] / tile, (vfit && side) ? uv.getY(i) : uv.getY(i) * dims[f][1] / tile);
  }
  boxCache.set(key, g);
  return g;
}

/* real corrugated sheet: ribs run along the slope (local x), profile varies along local z */
const corrCache = new Map();
export function corrugatedPanel(span, depth, rib = .1, amp = .024, tile = 1.6) {
  const key = [span, depth, rib, amp].map(n => +(+n).toFixed(3)).join(',');
  if (corrCache.has(key)) return corrCache.get(key);
  const nx = 2, nz = Math.max(12, Math.round(depth / rib * 5)), pos = [], uvs = [], idx = [];
  for (let ix = 0; ix <= nx; ix++) for (let iz = 0; iz <= nz; iz++) {
    const x = -span / 2 + span * ix / nx, z = -depth / 2 + depth * iz / nz;
    pos.push(x, amp * Math.sin(z / rib * TAU), z); uvs.push((z + depth / 2) / tile, (x + span / 2) / tile);
  }
  for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) {
    const a = ix * (nz + 1) + iz, b = a + 1, c = a + nz + 1, d = c + 1; idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
  corrCache.set(key, g);
  return g;
}

/* ───────────────────────────── foliage ───────────────────────────── */
function addSway(mat, amp, radial = false) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uWind = wind;
    sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 swO = instanceMatrix[3].xyz;
      #else
        vec3 swO = modelMatrix[3].xyz;
      #endif
      float swH = ${radial ? 'length(transformed)*.28' : 'clamp(transformed.y*.22,0.,1.)'};
      float swA = sin(uWind*1.6 + swO.x*.31 + swO.z*.23 + transformed.y*.8) + .5*sin(uWind*2.9 + swO.z*.5 + transformed.x*1.3);
      transformed.x += swA*${amp.toFixed(3)}*swH;
      transformed.z += swA*${(amp * .55).toFixed(3)}*swH;`);
  };
  mat.customProgramCacheKey = () => 'sway-' + amp + radial;
  return mat;
}
let leafTex, clumpMat, cardMat, frondMat;
function leafTexture() {
  if (leafTex) return leafTex;
  const [c, x] = mk(256), r = rng(4242);
  for (let i = 0; i < 90; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 108, px = 128 + Math.cos(a) * d, py = 128 + Math.sin(a) * d, ang = r() * TAU, L = 20 + r() * 20, W = 7 + r() * 6, l = 150 + (r() * 105 | 0);
    x.save(); x.translate(px, py); x.rotate(ang);
    const g = x.createLinearGradient(-L / 2, 0, L / 2, 0); g.addColorStop(0, `rgb(${l * .78 | 0},${l * .92 | 0},${l * .7 | 0})`); g.addColorStop(1, `rgb(${l},${l},${l * .86 | 0})`);
    x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, L / 2, W / 2, 0, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(60,80,40,.5)'; x.lineWidth = .8; x.beginPath(); x.moveTo(-L / 2, 0); x.lineTo(L / 2, 0); x.stroke(); x.restore();
  }
  leafTex = new THREE.CanvasTexture(c); leafTex.colorSpace = THREE.SRGBColorSpace; leafTex.anisotropy = 8;
  return leafTex;
}
function foliageMats() {
  clumpMat ??= addSway(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92 }), .09);
  cardMat ??= addSway(new THREE.MeshStandardMaterial({ map: leafTexture(), vertexColors: true, alphaTest: .45, side: THREE.DoubleSide, roughness: .78 }), .13);
  return { clumpMat, cardMat };
}
const noise3 = (x, y, z) => Math.sin(x * 1.7 + y * 2.3) * Math.sin(y * 1.9 + z * 2.1) * Math.sin(z * 1.3 + x * 2.7);

function canopyGeos(seed, o) {
  const r = rng(seed), clumps = [], cards = [], dark = new THREE.Color(o.dark), light = new THREE.Color(o.light), tmp = new THREE.Color();
  for (let c = 0; c < o.clumps; c++) {
    const ang = r() * TAU, rad = c === 0 ? 0 : o.spread * (.45 + .55 * r()), cx = Math.cos(ang) * rad, cy = c === 0 ? o.height * .3 : (r() - .25) * o.height, cz = Math.sin(ang) * rad;
    const R = o.radius * (c === 0 ? 1.1 : .66 + .42 * r()), geo = new THREE.IcosahedronGeometry(R, 2), p = geo.attributes.position;
    const nrm = [], col = [];
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i).normalize(), d = 1 + .17 * noise3(v.x * 2 + c, v.y * 2, v.z * 2 + c) + .05 * noise3(v.x * 6, v.y * 6 + c, v.z * 6);
      const wx = cx + v.x * R * d, wy = cy + v.y * R * d * .82, wz = cz + v.z * R * d;
      p.setXYZ(i, wx, wy, wz);
      const hf = clamp(.18 + (wy / (o.height + R)) * .62 + v.y * .22 + noise3(wx, wy, wz) * .18, 0, 1);
      tmp.copy(dark).lerp(light, hf).offsetHSL((r() - .5) * .006, 0, 0);
      col.push(tmp.r, tmp.g, tmp.b);
      const n = new THREE.Vector3(v.x, v.y * .8 + .35, v.z).normalize(); nrm.push(n.x, n.y, n.z);
    }
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    clumps.push(geo);
    for (let k = 0; k < o.cards; k++) {
      const u = r(), a2 = r() * TAU, y2 = lerp(-.2, 1, u), s = Math.sqrt(1 - y2 * y2), dir = new THREE.Vector3(Math.cos(a2) * s, y2, Math.sin(a2) * s);
      const ctr = new THREE.Vector3(cx + dir.x * R * 1.05, cy + dir.y * R * .86, cz + dir.z * R * 1.05);
      const t1 = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) > .9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize(), t2 = new THREE.Vector3().crossVectors(dir, t1).normalize();
      const roll = r() * TAU, e1 = t1.clone().multiplyScalar(Math.cos(roll)).addScaledVector(t2, Math.sin(roll)), e2 = new THREE.Vector3().crossVectors(dir, e1).normalize();
      const sz = o.card * (.75 + .6 * r()), q = new THREE.BufferGeometry(), corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => ctr.clone().addScaledVector(e1, a * sz / 2).addScaledVector(e2, b * sz / 2));
      const hf = clamp(.4 + (ctr.y / (o.height + R)) * .55 + (r() - .5) * .25, 0, 1); tmp.copy(dark).lerp(light, hf).multiplyScalar(1.12);
      const n = new THREE.Vector3(dir.x, dir.y * .8 + .4, dir.z).normalize();
      q.setAttribute('position', new THREE.Float32BufferAttribute(corners.flatMap(c2 => [c2.x, c2.y, c2.z]), 3));
      q.setAttribute('normal', new THREE.Float32BufferAttribute(Array(4).fill([n.x, n.y, n.z]).flat(), 3));
      q.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
      q.setAttribute('color', new THREE.Float32BufferAttribute(Array(4).fill([tmp.r, tmp.g, tmp.b]).flat(), 3));
      q.setIndex([0, 1, 2, 0, 2, 3]); cards.push(q);
    }
  }
  return { clump: mergeGeos(clumps), card: mergeGeos(cards) };
}

function trunkGeo(seed, o) {
  const r = rng(seed), H = o.height, bendX = (r() - .5) * o.bend, bendZ = (r() - .5) * o.bend;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(bendX * .3, H * .34, bendZ * .3), new THREE.Vector3(bendX * .75, H * .68, bendZ * .75), new THREE.Vector3(bendX, H, bendZ)]);
  const segs = 16, rad = 9, parts = [];
  const tube = (cv, r0, r1, flare, len) => {
    const g = new THREE.TubeGeometry(cv, segs, 1, rad, false), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs, c = cv.getPointAt(t), rr = lerp(r0, r1, Math.pow(t, .8)) * (1 + flare * Math.exp(-t * 12));
      for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; p.setXYZ(k, c.x + (p.getX(k) - c.x) * rr, c.y + (p.getY(k) - c.y) * rr, c.z + (p.getZ(k) - c.z) * rr); uv.setXY(k, t * len / 1.1, j / rad * 1.4); }
    }
    g.computeVertexNormals(); return g;
  };
  parts.push(tube(curve, o.r0, o.r1, o.flare, H));
  const top = curve.getPoint(1);
  for (let b = 0; b < o.branches; b++) {
    const a = b / o.branches * TAU + r(), by = H * (.55 + .2 * r()), bp = curve.getPoint(by / H), len = o.branchLen * (.7 + .5 * r());
    const end = new THREE.Vector3(bp.x + Math.cos(a) * len, bp.y + len * (.65 + .4 * r()), bp.z + Math.sin(a) * len);
    const bc = new THREE.CatmullRomCurve3([bp, bp.clone().lerp(end, .5).add(new THREE.Vector3(0, .12, 0)), end]);
    parts.push(tube(bc, o.r1 * .95, o.r1 * .38, .1, len * 2));
  }
  return { geo: mergeGeos(parts), top };
}

const treeVariants = new Map();
const TREE_KINDS = {
  leafy: { height: 2.7, r0: .2, r1: .1, flare: .7, bend: .5, branches: 3, branchLen: .55, clumps: 9, radius: 1.05, spread: 1.0, cHeight: 1.4, cards: 14, card: .95, dark: 0x2c4a1e, light: 0x9fc050, bark: 0x6f5a45 },
  coastal: { height: 2.9, r0: .27, r1: .13, flare: .9, bend: .9, branches: 4, branchLen: .75, clumps: 8, radius: 1.2, spread: 1.4, cHeight: 1.1, cards: 14, card: 1.1, dark: 0x264a30, light: 0x8cc06a, bark: 0x6a5a4a },
};
export function makeTree(kind = 'leafy', variant = 0) {
  const o = TREE_KINDS[kind], key = kind + variant % 5;
  if (!treeVariants.has(key)) {
    const seed = 1000 + variant % 5 * 131 + (kind === 'coastal' ? 7 : 0), tr = trunkGeo(seed, o);
    const hueShift = [0, .02, -.015, .035, -.03][variant % 5], dark = new THREE.Color(o.dark).offsetHSL(hueShift, 0, 0), light = new THREE.Color(o.light).offsetHSL(hueShift, 0, 0);
    const cn = canopyGeos(seed + 3, { clumps: o.clumps, radius: o.radius, spread: o.spread, height: o.cHeight, cards: o.cards, card: o.card, dark, light });
    treeVariants.set(key, { trunk: tr.geo, top: tr.top, clump: cn.clump, card: cn.card });
  }
  const v = treeVariants.get(key), { clumpMat: cm, cardMat: km } = foliageMats(), g = new THREE.Group();
  const trunk = new THREE.Mesh(v.trunk, surfaceMat('bark', o.bark)); trunk.castShadow = trunk.receiveShadow = true; g.add(trunk);
  const cy = v.top.y + .3, clump = new THREE.Mesh(v.clump, cm), card = new THREE.Mesh(v.card, km);
  clump.position.set(v.top.x, cy, v.top.z); card.position.copy(clump.position);
  clump.castShadow = true; clump.receiveShadow = true; card.receiveShadow = true; card.castShadow = false;
  g.add(clump, card);
  return g;
}
export function makeShrub(variant = 0) {
  const key = 'shrub' + variant % 4;
  if (!treeVariants.has(key)) {
    const cn = canopyGeos(77 + variant % 4 * 19, { clumps: 4, radius: .34, spread: .3, height: .3, cards: 10, card: .5, dark: new THREE.Color(0x2e5222), light: new THREE.Color(0x8ab84c).offsetHSL([0, .03, -.02, .05][variant % 4], 0, 0) });
    treeVariants.set(key, cn);
  }
  const v = treeVariants.get(key), { clumpMat: cm, cardMat: km } = foliageMats(), g = new THREE.Group();
  const a = new THREE.Mesh(v.clump, cm), b = new THREE.Mesh(v.card, km); a.position.y = b.position.y = .32; a.castShadow = true; a.receiveShadow = b.receiveShadow = true; b.castShadow = false;
  g.add(a, b); return g;
}

/* palms */
const frondCache = new Map();
function frondGeo(variant) {
  if (frondCache.has(variant)) return frondCache.get(variant);
  const r = rng(555 + variant * 31), len = 2.7 + variant * .25, pos = [], col = [], nor = [], idx = [];
  const rach = s => new THREE.Vector3(0, Math.sin(s * 1.15) * .55 - s * s * .85 * (1 + variant * .1), s * len);
  const push = (v, c, n) => { pos.push(v.x, v.y, v.z); col.push(c[0], c[1], c[2]); nor.push(n.x, n.y, n.z); return pos.length / 3 - 1; };
  const nUp = new THREE.Vector3(0, 1, 0), cs = [.06, .19, .05], ce = [.26, .52, .14];
  const N = 30;
  for (let i = 0; i < N; i++) {
    const s0 = .1 + .88 * i / N, base = rach(s0), ll = len * .26 * Math.sin(Math.PI * clamp(s0 * 1.05, .1, 1)) * (.8 + r() * .35) + .18;
    for (const side of [-1, 1]) {
      const dir = new THREE.Vector3(side * 1, -.55 - r() * .2, .42 + r() * .25).normalize();
      const mid = base.clone().addScaledVector(dir, ll * .5).add(new THREE.Vector3(0, .05 * ll, 0)), tip = base.clone().addScaledVector(dir, ll).add(new THREE.Vector3(0, -.14 * ll, .08 * ll));
      const w = .055 + .04 * r(), fw = new THREE.Vector3(0, 0, 1);
      const t = (c) => [lerp(cs[0], ce[0], c) * (.85 + r() * .3), lerp(cs[1], ce[1], c) * (.9 + r() * .2), lerp(cs[2], ce[2], c)];
      const a = push(base.clone().addScaledVector(fw, -w), t(0), nUp), b = push(base.clone().addScaledVector(fw, w), t(0), nUp);
      const c = push(mid.clone().addScaledVector(fw, -w * .8), t(.5), nUp), d = push(mid.clone().addScaledVector(fw, w * .8), t(.5), nUp), e = push(tip, t(1), nUp);
      idx.push(a, b, c, b, d, c, c, d, e);
    }
  }
  for (let i = 0; i < 12; i++) { // rachis
    const s0 = i / 12, s1 = (i + 1) / 12, p0 = rach(s0), p1 = rach(s1), wd = lerp(.045, .014, s0);
    const a = push(p0.clone().add(new THREE.Vector3(-wd, 0, 0)), [.32, .4, .16], nUp), b = push(p0.clone().add(new THREE.Vector3(wd, 0, 0)), [.22, .3, .1], nUp);
    const c = push(p1.clone().add(new THREE.Vector3(-wd * .8, 0, 0)), [.32, .4, .16], nUp), d = push(p1.clone().add(new THREE.Vector3(wd * .8, 0, 0)), [.32, .4, .16], nUp);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(Array(pos.length / 3 * 2).fill(0), 2)); g.setIndex(idx);
  frondCache.set(variant, g); return g;
}
const palmTrunks = new Map();
export function makePalm(lean = .14, leanRot = 0, variant = 0) {
  frondMat ??= addSway(new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .62 }), .34, true);
  const g = new THREE.Group(), key = variant % 4;
  if (!palmTrunks.has(key)) {
    const r = rng(900 + key), H = 4.9 + r() * .5, lx = (r() - .5) * 1.2 * (lean + .1), curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(lx * .2, H * .35, 0), new THREE.Vector3(lx * .65, H * .7, .1), new THREE.Vector3(lx + lean * 1.4, H, .12)]);
    const segs = 18, rad = 10, tg = new THREE.TubeGeometry(curve, segs, 1, rad, false), p = tg.attributes.position, uv = tg.attributes.uv;
    for (let i = 0; i <= segs; i++) { const t = i / segs, c = curve.getPointAt(t), rr = lerp(.3, .17, t) * (1 + .5 * Math.exp(-t * 14)); for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; p.setXYZ(k, c.x + (p.getX(k) - c.x) * rr, c.y + (p.getY(k) - c.y) * rr, c.z + (p.getZ(k) - c.z) * rr); uv.setXY(k, t * 1.3, j / rad); } }
    tg.computeVertexNormals(); palmTrunks.set(key, { geo: tg, top: curve.getPoint(1) });
  }
  const pt = palmTrunks.get(key), trunk = new THREE.Mesh(pt.geo, surfaceMat('palmbark', 0x8d7a60)); trunk.castShadow = trunk.receiveShadow = true; g.add(trunk);
  const crown = new THREE.Group(); crown.position.copy(pt.top); g.add(crown);
  const r2 = rng(31 + key * 7), N = 15;
  for (let i = 0; i < N; i++) {
    const holder = new THREE.Group(); holder.rotation.y = i / N * TAU + r2() * .3; crown.add(holder);
    const f = new THREE.Mesh(frondGeo((i + key) % 3), frondMat); f.rotation.x = -(.95 - (i % 3) * .38 - r2() * .15); f.castShadow = false; f.receiveShadow = true; holder.add(f);
  }
  const nut = stdMat(0x4b3a24, .7);
  for (let i = 0; i < 5; i++) { const n = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), nut); n.position.set(Math.cos(i * 1.3) * .2, -.1, Math.sin(i * 1.3) * .2); n.castShadow = true; crown.add(n); }
  return g;
}

/* ───────────────────────────── water & beach ───────────────────────────── */
const WATER_FRAG_HEAD = `
varying vec3 vW; uniform float uTime; uniform float uSea; uniform vec3 uDeep; uniform vec3 uShallow; uniform float uShore; uniform vec2 uFlow; uniform float uAlpha;
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),f.x),f.y);}
vec2 wg(vec2 p,float t){
  vec2 g=vec2(0.);
  g+=vec2(.9,.4)*.9*.055*cos(dot(p,vec2(.9,.4))*.9+t*1.3);
  g+=vec2(-.5,.85)*1.7*.035*cos(dot(p,vec2(-.5,.85))*1.7+t*1.7);
  g+=vec2(.2,-.95)*2.9*.02*cos(dot(p,vec2(.2,-.95))*2.9+t*2.3);
  g+=vec2(-.85,-.3)*5.3*.011*cos(dot(p,vec2(-.85,-.3))*5.3+t*3.1);
  g+=vec2(.6,.7)*8.7*.006*cos(dot(p,vec2(.6,.7))*8.7+t*4.1);
  vec2 q=p*2.2+vec2(t*.15,-t*.1); float e=.05;
  g+=vec2(vnoise(q+vec2(e,0.))-vnoise(q-vec2(e,0.)),vnoise(q+vec2(0.,e))-vnoise(q-vec2(0.,e)))/(2.*e)*.03;
  return g;
}`;
export function createWater({ width, depth, x = 0, y = 0, z = 0, mode = 'sea', shoreX = -54.2, deep = 0x0a5a78, shallow = 0x39b8c4, flow = [0, 0], opacity = .86, segX = 40, segZ = 80 }) {
  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .07, metalness: .05, transparent: true, envMapIntensity: 1.5 });
  const sea = mode === 'sea' ? 1 : 0;
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, { uTime: waterTime, uSea: { value: sea }, uDeep: { value: new THREE.Color(deep) }, uShallow: { value: new THREE.Color(shallow) }, uShore: { value: shoreX }, uFlow: { value: new THREE.Vector2(...flow) }, uAlpha: { value: opacity } });
    sh.vertexShader = 'varying vec3 vW; uniform float uTime; uniform float uSea; uniform float uShore;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wp0=modelMatrix*vec4(position,1.0);
      float amp=uSea*smoothstep(0.,14.,uShore-wp0.x);
      transformed.y+=amp*(sin(wp0.z*.11+uTime*.8+wp0.x*.04)*.16+sin(wp0.z*.23-uTime*1.1+wp0.x*.12)*.07+sin(wp0.x*.17+uTime*.7)*.06);
      vW=(modelMatrix*vec4(transformed,1.0)).xyz;`);
    sh.fragmentShader = WATER_FRAG_HEAD + '\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      float dist=uShore-vW.x;
      float sw=sin(vW.z*.16+uTime*.6)*.55+sin(vW.z*.41-uTime*.9)*.25+sin(uTime*.45)*.5;
      float d2=dist+sw;
      float depthF=mix(.62,smoothstep(0.,28.,dist),uSea);
      vec3 wcol=mix(uShallow,uDeep,depthF);
      float fn=vnoise(vW.xz*.9+vec2(uTime*.05,0.))*.6+vnoise(vW.xz*3.1)*.4;
      float ph=fract(d2*.115+uTime*.09);
      float band=smoothstep(0.,.08,ph)*(1.-smoothstep(.08,.3,ph));
      float zone=1.-smoothstep(6.,22.,d2);
      float edge=1.-smoothstep(0.,1.1+.7*fn,d2);
      float foam=clamp(band*zone*(.3+.7*fn)+edge*.95,0.,1.)*uSea;
      float chn=vnoise(vW.xz*vec2(2.,.7)-uFlow*uTime*1.4)*.5;
      wcol+=(chn-.25)*.08*(1.-uSea);
      wcol=mix(wcol,vec3(.94,.98,.97),foam);
      diffuseColor.rgb=wcol;
      float alphaSea=mix(.04,1.,smoothstep(0.,3.4,d2))*.93+.07*smoothstep(0.,1.,d2);
      diffuseColor.a=max(mix(uAlpha,alphaSea,uSea),foam*.92);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor=mix(.06,.55,foam);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      vec2 pp=vW.xz*mix(2.6,1.,uSea)-uFlow*uTime*.9;
      vec2 gr=wg(pp,uTime*mix(.7,1.,uSea))*mix(.55,1.5,uSea)*(1.-foam*.6);
      vec3 nW=normalize(vec3(-gr.x,1.,-gr.y));
      normal=normalize((viewMatrix*vec4(nW,0.)).xyz);`);
  };
  mat.customProgramCacheKey = () => 'realism-water-v1';
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.receiveShadow = false; m.castShadow = false; m.renderOrder = 2;
  return m;
}
/* gently sloping beach that meets the water plane at shoreX */
export function createBeach({ xFrom = -330, xTo = -52, zFrom = -240, zTo = 130, waterY = -.1, shoreX = -54.2, slope = .085 }) {
  const sx = xTo - xFrom, sz = zTo - zFrom, geo = new THREE.PlaneGeometry(sx, sz, sx, 2); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = [], tmp = new THREE.Color(), dry = new THREE.Color(0xe9d7ac), wet = new THREE.Color(0xa38c62), under = new THREE.Color(0xb7a47e);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (xFrom + xTo) / 2, y = Math.min(0, Math.max(-6, waterY - (shoreX - x) * slope));
    p.setY(i, y);
    const wetness = clamp(1 - (y + .16) / .26, 0, 1); tmp.copy(dry).lerp(wet, wetness); if (y < waterY) tmp.lerp(under, clamp((waterY - y) / 1.5, 0, 1));
    col.push(tmp.r, tmp.g, tmp.b);
    const u = p.getX(i) + sx / 2, v = p.getZ(i) + sz / 2; geo.attributes.uv.setXY(i, u / 6, v / 6);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  const mat = surfaceMat('sand', 0xffffff).clone(); mat.vertexColors = true; mat.needsUpdate = true;
  const m = new THREE.Mesh(geo, mat); m.position.set((xFrom + xTo) / 2, 0, (zFrom + zTo) / 2); m.receiveShadow = true;
  return m;
}

/* ───────────────────────────── people geometry ───────────────────────────── */
const pGeo = new Map();
export function limbGeo(r, len) { const k = `limb${r.toFixed(3)},${len.toFixed(3)}`; if (!pGeo.has(k)) pGeo.set(k, new THREE.CapsuleGeometry(r, len, 5, 10)); return pGeo.get(k); }
export function fineSphere() { if (!pGeo.has('sph')) pGeo.set('sph', new THREE.SphereGeometry(1, 18, 12)); return pGeo.get('sph'); }
export function hairCapGeo() { if (!pGeo.has('hair')) pGeo.set('hair', new THREE.SphereGeometry(1, 20, 12, 0, TAU, 0, Math.PI * .6)); return pGeo.get('hair'); }
export function torsoGeo(female) {
  const k = 'torso' + female; if (pGeo.has(k)) return pGeo.get(k);
  const prof = female
    ? [[0, 0], [.78, 0], [.84, .1], [.74, .28], [.66, .42], [.72, .6], [.86, .76], [.9, .88], [.55, .97], [0, 1]]
    : [[0, 0], [.7, 0], [.76, .1], [.75, .25], [.8, .45], [.93, .68], [1, .82], [.92, .93], [.55, .98], [0, 1]];
  const g = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 20); pGeo.set(k, g); return g;
}
export function skirtGeo() {
  if (!pGeo.has('skirt')) pGeo.set('skirt', new THREE.LatheGeometry([[0, 0], [.36, 0], [.31, .35], [.24, .75], [.175, 1], [0, 1]].map(([x, y]) => new THREE.Vector2(x, y)), 20));
  return pGeo.get('skirt');
}

/* ───────────────────────────── buildings ───────────────────────────── */
export function gableGeo(w, rise, tile) {
  const key = 'gable' + w.toFixed(2) + rise.toFixed(2);
  if (pGeo.has(key)) return pGeo.get(key);
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, rise); s.closePath();
  const g = new THREE.ShapeGeometry(s), uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getY(i) / tile);
  pGeo.set(key, g); return g;
}
export function shade(hex, f) { return ((clamp(((hex >> 16) & 255) * f, 0, 255) | 0) << 16) | ((clamp(((hex >> 8) & 255) * f, 0, 255) | 0) << 8) | (clamp((hex & 255) * f, 0, 255) | 0); }

export function buildHouse({ w = 5.1, d = 5.3, wall = 0xe4b65d, roof = 0xa75a43, seed = 1 }) {
  const g = new THREE.Group(), r = rng(seed * 977 + 13);
  const put = (geo, mat, x, y, z, parent = g, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  const wallM = surfaceMat('plaster', wall), trimM = stdMat(0xeceadd, .55), tileM = surfaceMat('tile', roof), concrete = surfaceMat('plaster', 0x9a978a), steel = stdMat(0x3a3f42, .5, .6), whiteM = stdMat(0xf1efe6, .5, .1);
  const H = 2.8, y0 = .12;
  put(scaledBox(w + .16, .34, d + .16, 1.6), concrete, 0, .17, 0);
  put(scaledBox(w, H, d, 2.4, true), wallM, 0, y0 + H / 2, 0);
  const quoin = surfaceMat('plaster', shade(wall, 1.14));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(scaledBox(.16, H, .16, 2, true), quoin, sx * (w / 2 + .005), y0 + H / 2, sz * (d / 2 + .005));
  put(scaledBox(w + .08, .12, d + .08, 1.6), trimM, 0, y0 + H - .06, 0);
  const rise = .95, half = w / 2 + .4, slope = Math.atan2(rise, half), span = Math.hypot(half, rise);
  for (const side of [-1, 1]) {
    const slab = put(scaledBox(span, .13, d + .7, 1.5), tileM, side * half / 2, 3.03 + rise / 2, 0); slab.rotation.z = -side * slope;
    const gut = put(cyl(.055, .055, d + .72, 8), stdMat(0x7e8582, .5, .4), side * (half + .04), 2.97, 0); gut.rotation.x = Math.PI / 2;
    for (const sz of [-1, 1]) { const bb = put(scaledBox(span, .14, .05, 1), whiteM, side * half / 2, 3.03 + rise / 2 - .02, sz * (d / 2 + .37)); bb.rotation.z = -side * slope; }
    put(cyl(.04, .04, 2.85, 8), stdMat(0x8a8d86, .5, .4), side * (w / 2 + .09), 1.55, d / 2 - .22);
  }
  const ridge = put(cyl(.11, .11, d + .8, 8), surfaceMat('tile', shade(roof, .85)), 0, 3.03 + rise + .04, 0); ridge.rotation.x = Math.PI / 2;
  for (const sz of [-1, 1]) { const gb = put(gableGeo(w, rise - .1, 2.4), wallM, 0, 2.93, sz * (d / 2 + (sz > 0 ? .005 : 0))); if (sz < 0) gb.rotation.y = Math.PI; }
  put(bx(.5, .3, .04), stdMat(0x3b3a33, .8), 0, 3.5, d / 2 + .04);
  for (let k = -2; k <= 2; k++) put(bx(.5, .02, .05), trimM, 0, 3.5 + k * .055, d / 2 + .06);
  // chimney
  const chx = w * .22 * (r() > .5 ? 1 : -1);
  put(scaledBox(.55, 1.9, .55, 1.2), surfaceMat('brick', 0x9a5a44), chx, 3.9, -d * .12);
  put(bx(.7, .09, .7), concrete, chx, 4.88, -d * .12);
  put(cyl(.08, .1, .24, 10), steel, chx, 5.0, -d * .12);
  // windows
  const win = (parent, x, y, z, bars = true, shutter = false) => {
    put(bx(1.34, 1.42, .08), trimM, x, y, z + .02, parent);
    put(bx(1.1, 1.18, .05), glassMat(), x, y, z + .06, parent, false);
    put(bx(.96, .98, .02), stdMat(shade(0xe8d9bc, .85 + r() * .3), .95), x, y, z + .03, parent, false);
    put(bx(.04, 1.2, .07), whiteM, x, y, z + .1, parent); put(bx(1.12, .04, .07), whiteM, x, y, z + .1, parent);
    put(bx(1.5, .08, .26), concrete, x, y - .76, z + .1, parent); put(bx(1.44, .09, .1), trimM, x, y + .76, z + .06, parent);
    if (bars) { for (let i = -3; i <= 3; i++) put(bx(.018, 1.2, .022), steel, x + i * .17, y, z + .15, parent, false); for (const h of [-.3, .3]) put(bx(1.2, .02, .025), steel, x, y + h, z + .15, parent, false); }
    if (shutter) for (const s of [-1, 1]) put(scaledBox(.58, 1.3, .05, 1.2), surfaceMat('wood', 0x4f7a58), x + s * .96, y, z + .08, parent);
  };
  for (const wx of [-w * .3, w * .3]) win(g, wx, 1.75, d / 2, true, r() > .5);
  for (const s of [-1, 1]) for (const zz of [-d * .26, d * .24]) { const gp = new THREE.Group(); gp.position.set(s * w / 2, 0, zz); gp.rotation.y = s * Math.PI / 2; g.add(gp); win(gp, 0, 1.75, 0, false); }
  // door
  put(bx(1.16, 2.18, .1), trimM, 0, 1.2, d / 2 + .03);
  put(scaledBox(.92, 2.04, .08, 1.0), surfaceMat('wood', 0x6c452c), 0, 1.15, d / 2 + .1);
  for (const yy of [.62, 1.3]) put(bx(.58, .48, .03), surfaceMat('wood', 0x7a4f33), 0, yy, d / 2 + .15);
  put(sph(.04, 10, 8), stdMat(0xd9c076, .3, .9), .3, 1.12, d / 2 + .17);
  for (let i = -3; i <= 3; i++) put(bx(.022, 2.0, .025), whiteM, i * .13, 1.15, d / 2 + .24, g, false);
  put(bx(.96, .03, .03), whiteM, 0, 1.15, d / 2 + .24); put(bx(.96, .03, .03), whiteM, 0, 2.1, d / 2 + .24);
  put(scaledBox(1.5, .16, .7, 1.2), concrete, 0, .2, d / 2 + .4); put(scaledBox(1.8, .12, .4, 1.2), concrete, 0, .1, d / 2 + .72);
  put(bx(.2, .12, .12), stdMat(0xfff0c0, .4), -.75, 2.4, d / 2 + .12);
  // geyser / solar panel on one roof face
  if (r() > .45) {
    const s = r() > .5 ? 1 : -1, gp = new THREE.Group(); gp.position.set(s * half * .52, 3.03 + rise * (1 - .52) + .14, d * .1); gp.rotation.z = -s * slope; g.add(gp);
    const tank = put(cyl(.2, .2, .95, 14), stdMat(0xe8e8e2, .35, .3), 0, .22, 0, gp); tank.rotation.x = Math.PI / 2;
    put(bx(.04, .02, 1.5), stdMat(0x1d2b46, .15, .7), 0, .06, 0, gp);
    put(bx(.9, .04, 1.5), stdMat(0x1d2b46, .15, .7), 0, .06, 0, gp, false);
  }
  return g;
}

export function buildWallSegment(length) {
  const g = new THREE.Group(), plaster = surfaceMat('plaster', 0xcfc9b6), cap = surfaceMat('plaster', 0x9e9a8c), put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  put(scaledBox(.22, .88, length, 2.4, true), plaster, 0, .55, 0); put(scaledBox(.32, .08, length + .04, 1.5), cap, 0, 1.02, 0);
  for (const s of [-1, 0, 1]) { put(scaledBox(.4, 1.2, .4, 1.5), surfaceMat('brick', 0xa89c8a), 0, .68, s * length * .5); put(scaledBox(.5, .08, .5, 1.5), cap, 0, 1.32, s * length * .5); }
  return g;
}

/* large, non-repeating-looking ground: soft colour blotches, pebbles, grass fringe patches + matching bump */
export function groundMaps(hex, repeat = [16, 16], seed = 99, green = .18) {
  const S = 512, [a, x] = mk(S), [b, y] = mk(S), r = rng(seed);
  x.fillStyle = rgb(hex); x.fillRect(0, 0, S, S); y.fillStyle = '#808080'; y.fillRect(0, 0, S, S);
  const blot = (n, rmin, rmax, fn) => { for (let i = 0; i < n; i++) { const px = r() * S, py = r() * S, rad = rmin + r() * (rmax - rmin); for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const g = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, rad); fn(g); x.fillStyle = g; x.fillRect(px + ox - rad, py + oy - rad, rad * 2, rad * 2); } } };
  blot(60, 40, 150, g => { const d = r() > .5; g.addColorStop(0, d ? 'rgba(70,52,30,.075)' : 'rgba(255,238,205,.065)'); g.addColorStop(1, 'rgba(0,0,0,0)'); });
  blot(Math.round(26 * green * 5), 25, 90, g => { g.addColorStop(0, 'rgba(96,120,52,.2)'); g.addColorStop(1, 'rgba(96,120,52,0)'); });
  for (let i = 0; i < 14000; i++) { const v = 80 + (r() * 150 | 0), s = 1 + r() * 2.4; x.fillStyle = 'rgba(' + v + ',' + (v * .9 | 0) + ',' + (v * .7 | 0) + ',.34)'; x.fillRect(r() * S, r() * S, s, s); const h = 85 + (r() * 90 | 0); y.fillStyle = 'rgb(' + h + ',' + h + ',' + h + ')'; y.fillRect(r() * S, r() * S, s, s); }
  for (let i = 0; i < 380; i++) { const px = r() * S, py = r() * S, rr = 1.4 + r() * 4; x.fillStyle = 'rgba(' + (150 + r() * 60 | 0) + ',' + (138 + r() * 50 | 0) + ',' + (116 + r() * 40 | 0) + ',.85)'; x.beginPath(); x.ellipse(px, py, rr, rr * .75, r() * 3, 0, TAU); x.fill(); y.fillStyle = '#e8e8e8'; y.beginPath(); y.ellipse(px - .5, py - .5, rr, rr * .75, 0, 0, TAU); y.fill(); }
  for (let i = 0; i < 700; i++) { const px = r() * S, py = r() * S, h = 3 + r() * 6; x.strokeStyle = 'rgba(' + (84 + r() * 40 | 0) + ',' + (110 + r() * 50 | 0) + ',48,.55)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - .5) * 4, py - h); x.stroke(); }
  const map = toTex(a), bump = toTex(b, false); map.repeat.set(...repeat); bump.repeat.set(...repeat);
  return { map, bump };
}