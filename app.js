import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============================================================
   Plano IMIX Suite 10C — reconstruido desde la imagen (px -> m)
   Escala calibrada con las camas del plano (~1.52 x 2.0 m).
   El plano es aproximado: verifica medidas reales antes de comprar.
   ============================================================ */
const S = 0.0157, X0 = 262, Y0 = 615;          // m por px, origen = esquina del patio
const wx = px => (px - X0) * S;
const wz = py => (py - Y0) * S;
const rectOf = ([x1, y1, x2, y2]) => ({ cx: wx((x1 + x2) / 2), cz: wz((y1 + y2) / 2), w: (x2 - x1) * S, d: (y2 - y1) * S });
const WALL_H = 2.5, LOW_H = 0.55;

const WALLS = [
  [262, 765, 277, 1378], [262, 1355, 750, 1378], [738, 1225, 750, 1378],
  [645, 1225, 680, 1240], [628, 765, 645, 1182], [585, 1182, 645, 1225],
  [277, 978, 372, 986], [425, 980, 433, 1135], [277, 1080, 433, 1100],
  [277, 1190, 380, 1197], [445, 810, 455, 921], [445, 915, 492, 921],
  [518, 1197, 525, 1300], [620, 615, 645, 765],
];

const FLOORS = [
  { r: [277, 775, 628, 1197], k: 'wood' }, { r: [277, 1197, 645, 1225], k: 'wood' },
  { r: [277, 1225, 738, 1355], k: 'wood' }, { r: [268, 615, 628, 765], k: 'deck' },
  { r: [277, 986, 425, 1080], k: 'tile', y: .004 }, { r: [277, 1100, 433, 1190], k: 'tile', y: .004 },
];

const ROOMS = [
  ['RECÁMARA PRINCIPAL', 360, 800], ['SALA', 545, 800], ['COCINA / COMEDOR', 510, 1160],
  ['BAÑO', 352, 1010], ['BAÑO', 352, 1170], ['RECÁMARA 2', 400, 1215], ['ENTRADA', 650, 1270], ['PATIO', 440, 740],
];

// Fijos: [rect px, alto, color, y0, opciones]
const FIXTURES = [
  [[592, 980, 628, 1150], .9, '#4a4e54'],               // barra cocina
  [[590, 978, 630, 1152], .04, '#b9b3aa', .9],          // cubierta
  [[592, 1150, 628, 1182], 1.85, '#b9bec5'],
  [[606, 985, 628, 1150], .75, '#4a4e54', 1.45],        // gabinetes altos            // refri
  [[596, 1060, 624, 1105], .02, '#101214', .94],        // estufa
  [[596, 995, 624, 1030], .02, '#7d8791', .94],         // fregadero
  [[340, 1030, 364, 1070], .4, '#f3f3f1'],              // WC 1
  [[388, 1048, 430, 1076], .85, '#3d4046'],             // lavabo 1
  [[340, 1104, 364, 1146], .4, '#f3f3f1'],              // WC 2
  [[388, 1104, 430, 1130], .85, '#3d4046'],             // lavabo 2
  [[280, 1104, 324, 1188], .55, '#f6f6f4'],             // tina
  [[530, 1308, 572, 1350], .88, '#e8e9ec'],             // lavadora/secadora
];
const GLASS = [  // [rect px, alto, y0]
  [[277, 765, 628, 775], WALL_H, 0], [[277, 986, 325, 1080], 2.1, 0],   // ventanal, regadera
  [[262, 612, 620, 618], 1.05, 0], [[262, 612, 268, 765], 1.05, 0],      // barandal patio
];
const COLLIDERS = [...WALLS, [277, 765, 628, 775], [314, 1205, 320, 1350],
  ...FIXTURES.filter(f => (f[3] || 0) === 0).map(f => f[0])].map(rectOf);

/* ============================================================
   Catálogo de muebles (medidas reales en metros)
   ============================================================ */
const CATALOG = {
  bed_queen:  { n: 'Cama Queen', cat: 'Recámara', w: 1.52, d: 2.03, c: '#8fa3b8', em: '🛏️', b: 'bed' },
  bed_king:   { n: 'Cama King', cat: 'Recámara', w: 1.93, d: 2.03, c: '#8fa3b8', em: '🛏️', b: 'bed' },
  bed_single: { n: 'Cama Individual', cat: 'Recámara', w: .99, d: 1.9, c: '#8fa3b8', em: '🛏️', b: 'bed' },
  nightstand: { n: 'Buró', cat: 'Recámara', w: .45, d: .4, h: .5, c: '#b08968', em: '🗄️', b: 'cabinet' },
  dresser:    { n: 'Cómoda', cat: 'Recámara', w: 1.2, d: .5, h: .85, c: '#b08968', em: '🗄️', b: 'dresser' },
  wardrobe:   { n: 'Armario', cat: 'Recámara', w: 1.0, d: .6, h: 2.0, c: '#e8e2d8', em: '🚪', b: 'wardrobe' },
  sofa3:      { n: 'Sofá 3 plazas', cat: 'Sala', w: 2.1, d: .92, c: '#e8e2d8', em: '🛋️', b: 'sofa' },
  sofa2:      { n: 'Sofá 2 plazas', cat: 'Sala', w: 1.6, d: .92, c: '#6b7a8f', em: '🛋️', b: 'sofa' },
  armchair:   { n: 'Sillón', cat: 'Sala', w: .85, d: .85, c: '#c97b4a', em: '💺', b: 'sofa' },
  coffee:     { n: 'Mesa de centro', cat: 'Sala', w: 1.0, d: .55, h: .4, c: '#b08968', em: '☕', b: 'table' },
  coffee_r:   { n: 'Mesa centro redonda', cat: 'Sala', w: .8, d: .8, h: .4, c: '#3b3f46', em: '⚫', b: 'round' },
  side:       { n: 'Mesa lateral', cat: 'Sala', w: .5, d: .5, h: .5, c: '#b08968', em: '⚪', b: 'round' },
  tv:         { n: 'Mueble TV', cat: 'Sala', w: 1.5, d: .4, h: .5, c: '#3b3f46', em: '📺', b: 'tv' },
  shelf:      { n: 'Librero', cat: 'Sala', w: .8, d: .3, h: 1.8, c: '#b08968', em: '📚', b: 'shelf' },
  dining:     { n: 'Mesa comedor', cat: 'Comedor', w: 1.2, d: .8, h: .75, c: '#b08968', em: '🍽️', b: 'table' },
  round:      { n: 'Mesa redonda', cat: 'Comedor', w: .9, d: .9, h: .75, c: '#e8e2d8', em: '⭕', b: 'round' },
  chair:      { n: 'Silla', cat: 'Comedor', w: .45, d: .45, h: .9, c: '#3b3f46', em: '🪑', b: 'chair' },
  stool:      { n: 'Banco alto', cat: 'Comedor', w: .4, d: .4, h: .65, c: '#3b3f46', em: '🪑', b: 'stool' },
  desk:       { n: 'Escritorio', cat: 'Oficina', w: 1.2, d: .6, h: .75, c: '#e8e2d8', em: '🖥️', b: 'table' },
  deskchair:  { n: 'Silla oficina', cat: 'Oficina', w: .55, d: .55, h: .9, c: '#2b2e33', em: '🪑', b: 'chair' },
  rug:        { n: 'Tapete 2×1.4', cat: 'Deco', w: 2.0, d: 1.4, h: .02, c: '#d9cdb8', em: '🟫', b: 'rug', rug: 1 },
  rug_s:      { n: 'Tapete 1.6×1', cat: 'Deco', w: 1.6, d: 1.0, h: .02, c: '#c8c2b8', em: '🟫', b: 'rug', rug: 1 },
  plant:      { n: 'Planta', cat: 'Deco', w: .4, d: .4, h: 1.2, c: '#5f9d4c', em: '🌿', b: 'plant' },
  lamp:       { n: 'Lámpara pie', cat: 'Deco', w: .35, d: .35, h: 1.6, c: '#f2d9a0', em: '💡', b: 'lamp' },
};
const CATS = ['Recámara', 'Sala', 'Comedor', 'Oficina', 'Deco'];
const PALETTE = ['#6b7a8f', '#8fa3b8', '#c97b4a', '#b08968', '#e8e2d8', '#3b3f46', '#5f9d4c', '#c75b5b', '#d9b44a'];

// Layout sugerido (px del plano, rotación en grados). Cabecera/respaldo mira a -Z local.
const px = (x, y) => [wx(x), wz(y)];
const SUGGESTED = [
  ['bed_queen', ...px(344, 878), 90], ['nightstand', ...px(291, 806), 90], ['nightstand', ...px(291, 950), 90],
  ['sofa3', ...px(598, 845), -90], ['coffee_r', ...px(530, 848), 0], ['rug', ...px(535, 850), 90],
  ['tv', ...px(468, 862), 90], ['plant', ...px(478, 790), 0],
  ['round', ...px(500, 1068), 0], ['chair', ...px(455, 1068), 90],
  ['chair', ...px(545, 1050), -90], ['chair', ...px(545, 1088), -90],
  ['bed_queen', ...px(418, 1288), 180], ['nightstand', ...px(352, 1334), 180], ['nightstand', ...px(484, 1334), 180],
  ['desk', ...px(497, 1255), -90],
  ['plant', ...px(600, 700), 0], ['side', ...px(440, 695), 0], ['armchair', ...px(350, 690), 150], ['armchair', ...px(530, 690), 210],
].map(([type, x, z, deg], i) => ({ id: i + 1, type, x, z, rot: deg * Math.PI / 180, color: CATALOG[type].c }));

/* ============================================================
   Escena
   ============================================================ */
const $ = s => document.querySelector(s);
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#12151b');
const camera = new THREE.PerspectiveCamera(42, 1, .1, 120);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = false;
controls.maxPolarAngle = Math.PI / 2 - .02;
controls.minDistance = .05; controls.maxDistance = 40;
controls.screenSpacePanning = true;

scene.add(new THREE.HemisphereLight('#ffffff', '#6b6458', 1.25));
const sun = new THREE.DirectionalLight('#fff3df', 1.6);
sun.position.set(2, 14, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 11, bottom: -11, near: 1, far: 40 });
sun.shadow.bias = -.0004;
sun.target.position.set(wx(500), 0, wz(1000));
scene.add(sun, sun.target);

const CENTER = new THREE.Vector3(wx(500), 0, wz(1000));
let dirty = true;
const redraw = () => { dirty = true; };

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .78, metalness: .04, ...o });
const glassMat = new THREE.MeshStandardMaterial({ color: '#9ec9e8', transparent: true, opacity: .22, roughness: .1, depthWrite: false });

function canvasTex(draw, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const TEX = {
  wood: canvasTex((g, n) => {
    g.fillStyle = '#a89c90'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 8; i++) {
      g.fillStyle = `hsl(28 ${9 + (i * 7) % 8}% ${52 + (i * 11) % 10}%)`;
      g.fillRect(0, i * n / 8, n, n / 8 - 2);
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, i * n / 8 + n / 8 - 2, n, 2);
      g.fillRect((i * 97) % n, i * n / 8, 2, n / 8);
    }
  }),
  tile: canvasTex((g, n) => {
    g.fillStyle = '#5d5f62'; g.fillRect(0, 0, n, n);
    g.strokeStyle = '#3f4143'; g.lineWidth = 3; g.strokeRect(0, 0, n, n);
  }),
  deck: canvasTex((g, n) => {
    g.fillStyle = '#8b8378'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, i * n / 6, n, 3); }
  }),
};

function floorMesh({ r, k, y = 0 }) {
  const { cx, cz, w, d } = rectOf(r);
  const t = TEX[k].clone(); t.needsUpdate = true;
  const rep = k === 'tile' ? .6 : 1.2;
  t.repeat.set(w / rep, d / rep);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat('#ffffff', { map: t, roughness: .6 }));
  m.rotation.x = -Math.PI / 2; m.position.set(cx, y, cz); m.receiveShadow = true;
  return m;
}
FLOORS.forEach(f => scene.add(floorMesh(f)));

function roomLabel(text, x, y) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const g = c.getContext('2d'); g.font = '600 40px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(20,24,30,.42)'; g.fillText(text, 256, 50);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .41), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(wx(x), .012, wz(y)); m.renderOrder = 2;
  scene.add(m);
}
ROOMS.forEach(r => roomLabel(...r));

// Muros
const wallMeshes = [];
const wallMat = mat('#e4e0d9', { roughness: .9 });
WALLS.forEach(w => {
  const { cx, cz, w: ww, d } = rectOf(w);
  const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), wallMat);
  m.userData = { cx, cz, ww, d }; m.castShadow = m.receiveShadow = true;
  scene.add(m); wallMeshes.push(m);
});
const glassMeshes = GLASS.map(([r, h, y0]) => {
  const { cx, cz, w, d } = rectOf(r);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat);
  m.position.set(cx, y0 + h / 2, cz); m.renderOrder = 3; scene.add(m);
  m.userData.full = h === WALL_H; return m;
});
// postes del ventanal
const mull = [];
for (let i = 0; i <= 5; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(.05, WALL_H, .14), mat('#2b2e33'));
  m.position.set(wx(277) + i * (wx(628) - wx(277)) / 5, WALL_H / 2, wz(770)); scene.add(m); mull.push(m);
}
// closet recámara 2 (puertas corredizas)
{
  const { cx, cz, w, d } = rectOf([314, 1205, 320, 1350]);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2.2, d), mat('#f0ede8'));
  m.position.set(cx, 1.1, cz); m.castShadow = true; scene.add(m);
  wallMeshes.push(Object.assign(m, { userData: { fixedH: true } }));
}
FIXTURES.forEach(([r, h, c, y0 = 0]) => {
  const { cx, cz, w, d } = rectOf(r);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  m.position.set(cx, y0 + h / 2, cz); m.castShadow = m.receiveShadow = true; scene.add(m);
  if (y0 >= 1) mull.push(m); // gabinetes altos: solo con muros altos
});

let wallMode = 1; // 0 altos, 1 bajos, 2 ocultos
function applyWalls() {
  const h = [WALL_H, LOW_H, 0.001][wallMode];
  wallMeshes.forEach(m => {
    if (m.userData.fixedH) { m.visible = wallMode === 0; return; }
    const { cx, cz, ww, d } = m.userData;
    m.scale.set(ww, h, d); m.position.set(cx, h / 2, cz); m.visible = wallMode < 2;
  });
  glassMeshes.forEach(m => { m.visible = m.userData.full ? wallMode === 0 : wallMode < 2; });
  mull.forEach(m => m.visible = wallMode === 0);
  const names = ['altos', 'bajos', 'ocultos'];
  $('#wallsBtn').textContent = 'Muros: ' + names[wallMode];
  redraw();
}

/* ============================================================
   Constructores de muebles (origen en el piso, respaldo hacia -Z)
   ============================================================ */
function part(g, w, h, d, x, y, z, m) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; g.add(mesh); return mesh;
}
function cyl(g, rt, rb, h, x, y, z, m, seg = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; g.add(mesh); return mesh;
}
const shade = (c, k) => new THREE.Color(c).offsetHSL(0, 0, k);

const BUILD = {
  bed(g, it, { w, d }, c) {
    const wood = mat('#8a6a4a'), main = mat(c), white = mat('#f4f1eb');
    part(g, w, .28, d, 0, .14, 0, wood);
    part(g, w - .04, .2, d - .08, 0, .38, .03, white);
    part(g, w, .95, .08, 0, .475, -d / 2 + .04, main);
    part(g, w - .02, .07, d * .62, 0, .52, d * .17, main);
    const pw = w > 1.2 ? w / 2 - .12 : w - .2;
    (w > 1.2 ? [-1, 1] : [0]).forEach(s => part(g, pw, .13, .36, s * (w / 4), .58, -d / 2 + .38, white));
  },
  cabinet(g, it, { w, d, h }, c) {
    part(g, w, h, d, 0, h / 2, 0, mat(c));
    part(g, w - .06, .015, .01, 0, h * .7, d / 2 + .001, mat(shade(c, -.2)));
    part(g, w - .06, .015, .01, 0, h * .35, d / 2 + .001, mat(shade(c, -.2)));
  },
  dresser(g, it, { w, d, h }, c) {
    part(g, w, h, d, 0, h / 2, 0, mat(c));
    [.2, .5, .8].forEach(k => part(g, w - .06, .012, .01, 0, h * k, d / 2 + .001, mat(shade(c, -.22))));
  },
  wardrobe(g, it, { w, d, h }, c) {
    part(g, w, h, d, 0, h / 2, 0, mat(c));
    part(g, .012, h - .1, .01, 0, h / 2, d / 2 + .001, mat(shade(c, -.25)));
    [-1, 1].forEach(s => part(g, .02, .35, .02, s * .05, h * .5, d / 2 + .015, mat('#555b63')));
  },
  sofa(g, it, { w, d }, c) {
    const m = mat(c), mc = mat(shade(c, .06));
    part(g, w, .22, d, 0, .2, 0, mat(shade(c, -.2)));
    part(g, w, .5, .22, 0, .56, -d / 2 + .11, m);
    const arm = w > 1.2 ? .2 : .14;
    [-1, 1].forEach(s => part(g, arm, .32, d - .2, s * (w / 2 - arm / 2), .4, .1 - .0, m));
    const n = w > 1.8 ? 3 : w > 1.2 ? 2 : 1, cw = (w - 2 * arm) / n;
    for (let i = 0; i < n; i++) part(g, cw - .02, .16, d - .34, -((n - 1) * cw) / 2 + i * cw, .38, .1, mc);
    for (let i = 0; i < n; i++) part(g, cw - .06, .38, .12, -((n - 1) * cw) / 2 + i * cw, .62, -d / 2 + .27, mc).rotation.x = -.18;
  },
  table(g, it, { w, d, h }, c) {
    part(g, w, .04, d, 0, h - .02, 0, mat(c));
    const lm = mat(shade(c, -.25));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => part(g, .05, h - .04, .05, a * (w / 2 - .06), (h - .04) / 2, b * (d / 2 - .06), lm));
  },
  round(g, it, { w, h }, c) {
    cyl(g, w / 2, w / 2, .04, 0, h - .02, 0, mat(c), 32);
    cyl(g, .05, .05, h - .06, 0, (h - .06) / 2, 0, mat('#555b63'));
    cyl(g, w * .28, w * .28, .03, 0, .015, 0, mat('#555b63'), 24);
  },
  chair(g, it, { w, d, h }, c) {
    const m = mat(c);
    part(g, w, .06, d, 0, .45, 0, m);
    part(g, w, h - .5, .05, 0, .5 + (h - .5) / 2, -d / 2 + .03, m);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => part(g, .04, .43, .04, a * (w / 2 - .04), .215, b * (d / 2 - .04), mat('#555b63')));
  },
  stool(g, it, { w, h }, c) {
    cyl(g, w / 2, w / 2, .05, 0, h - .025, 0, mat(c));
    cyl(g, .025, .025, h - .05, 0, (h - .05) / 2, 0, mat('#555b63'));
    cyl(g, .18, .18, .02, 0, .01, 0, mat('#555b63'));
  },
  tv(g, it, { w, d, h }, c) {
    part(g, w, h, d, 0, h / 2, 0, mat(c));
    part(g, 1.2, .7, .04, 0, h + .38, 0, mat('#0c0d0f'));
    part(g, .3, .03, .15, 0, h + .015, 0, mat('#0c0d0f'));
  },
  shelf(g, it, { w, d, h }, c) {
    const m = mat(c);
    part(g, .03, h, d, -w / 2 + .015, h / 2, 0, m); part(g, .03, h, d, w / 2 - .015, h / 2, 0, m);
    part(g, w, h, .02, 0, h / 2, -d / 2 + .01, mat(shade(c, -.1)));
    for (let i = 0; i <= 5; i++) part(g, w - .06, .03, d, 0, .03 + i * (h - .06) / 5, 0, m);
  },
  rug(g, it, { w, d, h }, c) { part(g, w, h, d, 0, h / 2, 0, mat(c, { roughness: 1 })).castShadow = false; },
  plant(g, it, { w, h }, c) {
    cyl(g, .18, .13, .32, 0, .16, 0, mat('#b9694a'));
    const lm = mat(c);
    [[0, .75, 0, .3], [.1, 1.0, .05, .22], [-.1, .55, .08, .2]].forEach(([x, y, z, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), lm); s.position.set(x, y, z); s.castShadow = true; g.add(s);
    });
  },
  lamp(g, it, { h }, c) {
    cyl(g, .14, .14, .03, 0, .015, 0, mat('#2b2e33'));
    cyl(g, .014, .014, h - .3, 0, (h - .3) / 2, 0, mat('#2b2e33'));
    cyl(g, .11, .17, .3, 0, h - .15, 0, mat(c, { emissive: c, emissiveIntensity: .35 }));
  },
};

/* ============================================================
   Estado + muebles
   ============================================================ */
const STORE = 'imix10c-layout-v1';
let items = [];
let nextId = 1;
const groups = new Map();
let selectedId = null;
let units = 'm', snap = .05;

function dimsOf(it) { const k = CATALOG[it.type]; return { w: k.w, d: k.d, h: k.h || 1 }; }

function buildGroup(it) {
  const k = CATALOG[it.type], g = new THREE.Group();
  BUILD[k.b](g, it, { w: k.w, d: k.d, h: k.h || 1 }, it.color);
  g.userData.id = it.id;
  g.userData.mats = [];
  g.traverse(o => { if (o.isMesh) { const m = o.material; m.userData.baseEm = '#' + m.emissive.getHexString(); m.userData.baseI = m.emissiveIntensity; g.userData.mats.push(m); } });
  place(g, it);
  return g;
}
function place(g, it) { g.position.set(it.x, 0, it.z); g.rotation.y = it.rot; }

function addGroup(it) {
  const g = buildGroup(it);
  groups.set(it.id, g); scene.add(g);
}
function removeGroup(id) {
  const g = groups.get(id); if (!g) return;
  scene.remove(g);
  g.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  groups.delete(id);
}
function loadItems(list) {
  [...groups.keys()].forEach(removeGroup);
  items = list.map(i => ({ ...i }));
  nextId = items.reduce((m, i) => Math.max(m, i.id), 0) + 1;
  items.forEach(addGroup);
  select(null); checkCollisions(); save(); redraw();
}
const byId = id => items.find(i => i.id === id);

// Colisiones (SAT sobre rectángulos orientados)
function corners(cx, cz, w, d, rot) {
  const c = Math.cos(rot), s = Math.sin(rot), hw = w / 2, hd = d / 2;
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, z]) => [cx + x * c + z * s, cz - x * s + z * c]);
}
function overlap(A, B) {
  for (const poly of [A, B]) {
    for (let i = 0; i < 4; i++) {
      const p = poly[i], q = poly[(i + 1) % 4];
      const ax = -(q[1] - p[1]), az = q[0] - p[0];
      let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
      A.forEach(v => { const t = v[0] * ax + v[1] * az; a0 = Math.min(a0, t); a1 = Math.max(a1, t); });
      B.forEach(v => { const t = v[0] * ax + v[1] * az; b0 = Math.min(b0, t); b1 = Math.max(b1, t); });
      const len = Math.hypot(ax, az);
      if ((a1 - b0) / len < .01 || (b1 - a0) / len < .01) return false;
    }
  }
  return true;
}
const COLL_POLYS = COLLIDERS.map(r => corners(r.cx, r.cz, r.w, r.d, 0));
function checkCollisions() {
  const polys = items.map(it => { const k = CATALOG[it.type]; return corners(it.x, it.z, k.w, k.d, it.rot); });
  const bad = new Set();
  items.forEach((it, i) => {
    if (CATALOG[it.type].rug) return;
    if (COLL_POLYS.some(p => overlap(polys[i], p))) bad.add(it.id);
    items.forEach((o, j) => { if (j > i && !CATALOG[o.type].rug && overlap(polys[i], polys[j])) { bad.add(it.id); bad.add(o.id); } });
  });
  items.forEach(it => {
    const g = groups.get(it.id), on = bad.has(it.id);
    g.userData.mats.forEach(m => { m.emissive.set(on ? '#ff2d2d' : (m.userData.baseEm || '#000000')); m.emissiveIntensity = on ? .55 : (m.userData.baseI ?? 0); });
    it.hit = on;
  });
  updateSelUI();
}

function save() {
  try { localStorage.setItem(STORE, JSON.stringify({ v: 1, units, wallMode, items: items.map(({ hit, ...r }) => r) })); } catch { }
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (d && Array.isArray(d.items)) { units = d.units || 'm'; wallMode = d.wallMode ?? 1; return d.items; }
  } catch { }
  return null;
}

/* ============================================================
   Selección + arrastre
   ============================================================ */
const ring = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#f37b2c', depthTest: false }));
ring.renderOrder = 10; ring.visible = false; scene.add(ring);

function select(id) {
  selectedId = id;
  ring.visible = id != null;
  if (id != null) {
    const k = CATALOG[byId(id).type], pad = .04;
    const hw = k.w / 2 + pad, hd = k.d / 2 + pad;
    ring.geometry.setFromPoints([[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, z]) => new THREE.Vector3(x, .03, z)));
    syncRing();
  }
  $('#sel').hidden = id == null;
  buildSwatches(); updateSelUI(); layoutTray(); redraw();
}
function syncRing() {
  const it = byId(selectedId); if (!it) return;
  ring.position.set(it.x, 0, it.z); ring.rotation.y = it.rot;
}
const fmt = m => units === 'm' ? m.toFixed(2).replace(/\.?0+$/, '') + ' m' : (m * 3.28084).toFixed(1) + ' ft';
function updateSelUI() {
  const it = byId(selectedId); if (!it) return;
  const k = CATALOG[it.type];
  $('#selName').textContent = k.n;
  const dim = `${fmt(k.w)} × ${fmt(k.d)}${k.h && !k.rug ? ' × ' + fmt(k.h) : ''}`;
  $('#selDims').textContent = ' · ' + dim + (it.hit ? ' · ⚠ choca' : '');
  $('#selDims').className = it.hit ? 'warn' : '';
}
function buildSwatches() {
  const box = $('#swatches'); box.innerHTML = '';
  const it = byId(selectedId); if (!it) return;
  PALETTE.forEach(c => {
    const i = document.createElement('i'); i.style.background = c; if (c === it.color) i.className = 'on';
    i.onclick = () => { it.color = c; removeGroup(it.id); addGroup(it); checkCollisions(); buildSwatches(); save(); redraw(); };
    box.appendChild(i);
  });
}

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function setNDC(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}
function groundPoint(e) { setNDC(e); const p = new THREE.Vector3(); return ray.ray.intersectPlane(ground, p) ? p : null; }
function pick(e) {
  setNDC(e);
  const hits = ray.intersectObjects([...groups.values()], true);
  for (const h of hits) { let o = h.object; while (o && o.userData.id == null) o = o.parent; if (o) return o.userData.id; }
  return null;
}

let drag = null;
canvas.addEventListener('pointerdown', e => {
  const id = pick(e);
  hideHint();
  if (id == null) { drag = { none: true, x: e.clientX, y: e.clientY }; return; }
  e.stopImmediatePropagation();
  controls.enabled = false;
  select(id);
  const it = byId(id), p = groundPoint(e);
  drag = { id, off: p ? new THREE.Vector2(it.x - p.x, it.z - p.z) : new THREE.Vector2(), moved: false, x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
}, { capture: true });

canvas.addEventListener('pointermove', e => {
  if (!drag || drag.none) return;
  if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 3) drag.moved = true;
  if (!drag.moved) return;
  const p = groundPoint(e); if (!p) return;
  const it = byId(drag.id);
  let x = p.x + drag.off.x, z = p.z + drag.off.y;
  if (snap) { x = Math.round(x / snap) * snap; z = Math.round(z / snap) * snap; }
  it.x = THREE.MathUtils.clamp(x, wx(255), wx(760)); it.z = THREE.MathUtils.clamp(z, wz(600), wz(1385));
  place(groups.get(it.id), it); syncRing(); checkCollisions(); redraw();
});
const endDrag = e => {
  if (!drag) return;
  if (drag.none) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) select(null); }
  else { controls.enabled = true; save(); }
  drag = null;
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

function mutateSel(fn) {
  const it = byId(selectedId); if (!it) return;
  fn(it); place(groups.get(it.id), it); syncRing(); checkCollisions(); save(); redraw();
}
const rotate = deg => mutateSel(it => { it.rot += deg * Math.PI / 180; });
$('#rotL').onclick = () => rotate(15);
$('#rotR').onclick = () => rotate(-15);
$('#rot90').onclick = () => rotate(-90);
$('#selClose').onclick = () => select(null);
$('#del').onclick = () => {
  const id = selectedId; if (id == null) return;
  removeGroup(id); items = items.filter(i => i.id !== id); select(null); checkCollisions(); save(); redraw();
};
$('#dup').onclick = () => {
  const it = byId(selectedId); if (!it) return;
  const c = { ...it, id: nextId++, x: it.x + .3, z: it.z + .3, hit: false };
  items.push(c); addGroup(c); select(c.id); checkCollisions(); save();
};
addEventListener('keydown', e => {
  if (e.key === 'Delete' || e.key === 'Backspace') $('#del').click();
  else if (e.key === 'r' || e.key === 'R') rotate(e.shiftKey ? 15 : -90);
  else if (e.key === 'Escape') select(null);
  else if (selectedId != null && e.key.startsWith('Arrow')) {
    const st = e.shiftKey ? .01 : .05, k = e.key;
    mutateSel(it => { if (k === 'ArrowLeft') it.x -= st; if (k === 'ArrowRight') it.x += st; if (k === 'ArrowUp') it.z -= st; if (k === 'ArrowDown') it.z += st; });
    e.preventDefault();
  }
});

/* ============================================================
   Catálogo (bandeja inferior)
   ============================================================ */
let tab = CATS[0];
function buildTabs() {
  const t = $('#tabs'); t.innerHTML = '';
  CATS.forEach(c => {
    const b = document.createElement('button'); b.textContent = c; if (c === tab) b.className = 'on';
    b.onclick = () => { tab = c; buildTabs(); buildCards(); }; t.appendChild(b);
  });
}
function buildCards() {
  const box = $('#cards'); box.innerHTML = '';
  Object.entries(CATALOG).filter(([, k]) => k.cat === tab).forEach(([type, k]) => {
    const b = document.createElement('button'); b.className = 'card';
    b.innerHTML = `<span class="em">${k.em}</span><b>${k.n}</b><small>${fmt(k.w)} × ${fmt(k.d)}</small>`;
    b.onclick = () => addItem(type); box.appendChild(b);
  });
}
function addItem(type) {
  setNDC({ clientX: innerWidth / 2, clientY: innerHeight * .42 });
  const p = new THREE.Vector3();
  if (!ray.ray.intersectPlane(ground, p) || p.distanceTo(CENTER) > 14) p.copy(CENTER);
  const k = CATALOG[type], n = items.length % 5 * .15;
  const it = { id: nextId++, type, x: p.x + n, z: p.z + n, rot: 0, color: k.c };
  if (snap) { it.x = Math.round(it.x / snap) * snap; it.z = Math.round(it.z / snap) * snap; }
  items.push(it); addGroup(it); select(it.id); checkCollisions(); save();
}
function layoutTray() {
  requestAnimationFrame(() => document.documentElement.style.setProperty('--tray-h', $('#tray').offsetHeight + 'px'));
}

/* ============================================================
   Cámara: vistas
   ============================================================ */
let tween = null, view = '3d';
function flyTo(pos, target, ms = 650) {
  tween = { t0: performance.now(), ms, p0: camera.position.clone(), t0v: controls.target.clone(), p1: pos, t1: target };
}
let wallsBeforeEye = null;
function setView(v) {
  if (v === 'eye' && view !== 'eye') { wallsBeforeEye = wallMode; wallMode = 0; applyWalls(); }
  if (v !== 'eye' && view === 'eye' && wallsBeforeEye != null) { wallMode = wallsBeforeEye; wallsBeforeEye = null; applyWalls(); }
  view = v;
  document.querySelectorAll('#views button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  const aspect = camera.aspect, tf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  if (v === '3d') {
    const dist = Math.max(13, 17 / aspect * .75);
    flyTo(new THREE.Vector3(CENTER.x + 4.5, dist * .78, CENTER.z + dist * .72 + 1), new THREE.Vector3(CENTER.x, 0, CENTER.z - .3));
  } else if (v === 'top') {
    const h = 12.4, w = 8.2;
    const dist = Math.max(h / 2 / tf, w / 2 / (tf * aspect)) * 1.04;
    flyTo(new THREE.Vector3(wx(505), dist, wz(996) + .01), new THREE.Vector3(wx(505), 0, wz(996)));
  } else {
    const eye = new THREE.Vector3(wx(552), 1.6, wz(1300));
    const dir = new THREE.Vector3(wx(500) - eye.x, 0, wz(850) - eye.z).normalize();
    flyTo(eye, eye.clone().addScaledVector(dir, 1.2).setY(1.4));
  }
}
document.querySelectorAll('#views button').forEach(b => b.onclick = () => setView(b.dataset.view));

/* ============================================================
   Menú + utilidades
   ============================================================ */
const menu = $('#menu');
$('#menuBtn').onclick = () => { menu.hidden = !menu.hidden; };
canvas.addEventListener('pointerdown', () => { menu.hidden = true; });
$('#wallsBtn').onclick = () => { wallMode = (wallMode + 1) % 3; applyWalls(); save(); };
$('#unitsBtn').onclick = () => { units = units === 'm' ? 'ft' : 'm'; $('#unitsBtn').textContent = 'Unidades: ' + units; buildCards(); updateSelUI(); save(); };
$('#snapBtn').onclick = () => { snap = snap ? 0 : .05; $('#snapBtn').textContent = 'Imán: ' + (snap ? '5 cm' : 'libre'); };
$('#resetBtn').onclick = () => { loadItems(SUGGESTED); menu.hidden = true; };
$('#clearBtn').onclick = () => { if (confirm('¿Quitar todos los muebles?')) loadItems([]); menu.hidden = true; };
function download(name, href) { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); }
$('#shotBtn').onclick = () => {
  ring.visible = false; renderer.render(scene, camera);
  download('imix-10c-layout.png', canvas.toDataURL('image/png'));
  ring.visible = selectedId != null; menu.hidden = true;
};
$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify({ v: 1, items: items.map(({ hit, ...r }) => r) }, null, 1)], { type: 'application/json' });
  download('imix-10c-layout.json', URL.createObjectURL(blob)); menu.hidden = true;
};
$('#importBtn').onclick = () => $('#importFile').click();
$('#importFile').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    loadItems(d.items.filter(i => CATALOG[i.type]));
  } catch { alert('Archivo inválido'); }
  e.target.value = ''; menu.hidden = true;
};
let hintOn = true;
function hideHint() { if (hintOn) { hintOn = false; $('#hint').classList.add('off'); } }

/* ============================================================
   Loop
   ============================================================ */
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  layoutTray(); redraw();
}
addEventListener('resize', resize);
controls.addEventListener('change', redraw);

function frame(now) {
  if (tween) {
    const k = Math.min(1, (now - tween.t0) / tween.ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    camera.position.lerpVectors(tween.p0, tween.p1, e);
    controls.target.lerpVectors(tween.t0v, tween.t1, e);
    camera.lookAt(controls.target);
    if (k >= 1) tween = null;
    controls.update(); dirty = true;
  }
  if (dirty) { dirty = false; renderer.render(scene, camera); }
  requestAnimationFrame(frame);
}

// Init
const saved = load();
resize();
applyWalls();
$('#unitsBtn').textContent = 'Unidades: ' + units;
buildTabs(); buildCards();
loadItems(saved || SUGGESTED);
setView('3d');
if (location.hash === '#top') setView('top');
if (location.hash === '#eye') setView('eye');
tween && (tween.ms = 1);
requestAnimationFrame(frame);
setTimeout(hideHint, 9000);
window.__app = { setView, items: () => items, select, camera };
