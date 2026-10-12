// Overdrafter homepage v3, cover drawing: isometric machine shop and engineering office, as a drafting view.
// Built with the anatomy kit (camera, solids, seams, lathe). Output is slimmed for an inline homepage SVG:
// one path per solid (paper fill + 1.5px silhouette), one path of internal edges at 0.75px, integer coordinates.
// Writes src/shop.svg and src/shop-const.json. Reads the BOM from src/bom.json.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "../../../src");
const BOM = JSON.parse(readFileSync(join(SRC, "bom.json"), "utf8"));

const W = 440, D = 300, HT = 170, WALL = 6;
const P = k.fitProjection([...k.boxCorners({ x: -WALL, y: -WALL, w: W + WALL, d: D + WALL }, -6, HT)], 900, 640, { pad: 92, azimuth: 45 });
const at = (p) => k.iso(p, P);
const f1 = (v) => (Math.round(v * 10) / 10).toString();

/* ---------- path optimiser: integers, no repeated or collinear points, relative moves ---------- */
function opt(d, keepCollinear = false) {
  if (!d) return "";
  const subs = [];
  const re = /([MLZmlz])([^MLZmlz]*)/g; let m, cur = null;
  while ((m = re.exec(d))) {
    const c = m[1].toUpperCase(), nums = (m[2].match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
    if (c === "M") { cur = { pts: [], closed: false }; subs.push(cur); }
    if (c === "Z") { if (cur) cur.closed = true; continue; }
    for (let i = 0; i + 1 < nums.length; i += 2) cur.pts.push([Math.round(nums[i]), Math.round(nums[i + 1])]);
  }
  let out = "";
  for (const s of subs) {
    let p = s.pts.filter((q, i, a) => i === 0 || q[0] !== a[i - 1][0] || q[1] !== a[i - 1][1]);
    if (s.closed && p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) p.pop();
    if (!keepCollinear && p.length > 2) {
      let changed = true;
      while (changed && p.length > 2) { changed = false;
        for (let i = 0; i < p.length; i++) {
          if (!s.closed && (i === 0 || i === p.length - 1)) continue;
          const a = p[(i - 1 + p.length) % p.length], b = p[i], c = p[(i + 1) % p.length];
          if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) === 0) { p.splice(i, 1); changed = true; break; }
        } }
    }
    if (p.length < 2) continue;
    out += "M" + p[0][0] + " " + p[0][1];
    let rel = "";
    for (let i = 1; i < p.length; i++) { const dx = p[i][0] - p[i - 1][0], dy = p[i][1] - p[i - 1][1]; rel += (rel && dx >= 0 ? " " : "") + dx + (dy >= 0 ? " " : "") + dy; }
    out += "l" + rel + (s.closed ? "z" : "");
  }
  return out;
}
const cls = (c) => (c ? ` ${c}` : "");
// a solid: paper fill + silhouette in one path, internal edges in a second
const solidOf = (paths, c) => `<path class="o${cls(c)}" d="${opt(paths.fill)}"/>` + (paths.crease ? `<path class="c" d="${opt(paths.crease)}"/>` : "");
const box = (x, y, z, w, d, h, c) => solidOf(k.slabOf({ x, y, w, d, r: 0 }, z, h, P, 1), c);
const cyl = (cx, cy, r, z, h, c, steps = 16) => solidOf(k.cylinder(cx, cy, r, z, h, P, steps), c);
const line = (d, c = "c") => (d ? `<path class="${c}" d="${opt(d, true)}"/>` : "");
const seg = (a, b) => k.segment(a, b, P);
const fx = (v) => v.toFixed(2).replace(/\.?0+$/, "");
const plane = (m) => m.replace(/-?\d+\.\d+/g, (n) => fx(+n));
const faceY = (Y, x0, z0) => plane(k.sideMatrix([x0, Y], z0, P, "left"));
const faceX = (X, y0, z0) => plane(k.sideMatrix([X, y0], z0, P, "right"));
const LIVE = {};

/* ---------- room ---------- */
function room() {
  const o = [];
  o.push(solidOf(k.slabOf({ x: -WALL, y: -WALL, w: W + WALL, d: D + WALL, r: 0 }, -6, 6, P, 1), "floor"));
  const g = [];
  for (let x = 20; x < W; x += 20) g.push(seg([x, 0, 0], [x, D, 0]));
  for (let y = 20; y < D; y += 20) g.push(seg([0, y, 0], [W, y, 0]));
  o.push(line(g.join(""), "g"));
  o.push(box(-WALL, -WALL, 0, W + WALL, WALL, HT), box(-WALL, 0, 0, WALL, D, HT));
  for (const x0 of [176, 252]) {
    o.push(`<g transform="${faceY(0, x0, 130)}"><path class="c" d="M0 0h60v56H0zM30 0v56M0 28h60"/></g>`);
    o.push(box(x0 - 3, 0, 71, 66, 4, 3));
  }
  o.push(`<g transform="${faceX(0, 284, 136)}"><path class="c" d="M0 0h52v136H0z"/></g>`);
  return o.join("");
}

/* ---------- 4 Fabrication: CNC mill and CNC lathe ---------- */
function fab() {
  const o = [];
  o.push(box(30, 30, 0, 96, 70, 36), line(k.sideSeam({ x: 30, y: 30, w: 96, d: 70, r: 0 }, 8, P, 1)));
  o.push(box(52, 30, 36, 52, 24, 106), line(seg([60, 54, 36], [60, 54, 142]) + seg([96, 54, 36], [96, 54, 142])));
  o.push(`<g data-part="mill-head">${box(62, 54, 104, 32, 26, 30)}${cyl(78, 70, 9, 96, 8)}${cyl(78, 70, 4, 82, 14)}</g>`);
  o.push(`<g data-part="mill-table">${box(38, 62, 36, 80, 30, 8)}${line([0, 1, 2, 3].map((i) => k.lineOnTop([38, 66 + i * 7], [118, 66 + i * 7], 44, P)).join(""))}${box(64, 68, 44, 28, 16, 8)}<path class="h" d="${opt(k.pathOf([[64, 84, 44], [92, 84, 44], [92, 84, 52], [64, 84, 52]].map(at), true))}"/>${box(72, 71, 52, 12, 10, 6, "w")}</g>`);
  o.push(box(160, 40, 0, 140, 46, 48), line(seg([200, 86, 0], [200, 86, 48]) + seg([250, 86, 0], [250, 86, 48])));
  o.push(box(196, 40, 48, 100, 3, 44), box(170, 50, 48, 120, 26, 8));
  o.push(line(k.lineOnTop([196, 56], [290, 56], 56, P) + k.lineOnTop([196, 70], [290, 70], 56, P)));
  o.push(box(162, 42, 48, 34, 42, 46));
  const F = G.frameAlong([196, 63, 74], [1, 0, 0]);
  o.push(solidOf(G.disc(0, 10, 16, F, P, { steps: 24 })), line(k.sideRing([206, 63, 74], 5, "x", P, 12)));
  o.push(`<g data-part="chuck"></g>`);
  o.push(solidOf(G.disc(10, 44, 5, F, P, { steps: 12 }), "w"));
  LIVE.chuck = { x: 206, y: 63, z: 74, r: 16 };
  o.push(box(262, 52, 56, 24, 22, 26));
  o.push(`<g data-part="carriage">${box(226, 46, 56, 24, 38, 8)}${box(230, 60, 64, 16, 22, 5)}${box(233, 70, 69, 10, 10, 10)}</g>`);
  return o.join("");
}

/* ---------- 3 PDM: file server racks, one end cut and hatched ---------- */
function pdm() {
  const o = [], leds = [];
  for (const [ri, x0] of [338, 384].entries()) {
    o.push(box(x0, 6, 0, 42, 40, 134));
    o.push(line(Array.from({ length: 10 }, (_, i) => k.sideSeam({ x: x0, y: 6, w: 42, d: 40, r: 0 }, 14 + i * 12, P, 1)).join("")));
    for (let z = 20; z <= 128; z += 12) leds.push([x0 + 6, 46, z]);
    if (ri === 0) { LIVE.sled = { x: x0 + 4, w: 34, y: 46, z: 63, h: 6 }; o.push(`<g data-part="sled"></g>`); }
  }
  o.push(`<path class="h" d="${opt(k.pathOf([[426, 6, 0], [426, 46, 0], [426, 46, 134], [426, 6, 134]].map(at), true))}"/>`);
  o.push(`<g data-part="leds">${leds.map((p) => { const [x, y] = at(p); return `<circle class="ld" cx="${Math.round(x)}" cy="${Math.round(y)}" r="1.6"/>`; }).join("")}</g>`);
  return o.join("");
}

/* ---------- 6 Marketplace: showroom counter with a display turntable ---------- */
function market() {
  const o = [];
  o.push(box(4, 120, 0, 40, 84, 56), line(seg([44, 148, 0], [44, 148, 56]) + seg([44, 176, 0], [44, 176, 56])));
  o.push(box(2, 116, 56, 46, 92, 4));
  o.push(cyl(24, 142, 13, 60, 3, "", 24));
  o.push(`<g data-part="turn"></g>`);
  LIVE.turn = { cx: 24, cy: 142, z: 63, w: 14, d: 9, h: 9 };
  o.push(box(14, 172, 60, 16, 10, 4, "w"), box(14, 172, 64, 4, 10, 12, "w"));
  return o.join("");
}

/* ---------- desks and monitors ---------- */
function desk(x, y, w, d) {
  return k.corners({ x, y, w, d }, 4).map(([lx, ly]) => box(lx - 1.5, ly - 1.5, 0, 3, 3, 50)).join("") + box(x, y, 50, w, d, 4);
}
function monitor(x, w, h, part) {
  const y = 192, z0 = 60;
  return box(x + w / 2 - 2, y - 2, 54, 4, 3, z0 - 54) + box(x, y, z0, w, 3, h) +
    `<g transform="${faceY(y + 3, x + 2, z0 + h - 2)}"><path class="scr" d="M0 0h${w - 4}v${h - 4}H0z"/><g data-part="${part}"></g></g>`;
}
const analysis = () => box(138, 190, 0, 16, 36, 42) + desk(56, 184, 104, 50) + monitor(62, 42, 28, "fea") + monitor(110, 42, 28, "beam");
const design = () => desk(214, 184, 118, 56) + monitor(240, 64, 38, "cad") + box(304, 192, 54, 18, 10, 3, "w") + box(304, 192, 57, 5, 10, 12, "w");

/* ---------- 5 Fulfillment: conveyor, pallet load, label printer ---------- */
function fulfil() {
  const o = [];
  o.push(`<path class="tape" d="${opt(k.pathOf([[350, 168, 0], [436, 168, 0], [436, 290, 0], [350, 290, 0]].map(at), true))}"/>`);
  for (const [lx, ly] of [[348, 178], [348, 198], [416, 178], [416, 198]]) o.push(box(lx, ly, 0, 3, 3, 26));
  o.push(box(346, 176, 26, 74, 3, 4));
  const rollers = []; for (let x = 352; x < 418; x += 8) rollers.push(k.lineOnTop([x, 179], [x, 199], 29, P));
  o.push(line(rollers.join("")));
  o.push(`<g data-part="parcel">${box(352, 181, 29, 18, 16, 12)}</g>`);
  o.push(box(346, 199, 26, 74, 3, 4));
  for (const y of [222, 246, 270]) o.push(box(372, y, 0, 58, 6, 8));
  o.push(box(372, 222, 8, 58, 54, 2), line([380, 388, 397, 405, 414, 422].map((x) => k.lineOnTop([x, 222], [x, 276], 10, P)).join("")));
  o.push(box(376, 226, 10, 50, 46, 18), line(k.lineOnTop([376, 249], [426, 249], 28, P)));
  o.push(box(388, 236, 28, 28, 24, 14));
  o.push(box(422, 176, 0, 14, 12, 30), box(420, 174, 30, 18, 16, 8));
  return o.join("");
}

/* ---------- drafting layer: hidden lines, dimensions, balloons ---------- */
const arrow = (tip, from, c = "ah") => {
  const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]), l = 9, w = 3.2, b = [tip[0] - Math.cos(ang) * l, tip[1] - Math.sin(ang) * l];
  return `<path class="${c}" d="M${f1(tip[0])} ${f1(tip[1])}L${f1(b[0] + Math.sin(ang) * w)} ${f1(b[1] - Math.cos(ang) * w)}L${f1(b[0] - Math.sin(ang) * w)} ${f1(b[1] + Math.cos(ang) * w)}z"/>`;
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
function dim(a, b, off, text) {
  const A = at(a), B = at(b), Ao = at(off[0]), Bo = at(off[1]), q = .9;
  const Ai = [Ao[0] * q + A[0] * (1 - q), Ao[1] * q + A[1] * (1 - q)], Bi = [Bo[0] * q + B[0] * (1 - q), Bo[1] * q + B[1] * (1 - q)];
  let s = `<path class="ext" d="M${f1(A[0])} ${f1(A[1])}L${f1(Ao[0])} ${f1(Ao[1])}M${f1(B[0])} ${f1(B[1])}L${f1(Bo[0])} ${f1(Bo[1])}M${f1(Ai[0])} ${f1(Ai[1])}L${f1(Bi[0])} ${f1(Bi[1])}"/>` + arrow(Ai, Bi) + arrow(Bi, Ai);
  let ang = Math.atan2(Bi[1] - Ai[1], Bi[0] - Ai[0]) * 180 / Math.PI; if (ang > 90 || ang < -90) ang += 180;
  const r = ang * Math.PI / 180;
  return s + `<text class="dt" text-anchor="middle" transform="translate(${f1((Ai[0] + Bi[0]) / 2 + Math.sin(r) * 9)},${f1((Ai[1] + Bi[1]) / 2 - Math.cos(r) * 9)}) rotate(${f1(ang)})">${esc(text)}</text>`;
}
// balloon anchor (world point on the zone) and offset in screen units; all balloons sit outside the room silhouette
const SPOTS = JSON.parse(readFileSync(join(HERE, "balloons.json"), "utf8"));
const ballAt = (s) => (s.ball ? at(s.ball) : [at(s.at)[0] + s.off[0], at(s.at)[1] + s.off[1]]);
function balloons() {
  return BOM.map(([n, pn, desc, z, zn]) => {
    const p = at(SPOTS[z].at), q = ballAt(SPOTS[z]), r = 15;
    const m = Math.hypot(p[0] - q[0], p[1] - q[1]), st = [q[0] + (p[0] - q[0]) / m * r, q[1] + (p[1] - q[1]) / m * r];
    const title = desc.length <= 3 ? desc : desc.charAt(0) + desc.slice(1).toLowerCase();
    return `<g class="z zc" data-zone="${z}" tabindex="-1" role="button" aria-label="Balloon ${n}, ${esc(zn)}: ${esc(title)}, part ${pn}. Highlights item ${n} in the bill of materials">` +
      `<path class="lead" d="M${f1(st[0])} ${f1(st[1])}L${f1(p[0])} ${f1(p[1])}"/>${arrow(p, q)}` +
      `<circle class="hit" cx="${f1(q[0])}" cy="${f1(q[1])}" r="24"/><circle class="ring" cx="${f1(q[0])}" cy="${f1(q[1])}" r="${r + 4}"/>` +
      `<circle class="bal" cx="${f1(q[0])}" cy="${f1(q[1])}" r="${r}"/><text class="bt" x="${f1(q[0])}" y="${f1(q[1] + 5.5)}" text-anchor="middle">${n}</text></g>`;
  }).join("");
}

const ZONES = [["fab", fab, [150, 60]], ["market", market, [24, 160]], ["pdm", pdm, [380, 26]], ["analysis", analysis, [108, 220]], ["design", design, [273, 220]], ["fulfil", fulfil, [400, 230]]];
ZONES.sort((a, b) => k.depthOf([...a[2], 0], P) - k.depthOf([...b[2], 0], P));
const defs = `<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v8" class="hl"/></pattern></defs>`;
const body = [defs, room(), ...ZONES.map(([z, fn]) => `<g class="z" data-zone="${z}">${fn()}</g>`),
  line(seg([0, 0, 0], [W, 0, 0]) + seg([0, 0, 0], [0, D, 0]), "hid"),
  `<g class="dims" aria-hidden="true">` + dim([0, D, 0], [W, D, 0], [[0, D + 48, 0], [W, D + 48, 0]], "EVERY MACHINE SHOP") +
  dim([W, 0, 0], [W, D, 0], [[W + 48, 0, 0], [W + 48, D, 0]], "ONE UPLOAD") + `</g>`, balloons()];

const ext = [];
for (const p of k.boxCorners({ x: -WALL, y: -WALL, w: W + WALL, d: D + WALL }, -6, HT)) ext.push(at(p));
for (const p of [[0, D + 60, 0], [W, D + 60, 0], [W + 60, 0, 0], [W + 60, D, 0]]) ext.push(at(p));
for (const sp of Object.values(SPOTS)) { const q = ballAt(sp); ext.push([q[0] - 24, q[1] - 24], [q[0] + 24, q[1] + 24]); }
const PAD = 2, X0 = Math.min(...ext.map((p) => p[0])) - PAD, Y0 = Math.min(...ext.map((p) => p[1])) - PAD;
const VB = `${Math.floor(X0)} ${Math.floor(Y0)} ${Math.ceil(Math.max(...ext.map((p) => p[0])) + PAD - X0)} ${Math.ceil(Math.max(...ext.map((p) => p[1])) + PAD - Y0)}`;
const svg = `<svg class="iso shop" viewBox="${VB}" role="group" aria-labelledby="iso-t"><title id="iso-t">Isometric view of a machine shop and engineering office: a CAD desk, an analysis workstation, file server racks, a CNC mill and lathe, a shipping dock and a showroom counter. Balloons one to six link each zone to its line in the bill of materials.</title>${body.join("")}</svg>`;
writeFileSync(join(SRC, "shop.svg"), svg);
LIVE.P = { origin: P.origin.map((v) => +v.toFixed(3)), scale: +P.scale.toFixed(5), azimuth: P.azimuth, elevation: P.elevation };
writeFileSync(join(SRC, "shop-const.json"), JSON.stringify(LIVE));
console.log("wrote shop.svg", (svg.length / 1024).toFixed(1) + " KB", "paths", (svg.match(/<path/g) || []).length, "solids", (svg.match(/class="o/g) || []).length);
