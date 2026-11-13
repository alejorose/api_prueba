import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PRODUCTS, EXTRAS, JAPANDI } from './shop.js';

/* ============================================================
   Plano IMIX Suite 10C — reconstruido desde la imagen (px -> m)
   Escala calibrada con las camas del plano (~1.52 x 2.0 m).
   El plano es aproximado: verifica medidas reales antes de comprar.
   ============================================================ */
// Escala calibrada (tools/calibrate.py): la huella a caras exteriores = 664 sq ft (61.7 m²);
// valida con la cama queen del plano (~98 px = 1.52 m = 60 in).
const S = 0.0156, X0 = 262, Y0 = 615;           // m por px, origen = esquina del patio
const FOOT = [[262, 758], [645, 758], [645, 1225], [750, 1225], [750, 1378], [262, 1378]];
const footArea = () => Math.abs(FOOT.reduce((a, p, i) => { const q = FOOT[(i + 1) % FOOT.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2 * S * S;
const wx = px => (px - X0) * S;
const wz = py => (py - Y0) * S;
const rectOf = ([x1, y1, x2, y2]) => ({ cx: wx((x1 + x2) / 2), cz: wz((y1 + y2) / 2), w: (x2 - x1) * S, d: (y2 - y1) * S });
const WALL_H = 2.5, LOW_H = 0.55;

const WALLS = [
  [262, 758, 277, 1378], [262, 1355, 750, 1378], [738, 1225, 750, 1252], [738, 1340, 750, 1378],
  [645, 1225, 738, 1240], [628, 758, 645, 1182], [585, 1182, 645, 1225],
  [277, 978, 372, 986], [425, 980, 433, 1135], [277, 1080, 433, 1100],
  [277, 1190, 380, 1197], [445, 810, 455, 921], [445, 915, 492, 921],
  [518, 1197, 525, 1300], [620, 615, 645, 758],
];

const FLOORS = [
  { r: [277, 768, 628, 1197], k: 'wood' }, { r: [277, 1197, 645, 1225], k: 'wood' },
  { r: [277, 1225, 738, 1355], k: 'wood' }, { r: [268, 615, 628, 758], k: 'deck' },
  { r: [277, 986, 425, 1080], k: 'tile', y: .004 }, { r: [277, 1100, 433, 1190], k: 'tile', y: .004 },
];

const ROOMDEF = [
  { k: 'prim', n: 'RECÁMARA PRINCIPAL', en: 'Primary bedroom', r: [277, 768, 445, 980], lab: [368, 800], eye: [435, 790], tg: [320, 905], fov: 70,
    cam: 'standing in the north-east corner of the room (window side), looking south-west toward the bed',
    alt: { eye: [440, 965], tg: [300, 850], fov: 72, cam: 'standing at the room entrance (south-east corner), looking north-west toward the bed head, the wall art above it and the wall lamps' } },
  { k: 'liv', n: 'SALA', en: 'Living room', r: [455, 768, 628, 980], lab: [545, 800], eye: [505, 975], tg: [545, 790], fov: 66,
    cam: 'standing at the south edge of the living room (kitchen side), looking north toward the floor-to-ceiling balcony windows',
    alt: { eye: [470, 790], tg: [585, 900], fov: 70, cam: 'standing by the balcony windows next to the TV console, looking south-east across the room toward the sofa, the round mirror and the picture ledges on the east wall' } },
  { k: 'kit', n: 'COCINA / COMEDOR', en: 'Kitchen and dining area', r: [433, 980, 592, 1190], lab: [510, 1160], eye: [540, 1215], tg: [500, 1000], fov: 66,
    cam: 'standing in the hallway at the south end, looking north along the kitchen counter (on the right) and the dining table',
    alt: { eye: [450, 1000], tg: [540, 1120], fov: 70, cam: 'standing at the living-room end of the kitchen, looking south-east at the round dining table with the paper pendant above it and the kitchen counter on the left' } },
  { k: 'bath1', n: 'BAÑO PRINCIPAL', en: 'Primary bathroom', r: [277, 986, 425, 1080], lab: [352, 1010] },
  { k: 'bath2', n: 'BAÑO 2', en: 'Second bathroom', r: [277, 1100, 433, 1190], lab: [352, 1170] },
  { k: 'bed2', n: 'RECÁMARA 2', en: 'Second bedroom', r: [320, 1197, 518, 1355], lab: [430, 1214], eye: [505, 1210], tg: [360, 1300], fov: 70,
    cam: 'standing in the north-east corner of the room by the door, looking south-west toward the bed',
    alt: { eye: [440, 1215], tg: [420, 1350], fov: 66, cam: 'standing by the room door at the north end, looking south straight at the bed head with the wall art, the two wall lamps and the floating bedside shelves' } },
  { k: 'entry', n: 'ENTRADA', en: 'Entry hall', r: [525, 1240, 738, 1355], lab: [650, 1270], eye: [548, 1286], tg: [705, 1296], fov: 74,
    cam: 'standing at the west end of the entry hall (next to the washer/dryer) looking east toward the front door: the bench with the hook rail and shelf on the left (north wall), the LED-backlit floor mirror on the right (south wall), the jute rug on the floor' },
  { k: 'patio', n: 'PATIO', en: 'Balcony', r: [268, 615, 628, 758], lab: [440, 740] },
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
  [[277, 758, 628, 768], WALL_H, 0], [[277, 986, 325, 1080], 2.1, 0],   // ventanal, regadera
  [[262, 612, 620, 618], 1.05, 0], [[262, 612, 268, 758], 1.05, 0],      // barandal patio
];
const COLLIDERS = [...WALLS, [277, 758, 628, 768], [277, 1197, 320, 1355],
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
// Productos de tienda (shop.js) como piezas del catálogo
PRODUCTS.forEach(p => { CATALOG['p_' + p.id] = { n: p.name, cat: 'Tienda', w: p.w, d: p.d, h: p.h, c: p.color, em: p.em, b: p.b, rug: p.rug, air: p.air, elev: p.elev, duvet: p.duvet, shop: p }; });
const CATS = ['Tienda', 'Recámara', 'Sala', 'Comedor', 'Oficina', 'Deco'];
const floats = k => k.rug || k.air;   // alfombras y piezas colgadas no chocan con el piso
const PALETTE = ['#6b7a8f', '#8fa3b8', '#c97b4a', '#b08968', '#e8e2d8', '#3b3f46', '#5f9d4c', '#c75b5b', '#d9b44a'];

// Layout sugerido (px del plano, rotación en grados). Cabecera/respaldo mira a -Z local.
const px = (x, y) => [wx(x), wz(y)];
const JAPANDI_ITEMS = JAPANDI.map(([id, x, y, deg, elev], i) => ({ id: i + 1, type: 'p_' + id, x: wx(x), z: wz(y), rot: deg * Math.PI / 180, color: CATALOG['p_' + id].c, ...(elev ? { elev } : {}) }));
const SUGGESTED = [
  ['bed_queen', ...px(344, 878), 90], ['nightstand', ...px(291, 806), 90], ['nightstand', ...px(291, 950), 90],
  ['sofa3', ...px(598, 845), -90], ['coffee_r', ...px(525, 848), 0], ['rug', ...px(535, 850), 90],
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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.setClearColor(0x000000, 0);   // el fondo azul marino es CSS
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, .1, 120);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = false;
controls.maxPolarAngle = Math.PI / 2 - .02;
controls.minDistance = 1.2; controls.maxDistance = 45;
controls.screenSpacePanning = true;
controls.zoomToCursor = false; controls.zoomSpeed = 1.6;
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

scene.add(new THREE.HemisphereLight('#c9d3ff', '#4b3d38', .9));
const sun = new THREE.DirectionalLight('#ffe3c4', 2.3);
sun.position.set(-4, 14, 11);
const rim = new THREE.DirectionalLight('#6f8cff', .7); rim.position.set(9, 6, -9); scene.add(rim);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 11, bottom: -11, near: 1, far: 40 });
sun.shadow.bias = -.0004;
sun.target.position.set(wx(500), 0, wz(1000));
scene.add(sun, sun.target);

const CENTER = new THREE.Vector3(wx(500), 0, wz(1000));
// luces cálidas dentro de los cuartos (ambiente de casa habitada)
[[368, 880], [545, 880], [510, 1090], [400, 1280], [352, 1050], [650, 1300]].forEach(([x, y]) => {
  const l = new THREE.PointLight('#ffb067', 3.2, 5.5, 1.6); l.position.set(wx(x), 1.9, wz(y)); scene.add(l);
});
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
// base tipo maqueta (plinto) + sombra suave sobre el fondo
{
  const mk = pts => { const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(wx(x), wz(y)))); const g = new THREE.ExtrudeGeometry(sh, { depth: .45, bevelEnabled: false });
    const m = new THREE.Mesh(g, mat('#252d5c', { roughness: .9 })); m.rotation.x = Math.PI / 2; m.position.y = -.012; m.receiveShadow = true; scene.add(m); };
  mk(FOOT); mk([[262, 615], [645, 615], [645, 758], [262, 758]]);
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, 'rgba(4,6,20,.75)'); gr.addColorStop(1, 'rgba(4,6,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(20, 24), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.set(CENTER.x + .6, -.47, wz(880)); sh.renderOrder = -1; scene.add(sh);
}

let roomLabels = [], showDims = true;
function drawRoomLabels() {
  roomLabels.forEach(m => { scene.remove(m); m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); });
  roomLabels = ROOMDEF.map(r => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const g = c.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(20,24,30,.5)';
    g.font = '600 38px system-ui,sans-serif'; g.fillText(r.n, 256, showDims ? 40 : 64);
    if (showDims) { const q = rectOf(r.r); g.font = '500 32px system-ui,sans-serif'; g.fillText(`${fmt(q.w)} × ${fmt(q.d)}`, 256, 90); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .6), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(wx(r.lab[0]), .012, wz(r.lab[1])); m.renderOrder = 2;
    m.visible = view === 'top'; scene.add(m); return m;
  });
  redraw();
}

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
const mull = [], cabs = [];
for (let i = 0; i <= 5; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(.05, WALL_H, .14), mat('#2b2e33'));
  m.position.set(wx(277) + i * (wx(628) - wx(277)) / 5, WALL_H / 2, wz(763)); scene.add(m); mull.push(m);
}
// Clóset empotrado de la recámara 2: ~0.64 × 2.46 m a lo largo de la pared oeste, 3 puertas corredizas blancas
{
  const y0 = 1197, y1 = 1355, len = (y1 - y0) / 3;
  [0, 1, 2].forEach(i => {                                   // dos rieles: los paneles se traslapan
    const { cx, cz, w, d } = rectOf([i % 2 ? 318 : 314, y0 + i * len - (i ? 2 : 0), i % 2 ? 321 : 317, y0 + (i + 1) * len + (i < 2 ? 2 : 0)]);
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat('#f1eee9', { roughness: .6 }));
    m.userData = { cx, cz, ww: w, d, closet: true }; m.castShadow = m.receiveShadow = true; scene.add(m); wallMeshes.push(m);
  });
  const fl = floorMesh({ r: [277, y0, 314, y1], k: 'wood', y: .004 }); fl.material.color.set('#8f8579'); scene.add(fl);
  const c0 = rectOf([277, y0, 314, y1]);
  const wood = mat('#e8e2d8');                                // repisa y barra
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(c0.w, .03, c0.d - .04), wood); shelf.position.set(c0.cx, 1.95, c0.cz); scene.add(shelf);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, c0.d - .06, 10), mat('#9aa0a8', { metalness: .6 }));
  rod.rotation.x = Math.PI / 2; rod.position.set(c0.cx, 1.8, c0.cz); scene.add(rod);
  ['#d9d4cc', '#5b6b82', '#2f343b', '#c9b79c', '#8a9a7b', '#e8e2d8', '#3b3f46', '#b08968', '#9fb0c4', '#6b7a8f'].forEach((c, i) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(c0.w * .55, .9, .05), mat(c, { roughness: 1 }));
    g.position.set(c0.cx, 1.3, c0.cz - c0.d / 2 + .15 + i * (c0.d - .3) / 9); g.rotation.y = (i % 3 - 1) * .08; g.castShadow = true; scene.add(g);
  });
}
FIXTURES.forEach(([r, h, c, y0 = 0]) => {
  const { cx, cz, w, d } = rectOf(r);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  m.position.set(cx, y0 + h / 2, cz); m.castShadow = m.receiveShadow = true; scene.add(m);
  if (y0 >= 1) cabs.push(m); // gabinetes altos: solo si el muro este está alto
});

let wallMode = 3; // 0 altos, 1 bajos, 2 ocultos, 3 auto (maqueta: baja los muros que tapan la vista)
let doorsTall = false;   // solo para tomas de render: puertas del clóset cerradas a altura completa
const WALL_NAMES = ['altos', 'bajos', 'ocultos', 'auto'];
const setWallH = (m, h) => { const { cx, cz, ww, d } = m.userData; m.scale.set(ww, Math.max(h, .001), d); m.position.set(cx, h / 2, cz); };
const camDot = (x, z) => { const dx = camera.position.x - CENTER.x, dz = camera.position.z - CENTER.z, L = Math.hypot(dx, dz);
  return L < 1.5 ? 0 : ((x - CENTER.x) * dx + (z - CENTER.z) * dz) / L; };
function applyWalls(immediate = true) {
  const auto = wallMode === 3 && view !== 'top';
  const front = (x, z) => auto && camDot(x, z) > .8;          // muro entre la cámara y el centro
  wallMeshes.forEach(m => {
    if (m.userData.fixedH) { m.visible = wallMode === 0; return; }
    m.visible = wallMode !== 2;
    m.userData.tgt = wallMode === 0 ? WALL_H : wallMode === 2 ? .001 : wallMode === 1 || wallMode === 3 && !auto ? LOW_H : front(m.userData.cx, m.userData.cz) ? LOW_H : WALL_H;
    if (doorsTall && m.userData.closet) m.userData.tgt = WALL_H;
    if (immediate || m.userData.h == null) { m.userData.h = m.userData.tgt; setWallH(m, m.userData.h); }
  });
  const northTall = wallMode === 0 || auto && !front(CENTER.x, wz(763));
  glassMeshes.forEach(m => { m.visible = m.userData.full ? northTall : wallMode < 2; });
  mull.forEach(m => { m.visible = northTall; });
  const eastTall = wallMode === 0 || auto && !front(wx(636), wz(970));
  cabs.forEach(m => { m.visible = eastTall; });
  $('#wallsBtn').textContent = 'Muros: ' + WALL_NAMES[wallMode];
  redraw();
}
function animateWalls() {
  wallMeshes.forEach(m => {
    const u = m.userData; if (u.tgt == null || Math.abs(u.h - u.tgt) < .004) { if (u.tgt != null && u.h !== u.tgt) { u.h = u.tgt; setWallH(m, u.h); dirty = true; } return; }
    u.h += (u.tgt - u.h) * .22; setWallH(m, u.h); dirty = true;
  });
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
  glowdisc(g, it, { w, d }, c) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, d, 32), mat(c, { emissive: c, emissiveIntensity: .9, roughness: .3 }));
    m.rotation.x = Math.PI / 2; m.position.set(0, w / 2, 0); g.add(m);
  },
  arclamp(g, it, { h }, c) {
    const dark = mat('#26292e', { metalness: .4 });
    cyl(g, .16, .17, .04, 0, .02, 0, dark, 24);
    const pts = [[0, .04, 0], [0, 1.0, 0], [0, 1.7, 0], [0, 1.95, .35], [0, 1.9, .8], [0, 1.68, 1.2]].map(p => new THREE.Vector3(...p));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .013, 8), dark); tube.castShadow = true; g.add(tube);
    const sh = new THREE.Mesh(new THREE.SphereGeometry(.22, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(c, { emissive: c, emissiveIntensity: .8, side: THREE.DoubleSide }));
    sh.position.set(0, 1.55, 1.2); g.add(sh);
  },
  mirror(g, it, { w, d, h }, c) {      // espejo de piso con LED cálido
    part(g, w + .05, h + .05, .008, 0, h / 2, -d / 2 - .002, mat('#ffb067', { emissive: '#ffa550', emissiveIntensity: 1.3 }));
    part(g, w, h, d, 0, h / 2, 0, mat(c));
    part(g, w - .05, h - .05, d + .004, 0, h / 2, .002, mat('#dfe8f2', { roughness: .08, metalness: .85 }));
  },
  mirrorround(g, it, { w, d, h }, c) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, d, 40), mat(c)); f.rotation.x = Math.PI / 2; f.position.set(0, h / 2, 0); f.castShadow = true; g.add(f);
    const i = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 - .02, w / 2 - .02, d + .004, 40), mat('#dfe8f2', { roughness: .08, metalness: .85 })); i.rotation.x = Math.PI / 2; i.position.set(0, h / 2, .002); g.add(i);
    part(g, .02, .3, .01, 0, h + .12, -d / 2, mat('#6b4a32'));
  },
  ledge(g, it, { w, d, h }, c) {
    part(g, w, h, d, 0, h / 2, 0, mat(c));
    part(g, .22, .28, .02, -.12, h + .14, -d / 2 + .03, mat('#3b3f46')); part(g, .18, .24, .022, -.12, h + .14, -d / 2 + .031, mat('#e4dccd'));
    cyl(g, .035, .03, .12, .17, h + .06, 0, mat('#c9a77c'));
  },
  sconce(g, it, { w, d, h }, c) {
    const dark = mat('#26292e');
    part(g, .06, .14, .02, 0, .16, -d / 2 + .01, dark); part(g, .012, .012, .3, 0, .24, -d / 2 + .16, dark);
    const l = new THREE.Mesh(new THREE.SphereGeometry(.15, 22, 14), mat(c, { emissive: '#ffd9a0', emissiveIntensity: .9, roughness: .9 }));
    l.scale.set(1, 1.1, 1); l.position.set(0, .12, -d / 2 + .3); l.castShadow = false; g.add(l);
  },
  pendant(g, it, { w }, c) {
    cyl(g, .004, .004, .6, 0, .75, 0, mat('#26292e'), 6);
    const l = new THREE.Mesh(new THREE.SphereGeometry(w / 2, 26, 16), mat(c, { emissive: '#ffd9a0', emissiveIntensity: .85, roughness: .9 })); l.position.set(0, w / 2, 0); g.add(l);
  },
  hooks(g, it, { w, d }, c) {
    part(g, w, .07, .02, 0, 0, -d / 2 + .01, mat('#b08968'));
    for (let i = 0; i < 5; i++) { const p = cyl(g, .012, .012, .05, -w / 2 + .08 + i * (w - .16) / 4, 0, -d / 2 + .04, mat(c), 8); p.rotation.x = Math.PI / 2; }
    [['#6b3b2a', -.28, .3], ['#2b2e33', -.04, .24], ['#cbbfae', .2, .34]].forEach(([col, x, hh]) => part(g, .2, hh, .07, x, -hh / 2 - .03, .0, mat(col, { roughness: 1 })));
  },
  frame(g, it, { w, d, h }, c) {
    part(g, w, h, d, 0, h / 2, 0, mat('#3a2a20')); part(g, w - .06, h - .06, d + .004, 0, h / 2, .003, mat('#efe7d8', { roughness: 1 }));
    [[-.18, .52, .3, .45], [.12, .45, .35, .5], [.0, .75, .28, .25]].forEach(([x, y, ww, hh]) => part(g, w * ww, h * hh, d + .008, w * x, h * y, .004, mat(c, { roughness: 1 })));
  },
  bed(g, it, { w, d }, c) {
    const wood = mat('#8a6a4a'), main = mat(c), white = mat('#f4f1eb');
    part(g, w, .28, d, 0, .14, 0, wood);
    part(g, w - .04, .2, d - .08, 0, .38, .03, white);
    part(g, w, .95, .08, 0, .475, -d / 2 + .04, main);
    part(g, w - .02, .07, d * .62, 0, .52, d * .17, mat(CATALOG[it.type].duvet || c));
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
const STORE = 'imix10c-layout-v2';
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
function place(g, it) { g.position.set(it.x, it.elev ?? CATALOG[it.type].elev ?? 0, it.z); g.rotation.y = it.rot; }

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
    if (floats(CATALOG[it.type])) return;
    if (COLL_POLYS.some(p => overlap(polys[i], p))) bad.add(it.id);
    items.forEach((o, j) => { if (j > i && !floats(CATALOG[o.type]) && overlap(polys[i], polys[j])) { bad.add(it.id); bad.add(o.id); } });
  });
  items.forEach(it => {
    const g = groups.get(it.id), on = bad.has(it.id);
    g.userData.mats.forEach(m => { m.emissive.set(on ? '#ff2d2d' : (m.userData.baseEm || '#000000')); m.emissiveIntensity = on ? .55 : (m.userData.baseI ?? 0); });
    it.hit = on;
  });
  updateSelUI(); updateGaps(); updateCart(); updateRoomCard(); applyRoomFocus();
}

function rayHit(ox, oz, dx, dz, poly) {
  let best = Infinity;
  for (let i = 0; i < 4; i++) {
    const p = poly[i], q = poly[(i + 1) % 4], ex = q[0] - p[0], ez = q[1] - p[1];
    const den = dx * ez - dz * ex; if (Math.abs(den) < 1e-9) continue;
    const t = ((p[0] - ox) * ez - (p[1] - oz) * ex) / den, u = ((p[0] - ox) * dz - (p[1] - oz) * dx) / den;
    if (t >= -1e-6 && u >= 0 && u <= 1 && t < best) best = t;
  }
  return best;
}
// Distancias libres del mueble (atrás, frente, izq, der) hasta muros u otros muebles, en metros
function clearances(it) {
  const k = CATALOG[it.type], c = Math.cos(it.rot), s = Math.sin(it.rot);
  const obst = [...COLL_POLYS];
  items.forEach(o => { if (o !== it && !floats(CATALOG[o.type])) obst.push(corners(o.x, o.z, CATALOG[o.type].w, CATALOG[o.type].d, o.rot)); });
  const W = (x, z) => [x * c + z * s, -x * s + z * c];
  return [['back', 0, -1], ['front', 0, 1], ['left', -1, 0], ['right', 1, 0]].map(([name, lx, lz]) => {
    const half = lx ? k.w / 2 : k.d / 2, span = lx ? k.d : k.w, [dx, dz] = W(lx, lz);
    let best = 9.99, from = null;
    for (const f of [-.35, 0, .35]) {
      const [ox, oz] = W(lx ? lx * half : f * span, lx ? f * span : lz * half);
      const px_ = it.x + ox, pz_ = it.z + oz;
      let m = Infinity; obst.forEach(p => { m = Math.min(m, rayHit(px_, pz_, dx, dz, p)); });
      if (m < best) { best = m; from = [px_, pz_]; }
    }
    return { name, d: best, dx, dz, from: from || [it.x, it.z] };
  });
}
const gapObjs = [0, 1, 2, 3].map(() => {
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 1)]), new THREE.LineBasicMaterial({ color: '#2dd4bf', depthTest: false }));
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 48;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(.62, .23, 1); line.renderOrder = sp.renderOrder = 11; line.visible = sp.visible = false; line.frustumCulled = false;
  scene.add(line, sp); return { line, sp, cv, tex };
});
const GAPNAMES = { back: 'Atrás', front: 'Frente', left: 'Izq', right: 'Der' };
function updateGaps() {
  const it = byId(selectedId);
  gapObjs.forEach(g => { g.line.visible = g.sp.visible = false; });
  const box = $('#selGaps');
  if (!it || CATALOG[it.type].air) { box.textContent = ''; return; }
  const gaps = clearances(it);
  box.innerHTML = gaps.map(g => `<span class="${g.d < .6 ? 'tight' : ''}">${GAPNAMES[g.name]} ${g.d >= 9.9 ? '—' : fmt(g.d)}</span>`).join('');
  gaps.forEach((g, i) => {
    const o = gapObjs[i]; if (g.d >= 9.9 || g.d < .02) return;
    const a = new THREE.Vector3(g.from[0], .06, g.from[1]), b = a.clone().add(new THREE.Vector3(g.dx * g.d, 0, g.dz * g.d));
    o.line.geometry.setFromPoints([a, b]); o.line.material.color.set(g.d < .6 ? '#fbbf24' : '#2dd4bf');
    const x = o.cv.getContext('2d'); x.clearRect(0, 0, 128, 48);
    x.fillStyle = 'rgba(15,18,24,.85)'; x.roundRect(2, 6, 124, 36, 10); x.fill();
    x.fillStyle = g.d < .6 ? '#fbbf24' : '#e6fffb'; x.font = '600 24px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(fmt(g.d), 64, 25); o.tex.needsUpdate = true;
    o.sp.position.copy(a.clone().lerp(b, .5)).setY(.3); o.line.visible = o.sp.visible = true;
  });
  redraw();
}
const hist = [];
const snapshot = () => JSON.stringify(items.map(({ hit, ...r }) => r));
function pushHist(snap) { hist.push(snap || snapshot()); if (hist.length > 40) hist.shift(); $('#undoBtn').disabled = false; }
function undo() {
  const snap = hist.pop(); $('#undoBtn').disabled = !hist.length; if (!snap) return;
  const keep = selectedId; loadItems(JSON.parse(snap)); if (byId(keep)) select(keep);
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify({ v: 1, units, wallMode, items: items.map(({ hit, ...r }) => r) })); } catch { }
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (d && Array.isArray(d.items)) { units = d.units || 'm'; return d.items; }
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
  $('#sel').hidden = id == null; document.body.classList.toggle('sel', id != null);
  buildSwatches(); updateSelUI(); updateGaps(); layoutTray(); redraw();
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
    i.onclick = () => { pushHist(); it.color = c; removeGroup(it.id); addGroup(it); checkCollisions(); buildSwatches(); save(); redraw(); };
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
  let rugHit = null;
  for (const h of hits) {
    let o = h.object; while (o && o.userData.id == null) o = o.parent; if (!o) continue;
    if (CATALOG[byId(o.userData.id).type].rug) { rugHit = rugHit ?? o.userData.id; continue; }
    return o.userData.id;
  }
  // tolerancia táctil: el dedo es grande, acepta toques cerca del mueble
  const p = new THREE.Vector3();
  if (ray.ray.intersectPlane(ground, p)) {
    const tol = THREE.MathUtils.clamp(camera.position.distanceTo(p) / 38, .1, .45);
    let best = null, bd = 1e9;
    items.forEach(it => {
      const k = CATALOG[it.type]; if (k.rug) return;
      const c = Math.cos(it.rot), s = Math.sin(it.rot), dx = p.x - it.x, dz = p.z - it.z;
      const lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) <= k.w / 2 + tol && Math.abs(lz) <= k.d / 2 + tol) { const d = Math.hypot(lx, lz); if (d < bd) { bd = d; best = it.id; } }
    });
    if (best != null) return best;
  }
  return rugHit;
}

let drag = null, gesture = null;
const pointers = new Map();

// zoom / pan propios (pellizco con dos dedos aunque el primero caiga sobre un mueble)
function zoomBy(f) {
  const off = camera.position.clone().sub(controls.target);
  off.setLength(THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(off); controls.update(); redraw();
}
function panBy(dx, dy) {
  const k = 2 * camera.position.distanceTo(controls.target) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / innerHeight;
  const m = camera.matrix.elements, d = new THREE.Vector3(m[0] * -dx + m[4] * dy, m[1] * -dx + m[5] * dy, m[2] * -dx + m[6] * dy).multiplyScalar(k);
  camera.position.add(d); controls.target.add(d); controls.update(); redraw();
}
function cancelItemDrag() {
  if (!drag || drag.none) return;
  if (drag.moved) {                       // deshace el movimiento accidental
    const o = JSON.parse(drag.snap).find(i => i.id === drag.id), it = byId(drag.id);
    if (o && it) { it.x = o.x; it.z = o.z; place(groups.get(it.id), it); syncRing(); checkCollisions(); }
    hist.pop(); $('#undoBtn').disabled = !hist.length;
  }
  drag = null;
}
function pinchStep() {
  const [a, b] = [...pointers.values()]; if (!a || !b) return;
  const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (gesture.d) { if (d > 4) zoomBy(THREE.MathUtils.clamp(gesture.d / d, .7, 1.4)); panBy(m.x - gesture.m.x, m.y - gesture.m.y); }
  gesture.d = d; gesture.m = m;
}

canvas.addEventListener('pointerdown', e => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  document.body.classList.add('touching');   // las etiquetas/minimapa no deben robar el segundo dedo
  hideHint();
  if (shooting) return;                    // en modo Tomas solo se mueve la cámara
  if (pointers.size >= 2) {
    if (drag && !drag.none) {              // el primer dedo estaba sobre un mueble: tomamos el pellizco nosotros
      e.stopImmediatePropagation(); cancelItemDrag(); controls.enabled = false; gesture = { d: 0, m: null }; pinchStep();
    }
    return;                                // si empezó en el fondo, OrbitControls ya maneja el pellizco
  }
  const ck = chipAt(e.clientX, e.clientY);   // toque sobre una etiqueta de cuarto
  if (ck) { drag = { none: true, chip: ck, x: e.clientX, y: e.clientY }; return; }
  const id = pick(e);
  if (id == null) { drag = { none: true, x: e.clientX, y: e.clientY }; return; }
  e.stopImmediatePropagation();
  controls.enabled = false;
  select(id);
  const it = byId(id), p = groundPoint(e);
  drag = { id, off: p ? new THREE.Vector2(it.x - p.x, it.z - p.z) : new THREE.Vector2(), moved: false, x: e.clientX, y: e.clientY, snap: snapshot() };
  try { canvas.setPointerCapture(e.pointerId); } catch { }
}, { capture: true });

canvas.addEventListener('pointermove', e => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gesture) { pinchStep(); return; }
  if (!drag || drag.none) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) { drag.moved = true; pushHist(drag.snap); }
  if (!drag.moved) return;
  const p = groundPoint(e); if (!p) return;
  const it = byId(drag.id);
  let x = p.x + drag.off.x, z = p.z + drag.off.y;
  if (snap) { x = Math.round(x / snap) * snap; z = Math.round(z / snap) * snap; }
  it.x = THREE.MathUtils.clamp(x, wx(255), wx(760)); it.z = THREE.MathUtils.clamp(z, wz(600), wz(1385));
  place(groups.get(it.id), it); syncRing(); checkCollisions(); redraw();
});
const endDrag = e => {
  pointers.delete(e.pointerId);
  if (!pointers.size) document.body.classList.remove('touching');
  if (gesture) { if (!pointers.size) { gesture = null; controls.enabled = true; } else { gesture.d = 0; gesture.m = null; } return; }
  if (!drag) return;
  if (drag.none) {
    const tap = Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8 && !pointers.size;
    if (tap && drag.chip) focusRoom(drag.chip); else if (tap) select(null);
  }
  else { controls.enabled = true; save(); }
  drag = null;
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

// botones de zoom: toque = un paso, mantener = zoom continuo
(function zoomButtons() {
  let raf = 0, t0 = 0;
  const bind = (id, f) => {
    const b = $(id), stop = () => { cancelAnimationFrame(raf); clearTimeout(t0); };
    b.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); stop(); zoomBy(f ** 7);
      t0 = setTimeout(function loop() { zoomBy(f); raf = requestAnimationFrame(loop); }, 260);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
  };
  bind('#zIn', .965); bind('#zOut', 1.035);
  $('#zFit').onclick = () => (focusK ? focusRoom(focusK) : setView(view));
})();

function mutateSel(fn, record = true) {
  const it = byId(selectedId); if (!it) return;
  if (record) pushHist();
  fn(it); place(groups.get(it.id), it); syncRing(); checkCollisions(); save(); redraw();
}
const rotate = deg => mutateSel(it => { it.rot += deg * Math.PI / 180; });
$('#rotL').onclick = () => rotate(15);
$('#rotR').onclick = () => rotate(-15);
$('#rot90').onclick = () => rotate(-90);
$('#selClose').onclick = () => select(null);
$('#undoBtn').onclick = undo;
$('#trayToggle').onclick = () => document.body.classList.toggle('tray-min');
// flechas de precisión (mantén presionado para repetir)
document.querySelectorAll('.nud').forEach(b => {
  let t1, t2;
  const step = first => { const st = snap || .05; mutateSel(it => { it.x += +b.dataset.dx * st; it.z += +b.dataset.dz * st; }, first); };
  const stop = () => { clearTimeout(t1); clearInterval(t2); };
  b.addEventListener('pointerdown', e => { e.preventDefault(); step(true); t1 = setTimeout(() => { t2 = setInterval(() => step(false), 80); }, 380); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
});
$('#del').onclick = () => {
  const id = selectedId; if (id == null) return;
  pushHist(); removeGroup(id); items = items.filter(i => i.id !== id); select(null); checkCollisions(); save(); redraw();
};
$('#dup').onclick = () => {
  const it = byId(selectedId); if (!it) return;
  pushHist();
  const c = { ...it, id: nextId++, x: it.x + .3, z: it.z + .3, hit: false };
  items.push(c); addGroup(c); select(c.id); checkCollisions(); save();
};
addEventListener('keydown', e => {
  if (e.key === 'Delete' || e.key === 'Backspace') $('#del').click();
  else if (e.key === 'r' || e.key === 'R') rotate(e.shiftKey ? 15 : -90);
  else if (e.key === 'Escape') select(null);
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { undo(); e.preventDefault(); }
  else if (selectedId != null && e.key.startsWith('Arrow')) {
    const st = e.shiftKey ? .01 : .05, k = e.key;
    mutateSel(it => { if (k === 'ArrowLeft') it.x -= st; if (k === 'ArrowRight') it.x += st; if (k === 'ArrowUp') it.z -= st; if (k === 'ArrowDown') it.z += st; });
    e.preventDefault();
  }
});

/* ============================================================
   Catálogo (bandeja inferior)
   ============================================================ */
let tab = CATS[0], roomSel = null;
const THIS_ROOM = '★ Este cuarto';
const ROOM_BAR = [['prim', 'Principal'], ['bed2', 'Recámara 2'], ['liv', 'Sala'], ['kit', 'Cocina'], ['entry', 'Entrada'], ['patio', 'Balcón']];
const ROOM_CATS = { prim: ['Recámara', 'Deco'], bed2: ['Recámara', 'Oficina', 'Deco'], liv: ['Sala', 'Deco'], kit: ['Comedor'], entry: ['Deco'], patio: ['Deco'] };
const ROOM_PROD = { prim: ['Recámaras', 'recámara', 'Varios'], bed2: ['Recámaras', 'Recámara 2', 'recámara', 'Varios'], liv: ['Sala', 'Varios'], kit: ['Comedor'], entry: ['Entrada', 'entrada', 'Varios'], patio: ['Varios'] };
const roomCatalog = k => Object.entries(CATALOG).filter(([, c]) => c.shop ? (ROOM_PROD[k] || []).some(w => c.shop.room.includes(w)) : (ROOM_CATS[k] || []).includes(c.cat))
  .sort((a, b) => (b[1].shop ? 1 : 0) - (a[1].shop ? 1 : 0));   // primero los productos de tienda
function buildTabs() {
  const t = $('#tabs'); t.innerHTML = '';
  (roomSel ? [THIS_ROOM, ...CATS] : CATS).forEach(c => {
    const b = document.createElement('button'); b.textContent = c; if (c === tab) b.className = 'on';
    b.onclick = () => { tab = c; buildTabs(); buildCards(); }; t.appendChild(b);
  });
}
function buildCards() {
  const box = $('#cards'); box.innerHTML = '';
  (tab === THIS_ROOM && roomSel ? roomCatalog(roomSel) : Object.entries(CATALOG).filter(([, k]) => k.cat === tab)).forEach(([type, k]) => {
    const b = document.createElement('button'); b.className = 'card';
    b.innerHTML = `<span class="em">${k.em}</span><b>${k.n}</b><small>${fmt(k.w)} × ${fmt(k.d)}</small>` + (k.shop ? `<small class="pr">${money(k.shop.price)}</small>` : '');
    b.onclick = () => addItem(type); box.appendChild(b);
  });
}
/* ---------- Selector de cuartos para planear el layout ---------- */
const roomOutline = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#5b8cff', depthTest: false }));
roomOutline.renderOrder = 9; roomOutline.visible = false; roomOutline.frustumCulled = false; scene.add(roomOutline);
function updateOutline() {
  if (!roomSel) { roomOutline.visible = false; redraw(); return; }
  const q = rectOf(ROOMDEF.find(r => r.k === roomSel).r), hw = q.w / 2, hd = q.d / 2;
  roomOutline.geometry.setFromPoints([[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, z]) => new THREE.Vector3(q.cx + x, .035, q.cz + z)));
  roomOutline.visible = true; redraw();
}
function buildRoomBar() {
  const bar = $('#roomBar'); bar.innerHTML = '';
  [[null, 'Todo'], ...ROOM_BAR].forEach(([k, label]) => {
    const b = document.createElement('button'); b.textContent = label; if (k === roomSel) b.className = 'on';
    b.onclick = () => { setRoomSel(k); buzz && buzz(6); }; bar.appendChild(b);
  });
}
function setRoomSel(k, cam = 'plan') {
  roomSel = k; document.body.classList.toggle('roomsel', !!k);
  if (k) tab = THIS_ROOM; else if (tab === THIS_ROOM) tab = CATS[0];
  buildRoomBar(); buildTabs(); buildCards(); applyRoomFocus(); updateOutline(); updateRoomCard(); layoutTray();
  if (cam === 'plan') { if (k) focusRoomPlan(k); else { setView('top'); markMini(); } }
}
function focusRoomPlan(k) {   // vista de planta centrada en el cuarto, libre de la bandeja
  const r = ROOMDEF.find(x => x.k === k); if (!r) return;
  setView('top');
  const q = rectOf(r.r), tf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const dist = Math.max(q.d / (2 * tf) * 1.9, q.w / (2 * tf * camera.aspect) * 1.2) + .6, tz = q.cz + dist * tf * .24;
  flyTo(new THREE.Vector3(q.cx, dist, tz + .01), new THREE.Vector3(q.cx, 0, tz));
  focusK = k; markMini();
}
function applyRoomFocus() {   // lo que está fuera del cuarto elegido se atenúa
  items.forEach(it => {
    const g = groups.get(it.id); if (!g) return;
    const r = roomOf(it), inside = !roomSel || (r && r.k === roomSel);
    g.userData.mats.forEach(m => { if (m.userData.dim === !inside) return; m.userData.dim = !inside; m.transparent = !inside; m.opacity = inside ? 1 : .2; m.depthWrite = inside; m.needsUpdate = true; });
  });
  redraw();
}
function updateRoomCard() {
  const card = $('#roomCard'); card.hidden = !roomSel; if (!roomSel) return;
  const r = ROOMDEF.find(x => x.k === roomSel), q = rectOf(r.r), area = q.w * q.d;
  const inRoom = items.filter(it => roomOf(it)?.k === roomSel);
  const occ = inRoom.filter(it => !floats(CATALOG[it.type])).reduce((s, it) => s + CATALOG[it.type].w * CATALOG[it.type].d, 0);
  const hits = inRoom.filter(it => it.hit).length, areaTxt = units === 'm' ? area.toFixed(1) + ' m²' : Math.round(area * 10.7639) + ' ft²';
  $('#roomInfo').innerHTML = `<b>${title(r.n)}</b> · ${fmt(q.w)} × ${fmt(q.d)} · ${areaTxt}<br><small>${inRoom.length} piezas · muebles ocupan ${Math.round(occ / area * 100)}%` +
    `${hits ? ` · <span class="bad">⚠ ${hits} choque${hits > 1 ? 's' : ''}</span>` : ''}${r.k === 'bed2' ? ' · clóset aparte (0.62 × 2.46 m)' : ''}</small>`;
}
function clearRoom(k) { pushHist(); const ids = items.filter(it => roomOf(it)?.k === k).map(i => i.id); ids.forEach(removeGroup); items = items.filter(it => !ids.includes(it.id)); }
function finishRoomEdit() { select(null); checkCollisions(); save(); applyRoomFocus(); redraw(); }
$('#rcClear').onclick = () => { if (roomSel) { clearRoom(roomSel); finishRoomEdit(); } };
$('#rcReset').onclick = () => { if (!roomSel) return; clearRoom(roomSel); JAPANDI_ITEMS.filter(it => roomOf(it)?.k === roomSel).forEach(it => { const c = { ...it, id: nextId++ }; items.push(c); addGroup(c); }); finishRoomEdit(); };

function addItem(type) {
  setNDC({ clientX: innerWidth / 2, clientY: innerHeight * .42 });
  const p = new THREE.Vector3();
  if (!ray.ray.intersectPlane(ground, p) || p.distanceTo(CENTER) > 14) p.copy(CENTER);
  const k = CATALOG[type], n = items.length % 5 * .15;
  const it = { id: nextId++, type, x: p.x + n, z: p.z + n, rot: 0, color: k.c };
  if (snap) { it.x = Math.round(it.x / snap) * snap; it.z = Math.round(it.z / snap) * snap; }
  pushHist(); items.push(it); addGroup(it); select(it.id); checkCollisions(); save();
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
  // en planta 1 dedo mueve la vista (no gira); en 3D/persona gira
  controls.enableRotate = v !== 'top';
  controls.touches.ONE = v === 'top' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  controls.mouseButtons.LEFT = v === 'top' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  controls.minDistance = v === 'eye' ? .05 : 1.2;
  focusK = null; roomLabels.forEach(m => { m.visible = v === 'top'; }); markMini(); applyWalls(false);
  document.querySelectorAll('#views button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  const aspect = camera.aspect, tf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  if (v === '3d') {
    const dist = Math.max(14, 3.9 / (tf * aspect) * 1.32);
    flyTo(new THREE.Vector3(CENTER.x + dist * .14, dist * .9, CENTER.z + .9 + dist * .42), new THREE.Vector3(CENTER.x, 0, CENTER.z + .9));
  } else if (v === 'top') {
    const h = 12.4, w = 8.2;
    const dist = Math.max(h / 2 / tf, w / 2 / (tf * aspect)) * 1.16;
    flyTo(new THREE.Vector3(wx(505), dist, wz(996) + .01), new THREE.Vector3(wx(505), 0, wz(996)));
  } else {
    const eye = new THREE.Vector3(wx(552), 1.6, wz(1300));
    const dir = new THREE.Vector3(wx(500) - eye.x, 0, wz(850) - eye.z).normalize();
    flyTo(eye, eye.clone().addScaledVector(dir, 1.2).setY(1.4));
  }
}
document.querySelectorAll('#views button').forEach(b => b.onclick = () => setView(b.dataset.view));

/* ---------- Navegación por cuartos: etiquetas flotantes + minimapa ---------- */
let focusK = null;
function focusRoom(k) {
  const r = ROOMDEF.find(x => x.k === k); if (!r) return;
  if (view !== '3d') setView('3d');
  const q = rectOf(r.r), t = new THREE.Vector3(q.cx, .3, q.cz);
  const tf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const dist = Math.max(q.w / (2 * tf * camera.aspect), q.d / (2 * tf)) * 1.55 + 1.2, dir = new THREE.Vector3(.35, .95, .75).normalize();
  flyTo(t.clone().addScaledVector(dir, dist), t);
  focusK = k; markMini();
  if (roomSel !== k) setRoomSel(k, 'none');
}
const title =n => n[0] + n.slice(1).toLowerCase();
const CHIP_AT = { prim: [360, 900], liv: [560, 890], kit: [520, 1100], bed2: [400, 1290], patio: [440, 690] };
const CHIP_KEYS = Object.keys(CHIP_AT);
const chips = ROOMDEF.filter(r => CHIP_KEYS.includes(r.k)).map(r => {
  const d = document.createElement('button'); d.className = 'chip'; d.setAttribute('aria-label', 'Ir a ' + title(r.n));
  d.onclick = () => focusRoom(r.k); $('#chips').appendChild(d); return { r, d };
});
function areaText(r) { const q = rectOf(r.r), a = q.w * q.d; return units === 'm' ? a.toFixed(1) + ' m²' : Math.round(a * 10.7639) + ' ft²'; }
function drawChips() { chips.forEach(({ r, d }) => { d.innerHTML = `<b>${title(r.n)}</b><small>${areaText(r)}</small>`; }); }
const _v = new THREE.Vector3();
function chipAt(x, y) {
  for (const { r, d } of chips) {
    if (d.style.display === 'none' || $('#chips').style.display === 'none') continue;
    const b = d.getBoundingClientRect(); if (x >= b.left - 4 && x <= b.right + 4 && y >= b.top - 4 && y <= b.bottom + 4) return r.k;
  }
  return null;
}
function updateChips() {
  const show = view === '3d' && !document.body.classList.contains('sel') && $('#photo').hidden;
  $('#chips').style.display = show ? '' : 'none';
  if (!show) return;
  const placed = [];
  chips.forEach(({ r, d }) => {
    _v.set(wx(CHIP_AT[r.k][0]), .9, wz(CHIP_AT[r.k][1])).project(camera);
    const x = (_v.x + 1) / 2 * innerWidth, y = (1 - _v.y) / 2 * innerHeight;
    const clash = placed.some(p => Math.abs(p[0] - x) < 84 && Math.abs(p[1] - y) < 34);
    const ok = (focusK == null || focusK === r.k) && _v.z < 1 && x > 30 && x < innerWidth - 30 && y > 110 && y < innerHeight - 100 && !clash;
    if (ok) placed.push([x, y]);
    d.style.display = ok ? '' : 'none'; d.classList.toggle('on', focusK === r.k);
    d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
  });
}
const NS = 'http://www.w3.org/2000/svg';
(function buildMini() {
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '250 605 510 785'); svg.setAttribute('aria-hidden', 'true');
  const add = (tag, at, par = svg) => { const e = document.createElementNS(NS, tag); Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v)); par.appendChild(e); return e; };
  ROOMDEF.forEach(r => { const [x1, y1, x2, y2] = r.r; add('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1, class: 'mr', 'data-k': r.k }); });
  WALLS.forEach(([x1, y1, x2, y2]) => add('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1, class: 'mw' }));
  svg.addEventListener('pointerdown', e => { const t = e.target.closest('[data-k]'); if (t) { e.stopPropagation(); focusRoom(t.dataset.k); } });
  $('#mini').appendChild(svg);
})();
function markMini() { document.querySelectorAll('#mini .mr').forEach(e => e.classList.toggle('on', e.dataset.k === focusK)); }

/* ============================================================
   Menú + utilidades
   ============================================================ */
const menu = $('#menu');
$('#menuBtn').onclick = () => { menu.hidden = !menu.hidden; };
canvas.addEventListener('pointerdown', () => { menu.hidden = true; });
$('#wallsBtn').onclick = () => { wallMode = (wallMode + 1) % 4; applyWalls(false); save(); };
$('#unitsBtn').onclick = () => { units = units === 'm' ? 'ft' : 'm'; $('#unitsBtn').textContent = 'Unidades: ' + units; drawChips(); buildCards(); updateSelUI(); updateGaps(); drawRoomLabels(); save(); };
$('#dimsBtn').onclick = () => { showDims = !showDims; $('#dimsBtn').textContent = 'Cotas de cuartos: ' + (showDims ? 'sí' : 'no'); drawRoomLabels(); };
$('#calInfo').textContent = `Huella ${footArea().toFixed(1)} m² = ${Math.round(footArea() / 0.09290304)} ft² · escala ${(S * 100).toFixed(2)} cm/px`;
$('#snapBtn').onclick = () => { snap = snap ? 0 : .05; $('#snapBtn').textContent = 'Imán: ' + (snap ? '5 cm' : 'libre'); };
$('#resetBtn').onclick = () => { pushHist(); loadItems(JAPANDI_ITEMS); menu.hidden = true; };
$('#baseBtn').onclick = () => { pushHist(); loadItems(SUGGESTED); menu.hidden = true; };
$('#clearBtn').onclick = () => { pushHist(); loadItems([]); menu.hidden = true; };
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
   Foto-realista: imágenes de referencia + prompt con medidas
   ============================================================ */
const EN = { bed_queen: 'queen bed', bed_king: 'king bed', bed_single: 'twin bed', nightstand: 'nightstand', dresser: 'dresser', wardrobe: 'wardrobe',
  sofa3: '3-seat sofa', sofa2: '2-seat sofa', armchair: 'armchair', coffee: 'rectangular coffee table', coffee_r: 'round coffee table',
  side: 'round side table', tv: 'low TV console with a flat-screen TV', shelf: 'bookshelf', dining: 'rectangular dining table', round: 'round dining table',
  chair: 'dining chair', stool: 'counter stool', desk: 'desk', deskchair: 'desk chair', rug: 'area rug', rug_s: 'small area rug', plant: 'potted plant', lamp: 'floor lamp' };
for (const p of PRODUCTS) EN['p_' + p.id] = p.en;
const STYLES = {
  japandi: ['Japandi alternativo (tus fotos)', 'Alternative Japandi mood from the attached inspiration photos: cozy evening atmosphere with warm amber accent lighting (glowing orange glass lamp, paper lanterns, LED-backlit mirror, LED strip under shelves), natural jute rugs, light pine and oak wood, matte black metal accents, linen bedding in charcoal, oat and rust, trailing pothos and potted plants, framed abstract art, dim warm lamp light mixed with soft window light. Reproduce the mood of the inspiration photos but keep the exact furniture list, sizes and positions below.'],
  modern: ['Moderno neutro', 'Contemporary modern decor: cream bouclé and linen textiles, charcoal-black accents, sage-green plants, light wool rugs, soft warm lighting.'],
  scandi: ['Escandinavo', 'Scandinavian decor: light oak, white and soft grey textiles, linen, simple ceramics, bright airy natural light.'],
  warm: ['Cálido orgánico', 'Warm organic-modern decor: terracotta and olive accents, walnut wood, rattan, chunky knit textiles, warm lamp light.'],
  dark: ['Minimal oscuro', 'Moody minimalist decor: charcoal, black metal, walnut, deep green accents, layered warm lighting.'],
};
function colorName(hex) {
  const c = new THREE.Color(hex), h = {}; c.getHSL(h);
  if (h.l > .85) return 'off-white'; if (h.l < .22) return 'charcoal';
  if (h.s < .14) return h.l > .55 ? 'light grey' : 'grey';
  const d = h.h * 360, tone = h.l > .62 ? 'light ' : h.l < .38 ? 'dark ' : '';
  if (d < 20 || d > 340) return tone + 'red'; if (d < 45) return h.s > .45 ? 'terracotta' : tone + 'tan'; if (d < 70) return 'mustard';
  if (d < 170) return tone + 'green'; if (d < 260) return tone + 'blue-grey'; return tone + 'purple';
}
const mm = v => `${v.toFixed(2)} m (${(v * 3.28084).toFixed(1)} ft)`;
function roomOf(it) {
  const X = it.x / S + X0, Y = it.z / S + Y0;
  return ROOMDEF.find(r => X >= r.r[0] && X <= r.r[2] && Y >= r.r[1] && Y <= r.r[3]) || null;
}
function describe(it, n) {
  const k = CATALOG[it.type], r = roomOf(it), gaps = clearances(it);
  const poly = corners(it.x, it.z, k.w, k.d, it.rot), xs = poly.map(p => p[0]), zs = poly.map(p => p[1]);
  const base = `${n}. ${EN[it.type]}${k.shop ? '' : ' in ' + colorName(it.color)}, ${k.w} × ${k.d}${k.h && !k.rug ? ' × ' + k.h : ''} m (W × D${k.h && !k.rug ? ' × H' : ''})`;
  if (!r) return base + ', outside the rooms';
  const q = rectOf(r.r), cx = it.x - (q.cx - q.w / 2), cz = it.z - (q.cz - q.d / 2);
  const edge = { west: Math.min(...xs) - (q.cx - q.w / 2), east: (q.cx + q.w / 2) - Math.max(...xs), north: Math.min(...zs) - (q.cz - q.d / 2), south: (q.cz + q.d / 2) - Math.max(...zs) };
  const against = Object.entries(edge).filter(([, v]) => v < .15).map(([w]) => w);
  const f = { x: Math.sin(it.rot), z: Math.cos(it.rot) };
  const face = Math.abs(f.x) > Math.abs(f.z) ? (f.x > 0 ? 'east' : 'west') : (f.z > 0 ? 'south' : 'north');
  const front = gaps.find(g => g.name === 'front').d;
  return `${base}; ${r.en.toLowerCase()}: centre ${cx.toFixed(2)} m from the west wall and ${cz.toFixed(2)} m from the north wall` +
    (against.length ? `; pushed against the ${against.join(' and ')} wall` : '') + `; front faces ${face}` + (it.elev ?? k.elev ? `; mounted ${(it.elev ?? k.elev).toFixed(2)} m above the floor` : '') + (!k.air && front < 9.9 ? `; ${front.toFixed(2)} m free in front` : '');
}
function buildPrompt(shot, style, opts = {}) {
  const room = ROOMDEF.find(r => r.k === shot);
  const camTxt = room && (opts.alt && room.alt ? room.alt.cam : room.cam);
  const refs = opts.files
    ? 'ATTACHED FILES (use each one for the purpose stated):\n' + opts.files.map(([f, d]) => `- ${f}: ${d}`).join('\n') + '\nThe numbered plan is the ground truth for layout; the camera reference shows the framing I want; the tour photos show the real finishes; the inspiration photos set the mood only (never copy their furniture).'
    : 'REFERENCE IMAGES (attached): image 1 is a numbered top-down plan: the numbers match the furniture list below. The next image(s) show the room geometry and furniture positions from the camera angle I want. Treat them as exact ground truth for architecture, proportions and furniture placement.';
  const cu = opts.custom;   // toma libre: solo lo que se ve en el encuadre
  const list = cu ? cu.ids.map(id => ({ it: byId(id), n: items.findIndex(i => i.id === id) + 1 })).filter(o => o.it)
    : items.map((it, i) => ({ it, n: i + 1, r: roomOf(it) })).filter(o => !room || (o.r && o.r.k === shot));
  const lines = list.map(o => describe(o.it, o.n));
  const dims = (cu ? ROOMDEF.filter(r => cu.rooms.includes(r.k)) : ROOMDEF.filter(r => !room || r.k === shot || shot === 'all')).map(r => { const q = rectOf(r.r); return `- ${r.en}: ${mm(q.w)} wide (east-west) × ${mm(q.d)} deep (north-south)`; });
  return `Create a photorealistic interior photograph of a furnished condo suite in a Toronto high-rise (IMIX by Quadreal, Suite 10C, 664 sq ft, 2 bedrooms, 2 bathrooms).

${refs}

PLAN ORIENTATION: in the plan, up = north = the window/balcony side, right = east.

STRICT RULES
- Do NOT move, add, remove or resize any wall, window, door or built-in element.
- Place exactly the furniture listed, no more and no fewer, at the listed positions, with the listed real-world dimensions. Keep realistic scale relative to the room and to a 2.4 m ceiling.
- Keep walkways clear as shown. No extra furniture, no people, no text or watermarks.

${room ? 'ROOM' : 'ROOMS'} (interior dimensions)
${dims.join('\n')}

FIXED FINISHES (from the real unit)
Grey-brown wood-look vinyl plank floors, white walls and ceiling, floor-to-ceiling windows with sliding balcony door, dark grey flat-panel kitchen cabinets with grey stone-look backsplash and stainless steel appliances, bathrooms with large dark grey floor tile and white fixtures, white panel doors, mirrored sliding closet doors in the entry${(cu ? cu.closet : !room || room.k === 'bed2') ? '; a built-in closet in the second bedroom along the whole west wall, 0.62 m deep × 2.46 m long, with three white sliding doors (already excluded from the bedroom dimensions above)' : ''}.

FURNITURE (measured, numbers match the plan)
${lines.length ? lines.join('\n') : 'None'}

STYLE (decor and textiles only; keep the furniture colours above)
${STYLES[style][1]}

CAMERA
${opts.camFull ? opts.camFull : camTxt ? 'Eye level at 1.5 m, 24 mm wide-angle lens, vertical lines straight, ' + camTxt + '.' : 'High three-quarter aerial view of the whole suite with the ceiling removed, as in the aerial reference image.'}
${style === 'japandi' ? 'Lighting: follow the STYLE section (warm lamps on, plus soft window light). ' : 'Natural daylight from the windows. '}Soft realistic shadows, 4K architectural photography, interior magazine quality.`;
}

function numberSprite(n) {
  const c = document.createElement('canvas'); c.width = c.height = 96;
  const g = c.getContext('2d'); g.fillStyle = '#f37b2c'; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#fff'; g.font = '700 50px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 48, 52);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  sp.scale.set(.36, .36, 1); sp.renderOrder = 20; return sp;
}
function capture(w, h, pos, target, fov, walls, numbers) {
  const bg = scene.background; scene.background = new THREE.Color('#e6e9ee');
  const pv = camera.view && camera.view.enabled ? { ...camera.view } : null; if (pv) camera.clearViewOffset();   // la captura usa el eje óptico centrado
  const prev = { p: camera.position.clone(), q: camera.quaternion.clone(), fov: camera.fov, asp: camera.aspect, wm: wallMode, ring: ring.visible };
  const sprites = numbers ? items.map((it, i) => { const sp = numberSprite(i + 1); sp.position.set(it.x - (CATALOG[it.type].rug ? .55 : 0), 2.2, it.z); scene.add(sp); return sp; }) : [];
  gapObjs.forEach(g => { g.line.visible = g.sp.visible = false; }); ring.visible = false; roomLabels.forEach(m => { m.visible = !!numbers; });
  const rs = roomSel; roomSel = null; applyRoomFocus(); roomOutline.visible = false;   // las capturas no llevan el cuarto atenuado
  renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  camera.fov = fov; camera.aspect = w / h; camera.position.copy(pos); camera.lookAt(target); camera.updateProjectionMatrix();
  wallMode = walls; applyWalls();
  renderer.render(scene, camera);
  const url = canvas.toDataURL('image/jpeg', .92);
  sprites.forEach(sp => { scene.remove(sp); sp.material.map.dispose(); sp.material.dispose(); });
  scene.background = bg; wallMode = prev.wm; applyWalls(); ring.visible = prev.ring; roomSel = rs; applyRoomFocus(); updateOutline();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight, false);
  camera.fov = prev.fov; camera.aspect = prev.asp; camera.position.copy(prev.p); camera.quaternion.copy(prev.q); camera.updateProjectionMatrix();
  if (pv) { camera.setViewOffset(pv.fullWidth, pv.fullHeight, pv.offsetX, pv.offsetY, pv.width, pv.height); camera.updateProjectionMatrix(); }
  roomLabels.forEach(m => { m.visible = view === 'top'; }); applyWalls(true);
  updateGaps(); redraw();
  return url;
}
function renderShots(shot) {
  const out = [], tf = Math.tan(THREE.MathUtils.degToRad(21));
  const top = Math.max(12.6 / 2 / tf, 8.4 / 2 / (tf * .75)) * 1.04;
  out.push(['1 · Plano numerado', capture(960, 1280, new THREE.Vector3(wx(505), top, wz(996) + .01), new THREE.Vector3(wx(505), 0, wz(996)), 42, 1, true)]);
  const room = ROOMDEF.find(r => r.k === shot);
  if (room && room.eye) {
    const eye = new THREE.Vector3(wx(room.eye[0]), 1.5, wz(room.eye[1])), tg = new THREE.Vector3(wx(room.tg[0]), 1.0, wz(room.tg[1]));
    out.push(['2 · Vista de la toma', capture(1280, 960, eye, tg, room.fov, 0, false)]);
  }
  const d = 15.5;
  out.push([`${out.length + 1} · Vista aérea`, capture(1280, 960, new THREE.Vector3(CENTER.x + 4.5, d * .78, CENTER.z + d * .72 + 1), new THREE.Vector3(CENTER.x, 0, CENTER.z - .3), 42, 1, false)]);
  return out;
}

const INSPO = [1, 2, 3, 4].map(i => `./reference/inspo-${i}.jpg`);
let shotImgs = [];
function refreshPhoto(renderImgs = true) {
  const shot = $('#shotSel').value, style = $('#styleSel').value;
  if (renderImgs) {
    shotImgs = renderShots(shot);
    $('#shots').innerHTML = shotImgs.map(([t, u]) => `<figure><img alt="${t}" src="${u}"><figcaption>${t}</figcaption></figure>`).join('') +
      INSPO.map((u, i) => `<figure><img alt="Inspiración ${i + 1}" src="${u}"><figcaption>Inspiración ${i + 1} (estilo)</figcaption></figure>`).join('');
  }
  $('#promptTxt').value = buildPrompt(shot, style);
  const bad = items.filter(i => i.hit).length;
  $('#photoWarn').textContent = bad ? `⚠ ${bad} mueble(s) chocan con muros u otros muebles. Corrígelos antes de generar.` : '';
}
function openPhoto() {
  menu.hidden = true; select(null);
  if (!$('#shotSel').options.length) {
    $('#shotSel').innerHTML = '<option value="all">Todo el departamento</option>' + ROOMDEF.filter(r => r.eye).map(r => `<option value="${r.k}">${r.n[0] + r.n.slice(1).toLowerCase()}</option>`).join('');
    $('#styleSel').innerHTML = Object.entries(STYLES).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('');
  }
  document.body.classList.add('photo'); $('#photo').hidden = false; $('#photoBody').scrollTop = 0;
  requestAnimationFrame(() => setTimeout(() => refreshPhoto(true), 30));
}
$('#photoBtn').onclick = openPhoto;
$('#photoClose').onclick = () => { $('#photo').hidden = true; document.body.classList.remove('photo'); redraw(); };
$('#shotSel').onchange = () => refreshPhoto(true);
$('#styleSel').onchange = () => refreshPhoto(false);
$('#copyPrompt').onclick = async () => {
  const t = $('#promptTxt'), b = $('#copyPrompt');
  try { await navigator.clipboard.writeText(t.value); } catch { t.select(); try { document.execCommand('copy'); } catch { } }
  b.textContent = '¡Copiado!'; setTimeout(() => { b.textContent = 'Copiar prompt'; }, 1600);
};
if (navigator.canShare) {
  $('#shareImgs').hidden = false;
  $('#shareImgs').onclick = async () => {
    try {
      const files = await Promise.all(shotImgs.map(async ([t, u], i) => new File([await (await fetch(u)).blob()], `imix10c-${i + 1}.jpg`, { type: 'image/jpeg' })));
      if (navigator.canShare({ files })) await navigator.share({ files, text: $('#promptTxt').value });
    } catch { }
  };
}

/* ============================================================
   Lista de compras + presupuesto
   ============================================================ */
const money = v => 'CA$' + Math.round(v).toLocaleString('en-CA');
const BASIS = { CA: 'precio visto en IKEA Canadá', INT: 'convertido de otro país', EST: 'estimado' };
function shopRows() {
  const counts = {}; items.forEach(it => { const k = CATALOG[it.type]; if (k.shop) counts[k.shop.id] = (counts[k.shop.id] || 0) + 1; });
  return PRODUCTS.filter(p => counts[p.id]).map(p => ({ p, qty: counts[p.id], hit: items.some(i => i.type === 'p_' + p.id && i.hit) }));
}
function totals() {
  let mid = 0, lo = 0, hi = 0;
  shopRows().forEach(({ p, qty }) => { mid += p.price * qty; lo += p.lo * qty; hi += p.hi * qty; });
  EXTRAS.forEach(e => { mid += e.price * e.qty; lo += e.lo * e.qty; hi += e.hi * e.qty; });
  return { mid, lo, hi };
}
function updateCart() { $('#cartTotal').textContent = money(totals().mid); }
function renderShop() {
  const rows = shopRows(), t = totals(), byRoom = {};
  rows.forEach(r => (byRoom[r.p.room] = byRoom[r.p.room] || []).push(r));
  const row = (name, qty, store, url, price, dimTxt, note, basis, extra = '') => `<li><div class="sh1"><b>${name}</b><span class="sh-price">${money(price * qty)}</span></div>
    <div class="sh2">${qty > 1 ? `<span class="tag">×${qty}</span>` : ''}<span class="tag">${store}</span>${dimTxt}<span class="tag basis-${basis}">${BASIS[basis]}</span>${extra}</div>
    ${note ? `<p class="sh3">${note}</p>` : ''}<a class="shlink" href="${url}" target="_blank" rel="noopener">Ver en tienda ↗</a></li>`;
  $('#shopList').innerHTML = Object.entries(byRoom).map(([room, rs]) => `<h3>${room}</h3><ul>` + rs.map(({ p, qty, hit }) =>
    row(p.name, qty, p.store, p.url, p.price, `<span class="tag ${p.dims === 'V' ? 'ok' : 'warn'}">${fmt(p.w)} × ${fmt(p.d)}${p.h && !p.rug ? ' × ' + fmt(p.h) : ''} ${p.dims === 'V' ? '✓' : '(confirmar)'}</span>`, p.note, p.basis, hit ? '<span class="tag bad">⚠ choca</span>' : '')).join('') + '</ul>').join('') +
    `<h3>Complementos sin figura 3D</h3><ul>` + EXTRAS.map(e => row(e.name, e.qty, e.store, e.url, e.price, '', e.note, e.basis)).join('') + '</ul>';
  $('#shopTotal').innerHTML = `<b>${money(t.mid)}</b><span>rango ${money(t.lo)} – ${money(t.hi)} · precios en CAD, impuestos no incluidos</span>`;
}
function shopText() {
  const t = totals();
  return ['LISTA DE COMPRAS · IMIX 10C (Japandi)', ...shopRows().map(({ p, qty }) => `- ${qty}× ${p.name} (${p.store}) ${p.w}×${p.d}×${p.h} m · ~${money(p.price)} c/u · ${p.url}`),
    ...EXTRAS.map(e => `- ${e.qty}× ${e.name} (${e.store}) · ~${money(e.price)} c/u · ${e.url}`), `TOTAL estimado: ${money(t.mid)} (rango ${money(t.lo)} – ${money(t.hi)}), CAD sin impuestos`].join('\n');
}
$('#cartBtn').onclick = () => { menu.hidden = true; select(null); renderShop(); document.body.classList.add('photo'); $('#shop').hidden = false; $('#shopBody').scrollTop = 0; };
$('#shopClose').onclick = () => { $('#shop').hidden = true; document.body.classList.remove('photo'); redraw(); };
$('#copyShop').onclick = async () => {
  const b = $('#copyShop');
  try { await navigator.clipboard.writeText(shopText()); b.textContent = '¡Copiada!'; } catch { b.textContent = 'No se pudo copiar'; }
  setTimeout(() => { b.textContent = 'Copiar lista'; }, 1600);
};

/* ============================================================
   Modo Tomas: cámara libre, captura con marco 3:2 / 2:3 y prompt según lo que encuadres
   ============================================================ */
let shooting = false, shootPrev = null, portrait = false, curShot = -1, planCache = null;
const myShots = [];
const TOUR_BY_ROOM = { liv: ['tour-sala.jpg'], prim: ['tour-recamara-principal.jpg', 'tour-bano-principal.jpg'], kit: ['tour-cocina.jpg', 'tour-pasillo.jpg'],
  bed2: ['tour-recamara2-closet.jpg', 'tour-cocina-hacia-recamara2.jpg'], entry: ['tour-entrada.jpg', 'tour-pasillo.jpg'] };
const INSPO_BY_ROOM = { liv: [2, 4], prim: [3, 2], kit: [2, 1], bed2: [3, 4], entry: [1] };
const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
const deg = r => THREE.MathUtils.radToDeg(r), rad = d => THREE.MathUtils.degToRad(d);
const vfovToMM = v => 18 / (Math.tan(rad(v / 2)) * 4 / 3);          // lente equivalente (35 mm) de una toma 4:3
const toPx = v => [v.x / S + X0, v.z / S + Y0];

// lente: mm equivalentes (formato 35 mm) <-> campo de visión horizontal de la pantalla
function setLens(mm) { mm = THREE.MathUtils.clamp(mm, 14, 85); const tH = 18 / mm; camera.fov = deg(2 * Math.atan(tH / camera.aspect)); camera.updateProjectionMatrix(); }
function getLens() { return 18 / (Math.tan(rad(camera.fov / 2)) * camera.aspect); }
const camDir = () => camera.getWorldDirection(new THREE.Vector3());
function setDir(d) { controls.target.copy(camera.position).addScaledVector(d.normalize(), .1); camera.lookAt(controls.target); controls.update(); }
function moveCam(f, r, u) {
  const d = camDir(), fh = new THREE.Vector3(d.x, 0, d.z).normalize(), rh = new THREE.Vector3(-fh.z, 0, fh.x);
  const delta = fh.multiplyScalar(f).addScaledVector(rh, r); delta.y += u;
  delta.y = THREE.MathUtils.clamp(camera.position.y + delta.y, .3, 6) - camera.position.y;   // altura entre 0.3 y 6 m
  camera.position.add(delta); controls.target.add(delta); controls.update(); syncCamUI(); redraw();
}
function turnCam(yawD, pitchD) {
  const d = camDir(); let yaw = Math.atan2(d.x, -d.z) + rad(yawD), pitch = THREE.MathUtils.clamp(Math.asin(d.y) + rad(pitchD), rad(-85), rad(60));
  setDir(new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))); syncCamUI(); redraw();
}
const PRESETS = [];
ROOMDEF.forEach(r => {
  if (r.eye) PRESETS.push({ label: title(r.n) + (r.alt ? ' · 1' : ''), eye: [...r.eye, 1.5], tg: [...r.tg, 1.0], mm: vfovToMM(r.fov) });
  if (r.alt) PRESETS.push({ label: title(r.n) + ' · 2', eye: [...r.alt.eye, 1.5], tg: [...r.alt.tg, 1.0], mm: vfovToMM(r.alt.fov) });
});
PRESETS.push({ label: 'Rec. 2 · iso escritorio', eye: [290, 1405, 3.7], tg: [485, 1262, .5], mm: vfovToMM(48) },
  { label: 'Rec. 2 · iso clóset', eye: [585, 1335, 4.2], tg: [340, 1288, .7], mm: vfovToMM(54), tall: true },
  { label: 'Aérea (todo)', eye: [(CENTER.x + 4.5) / S + X0, 12.1, (CENTER.z + 12.2) / S + Y0], tg: [CENTER.x / S + X0, 0, (CENTER.z - .3) / S + Y0], mm: vfovToMM(42) });
function applyPreset(p) {
  const pos = new THREE.Vector3(wx(p.eye[0]), p.eye[2], wz(p.eye[1])), tg = new THREE.Vector3(wx(p.tg[0]), p.tg[2], wz(p.tg[1]));
  doorsTall = !!p.tall; camera.position.copy(pos); setDir(tg.sub(pos)); setLens(p.mm); syncCamUI(); redraw();
}
function buildPresetChips() {
  ['#camPresets', '#hudPresets'].forEach(sel => {
    const box = $(sel); box.innerHTML = '';
    PRESETS.forEach(p => {
      const b = document.createElement('button'); b.textContent = p.label;
      b.onclick = () => { applyPreset(p); buzz(8); document.querySelectorAll('#camPresets button, #hudPresets button').forEach(x => x.classList.toggle('on', x.textContent === p.label)); $('#hudPresets').classList.remove('open'); };
      box.appendChild(b);
    });
  });
}
function camRoom() { const [X, Y] = toPx(camera.position); return ROOMDEF.find(r => X >= r.r[0] && X <= r.r[2] && Y >= r.r[1] && Y <= r.r[3]) || null; }
function syncCamUI() {
  if (!shooting) return;
  const d = camDir(), room = camRoom(), yaw = (deg(Math.atan2(d.x, -d.z)) + 360) % 360;
  const h = camera.position.y, outside = !room || h > 2.3;
  const wm = outside ? 3 : 0; if (wm !== wallMode) { wallMode = wm; applyWalls(false); }
  $('#camInfo').textContent = `${room ? title(room.n) : 'Fuera'} · mira ${COMPASS[Math.round(yaw / 45) % 8].replace('north', 'N').replace('south', 'S').replace('east', 'E').replace('west', 'O')} · ${h.toFixed(1)} m · ${Math.round(getLens())} mm${speedMul !== 1 ? ' · vel ×' + speedMul.toFixed(1) : ''}`;
  if (document.activeElement !== $('#camH')) $('#camH').value = h; if (document.activeElement !== $('#camMM')) $('#camMM').value = getLens();
  $('#hudInfo').textContent = $('#camInfo').textContent;
  $('#camHv').textContent = h.toFixed(2) + ' m'; $('#camMMv').textContent = Math.round(getLens()) + ' mm';
}
const availH = () => Math.max(220, innerHeight - ($('#cam').hidden ? 0 : $('#cam').offsetHeight) - 8);
function frameSize() { const ar = portrait ? 2 / 3 : 3 / 2, fw = Math.min(innerWidth, availH() * .96 * ar); return { ar, fw, fh: fw / ar }; }
function layoutFrame() {
  // el marco se centra en el área visible sobre el panel; el eje óptico de la cámara pasa por su centro
  const { fw, fh } = frameSize(), b = $('#frameBox'), yc = availH() / 2 + 4;
  b.style.width = fw + 'px'; b.style.height = fh + 'px'; b.style.top = yc + 'px';
  camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight / 2 - yc, innerWidth, innerHeight); camera.updateProjectionMatrix();
  $('#camAspect').textContent = portrait ? 'Vertical 2:3' : 'Horizontal 3:2'; $('#hudAsp').textContent = portrait ? '2:3' : '3:2'; redraw();
}
function enterShoot() {
  if (shooting) return;
  select(null); menu.hidden = true; tween = null;
  shootPrev = { wm: wallMode, maxP: controls.maxPolarAngle, minP: controls.minPolarAngle, mb: { ...controls.mouseButtons } };
  controls.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null };   // el mouse lo manejo yo (mirar / deslizar)
  keys.clear(); cancelAnimationFrame(keyRaf); keyT = performance.now(); keyRaf = requestAnimationFrame(keyLoop);
  $('#keyHint').classList.remove('off');
  shooting = true; document.body.classList.add('shoot'); view = 'eye';
  controls.minDistance = .05; controls.maxPolarAngle = Math.PI * .97; controls.minPolarAngle = .03; controls.enableRotate = true;
  controls.enabled = false;   // gestos propios: HUD táctil, mouse y teclado
  roomLabels.forEach(m => { m.visible = false; });
  $('#frameGuide').hidden = false; buildPresetChips(); showShootUI();
  applyPreset(PRESETS.find(p => p.label.startsWith('Sala')) || PRESETS[0]);
  if (!prefs.classic) showGestureHint();
}
function exitShoot() {
  if (!shooting) return;
  shooting = false; doorsTall = false; document.body.classList.remove('shoot'); camera.clearViewOffset(); camera.updateProjectionMatrix();
  $('#cam').hidden = true; $('#frameGuide').hidden = true; controls.enabled = true;
  document.body.classList.remove('hud', 'hudoff'); $('#hudSet').hidden = true; $('#hudPresets').classList.remove('open'); joy = null; walkAnim = null; tp.clear();
  controls.maxPolarAngle = shootPrev.maxP; controls.minPolarAngle = shootPrev.minP; wallMode = shootPrev.wm; controls.mouseButtons = shootPrev.mb;
  cancelAnimationFrame(keyRaf); keys.clear(); if (document.pointerLockElement) document.exitPointerLock();
  view = '3d'; setView('3d'); applyWalls(false);
}
function holdBtn(id, fn) {
  const b = $(id); let raf = 0, t = 0;
  const loop = ts => { const dt = Math.min(.05, (ts - t) / 1000); t = ts; fn(dt); raf = requestAnimationFrame(loop); };
  b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); t = performance.now(); fn(.016); raf = requestAnimationFrame(loop); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => cancelAnimationFrame(raf)));
}
holdBtn('#mvF', dt => moveCam(dt * 1.0, 0, 0)); holdBtn('#mvB', dt => moveCam(-dt * 1.0, 0, 0));
holdBtn('#mvL', dt => moveCam(0, -dt * 1.0, 0)); holdBtn('#mvR', dt => moveCam(0, dt * 1.0, 0));
holdBtn('#tnL', dt => turnCam(-dt * 55, 0)); holdBtn('#tnR', dt => turnCam(dt * 55, 0));
holdBtn('#tlU', dt => turnCam(0, dt * 35)); holdBtn('#tlD', dt => turnCam(0, -dt * 35));
$('#camH').oninput = e => { const dy = +e.target.value - camera.position.y; moveCam(0, 0, dy); };
$('#camMM').oninput = e => { setLens(+e.target.value); syncCamUI(); redraw(); };
$('#camAspect').onclick = () => { portrait = !portrait; layoutFrame(); };
$('#camExit').onclick = exitShoot;
$('#photoBtn').onclick = enterShoot;
$('#shootBtn').onclick = enterShoot;
$('#packBtn').onclick = openPhoto;
addEventListener('resize', () => { if (shooting) { layoutFrame(); syncCamUI(); } });

/* ---------- Teclado + mouse (convenciones de Unity/Unreal, Blender e Inventor) ----------
   Unity: mantener botón derecho = volar con WASD, Q/E bajar/subir, Shift rápido, rueda = velocidad.
   Blender: botón central orbita, Shift+central desliza, rueda acerca; fly/walk: Shift rápido, Alt lento.
   Inventor: rueda acerca, botón central desliza.  Aquí: clic (izq. o der.) + arrastrar = mirar, central = deslizar. */
const keys = new Set(); let keyRaf = 0, keyT = 0, speedMul = 1, locked = false, mlook = null;
const typing = t => t && t.matches && t.matches('textarea, select, input[type="text"], input[type="checkbox"]');
function keyLoop(ts) {
  const dt = Math.min(.1, (ts - keyT) / 1000); keyT = ts;
  if (shooting && $('#shotModal').hidden) {
    const sp = 1.5 * speedMul * (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 3 : 1) * (keys.has('AltLeft') || keys.has('AltRight') ? .3 : 1);
    const f = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0), r = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0), u = (keys.has('KeyE') ? 1 : 0) - (keys.has('KeyQ') ? 1 : 0);
    if (f || r || u) moveCam(f * sp * dt, r * sp * dt, u * sp * dt * .7);
    const yw = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0), pt = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0);
    if (yw || pt) turnCam(yw * 70 * dt, pt * 45 * dt);
    if (joy !== null && (joyV.x || joyV.y)) { const mag = Math.hypot(joyV.x, joyV.y), sp = 1.6 * speedMul * (mag > .95 ? 2 : 1); moveCam(-joyV.y * sp * dt, joyV.x * sp * dt, 0); }
    if (walkAnim) {
      const k = Math.min(1, (ts - walkAnim.t0) / walkAnim.dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const delta = walkAnim.from.clone().lerp(walkAnim.to, e).sub(camera.position);
      camera.position.add(delta); controls.target.add(delta); controls.update(); syncCamUI(); redraw(); if (k >= 1) walkAnim = null;
    }
    if (!tp.size && (Math.abs(lookVel.x) > 3 || Math.abs(lookVel.y) > 3)) {     // inercia al soltar
      turnCam(lookVel.x * dt, lookVel.y * dt); const f = Math.pow(.02, dt); lookVel.x *= f; lookVel.y *= f;
    }
  }
  keyRaf = requestAnimationFrame(keyLoop);
}
const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
addEventListener('keydown', e => {
  if (!shooting || typing(e.target) || e.ctrlKey || e.metaKey) return;
  if (MOVE_KEYS.has(e.code)) { keys.add(e.code); e.preventDefault(); }
  else if (e.code === 'Enter' && $('#shotModal').hidden) { e.preventDefault(); $('#shotNow').click(); }
  else if (e.code === 'BracketRight' || e.key === '+') { speedMul = Math.min(4, speedMul * 1.25); syncCamUI(); }
  else if (e.code === 'BracketLeft' || e.key === '-') { speedMul = Math.max(.25, speedMul / 1.25); syncCamUI(); }
  else if (e.code === 'KeyH') $('#keyHint').classList.toggle('off');
  else if (e.code === 'Escape' && !$('#shotModal').hidden) $('#shotMore').click();
});
addEventListener('keyup', e => { keys.delete(e.code); });
addEventListener('blur', () => keys.clear());

canvas.addEventListener('pointerdown', e => {
  if (!shooting || e.pointerType !== 'mouse') return;
  if (e.button === 0 || e.button === 2) mlook = { id: e.pointerId, mode: 'look' };
  else if (e.button === 1) { mlook = { id: e.pointerId, mode: 'pan' }; e.preventDefault(); }
  if (mlook) { try { canvas.setPointerCapture(e.pointerId); } catch { } }
});
canvas.addEventListener('pointermove', e => {
  if (!shooting || e.pointerType !== 'mouse') return;
  if (locked) { turnCam(e.movementX * .1, -e.movementY * .1); return; }
  if (!mlook || e.pointerId !== mlook.id) return;
  if (mlook.mode === 'look') turnCam(e.movementX * .12, -e.movementY * .12);
  else moveCam(0, -e.movementX * .004, e.movementY * .004);
});
const endLook = e => { if (mlook && e.pointerId === mlook.id) mlook = null; };
canvas.addEventListener('pointerup', endLook); canvas.addEventListener('pointercancel', endLook);
canvas.addEventListener('wheel', e => {
  if (!shooting) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (mlook && mlook.mode === 'look') { speedMul = THREE.MathUtils.clamp(speedMul * (e.deltaY < 0 ? 1.15 : 1 / 1.15), .25, 4); syncCamUI(); }   // como Unity: rueda con clic = velocidad
  else { const d = camDir().multiplyScalar(-Math.sign(e.deltaY) * .4 * speedMul * (e.shiftKey ? 3 : 1)); camera.position.add(d); controls.target.add(d); controls.update(); syncCamUI(); redraw(); }
}, { capture: true, passive: false });

// mouse bloqueado (como un juego en primera persona); puede no estar permitido dentro del visor
$('#lockBtn').onclick = () => { try { if (locked) document.exitPointerLock(); else canvas.requestPointerLock(); } catch { lockFail(); } };
function lockFail() { const el = $('#camInfo'), t = el.textContent; el.textContent = 'Aquí no se puede bloquear el mouse: usa clic + arrastrar'; setTimeout(() => { if (el.textContent.startsWith('Aquí')) el.textContent = t; syncCamUI(); }, 2800); }
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; $('#lockBtn').classList.toggle('on', locked); });
document.addEventListener('pointerlockerror', lockFail);
$('#camToggle').onclick = () => { const m = $('#cam').classList.toggle('mini'); $('#camToggle').textContent = m ? '▴' : '▾'; layoutFrame(); };

/* ---------- HUD táctil estilo juego móvil ----------
   Joystick virtual (caminar) · arrastrar = mirar con inercia · pellizcar = lente · dos dedos = deslizar / subir ·
   doble toque = ir ahí · obturador grande · vibración · modo zurdo · sensibilidad. */
const PREF_KEY = 'imix-cam-prefs';
const prefs = (() => { const d = { sens: .2, invert: false, lefty: false, classic: !matchMedia('(pointer:coarse)').matches }; try { return { ...d, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch { return d; } })();
const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { } };
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch { } };
let joy = null, walkAnim = null, pinch = null, lastTap = { t: 0, x: 0, y: 0 };
const joyV = { x: 0, y: 0 }, lookVel = { x: 0, y: 0 }, tp = new Map();
function applyPrefs() { document.body.classList.toggle('lefty', prefs.lefty); $('#setSens').value = prefs.sens; $('#setInvert').checked = prefs.invert; $('#setLefty').checked = prefs.lefty; $('#setClassic').checked = prefs.classic; }
function showShootUI() { const hud = !prefs.classic; document.body.classList.toggle('hud', hud); document.body.classList.remove('hudoff'); $('#cam').hidden = hud; layoutFrame(); }
function showGestureHint() {
  let seen = false; try { seen = localStorage.getItem('imix-gesture-seen') === '1'; } catch { }
  if (seen) return;
  const h = $('#gestureHint'); h.classList.add('show');
  const hide = () => { h.classList.remove('show'); try { localStorage.setItem('imix-gesture-seen', '1'); } catch { } };
  setTimeout(hide, 8000); canvas.addEventListener('pointerdown', hide, { once: true });
}
$('#setSens').oninput = e => { prefs.sens = +e.target.value; savePrefs(); };
$('#setInvert').onchange = e => { prefs.invert = e.target.checked; savePrefs(); };
$('#setLefty').onchange = e => { prefs.lefty = e.target.checked; savePrefs(); applyPrefs(); };
$('#setClassic').onchange = e => { prefs.classic = e.target.checked; savePrefs(); if (shooting) showShootUI(); };
$('#hudSetBtn').onclick = () => { $('#hudSet').hidden = !$('#hudSet').hidden; };
$('#hudSetClose').onclick = () => { $('#hudSet').hidden = true; };
$('#hudExit').onclick = exitShoot;
$('#hudPre').onclick = () => $('#hudPresets').classList.toggle('open');
$('#hudAsp').onclick = () => $('#camAspect').click();
$('#hudHide').onclick = () => { document.body.classList.toggle('hudoff'); buzz(6); };
$('#hudShutter').onclick = () => { buzz(18); $('#shotNow').click(); };
holdBtn('#hUp', dt => moveCam(0, 0, dt * 1.0)); holdBtn('#hDn', dt => moveCam(0, 0, -dt * 1.0));
applyPrefs();

// joystick virtual: analógico con zona muerta; empujarlo al borde = correr
const joyEl = $('#joy'), knob = $('#joyKnob');
function joyUpdate(e) {
  const r = joyEl.getBoundingClientRect(), R = r.width / 2 - 10;
  let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const len = Math.hypot(dx, dy);
  if (len > R) { dx *= R / len; dy *= R / len; }
  knob.style.transform = `translate(${dx}px,${dy}px)`;
  const mag = Math.hypot(dx, dy) / R, sc = mag < .12 ? 0 : (mag - .12) / (.88 * mag);
  joyV.x = dx / R * sc; joyV.y = dy / R * sc;
}
joyEl.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); joy = e.pointerId; walkAnim = null; try { joyEl.setPointerCapture(e.pointerId); } catch { } joyUpdate(e); });
joyEl.addEventListener('pointermove', e => { if (joy === e.pointerId) joyUpdate(e); });
const joyEnd = e => { if (joy === e.pointerId) { joy = null; joyV.x = joyV.y = 0; knob.style.transform = ''; } };
joyEl.addEventListener('pointerup', joyEnd); joyEl.addEventListener('pointercancel', joyEnd);

// gestos sobre la vista: 1 dedo mira (con inercia), 2 dedos pellizcan el lente y deslizan/suben, doble toque camina
const fovScale = () => (deg(2 * Math.atan(18 / getLens()))) / 82;   // con lente largo, gira más despacio
canvas.addEventListener('pointerdown', e => {
  if (!shooting || e.pointerType === 'mouse') return;
  tp.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now(), lt: 0, moved: false });
  try { canvas.setPointerCapture(e.pointerId); } catch { }
  lookVel.x = lookVel.y = 0; walkAnim = null;
  if (tp.size === 2) { const [a, b] = [...tp.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
});
canvas.addEventListener('pointermove', e => {
  if (!shooting || e.pointerType === 'mouse') return;
  const p = tp.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (Math.hypot(p.x - p.x0, p.y - p.y0) > 8) p.moved = true;
  if (tp.size === 1) {
    const s = prefs.sens * fovScale() * (prefs.invert ? -1 : 1);
    turnCam(dx * s, -dy * s);
    const now = performance.now(), dtm = Math.max(8, now - (p.lt || now - 16)); p.lt = now;
    lookVel.x = .6 * lookVel.x + .4 * (dx * s) / dtm * 1000; lookVel.y = .6 * lookVel.y + .4 * (-dy * s) / dtm * 1000;
  } else if (tp.size === 2 && pinch) {
    const [a, b] = [...tp.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (pinch.d > 8 && d > 8) setLens(getLens() * d / pinch.d);                       // pellizco = lente (zoom)
    moveCam(0, (mx - pinch.mx) * .006, -(my - pinch.my) * .006);                      // dos dedos = deslizar / subir
    pinch = { d, mx, my };
  }
});
const tpEnd = e => {
  if (!shooting || e.pointerType === 'mouse') return;
  const p = tp.get(e.pointerId); if (!p) return;
  const wasOne = tp.size === 1; tp.delete(e.pointerId); pinch = null;
  if (wasOne && !p.moved && e.type === 'pointerup' && performance.now() - p.t < 350) {   // toque corto
    const now = performance.now();
    if (now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) { walkTo(e.clientX, e.clientY); lastTap.t = 0; }
    else lastTap = { t: now, x: e.clientX, y: e.clientY };
  }
  if (!tp.size && Math.hypot(lookVel.x, lookVel.y) < 6) lookVel.x = lookVel.y = 0;
};
canvas.addEventListener('pointerup', tpEnd); canvas.addEventListener('pointercancel', tpEnd);
function walkTo(x, y) {   // doble toque en el piso: caminar hasta ahí
  const rc = new THREE.Raycaster(), pt = new THREE.Vector3(); rc.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
  if (!rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt) || pt.distanceTo(camera.position) > 14) return;
  walkAnim = { from: camera.position.clone(), to: new THREE.Vector3(pt.x, camera.position.y, pt.z), t0: performance.now(), dur: 700 }; buzz(10);
}

// --- captura ---
function captureView() {
  const { ar, fw } = frameSize(), w = portrait ? 1024 : 1536, h = portrait ? 1536 : 1024;
  const tH = Math.tan(rad(camera.fov / 2)) * camera.aspect * fw / innerWidth, vf = deg(2 * Math.atan(tH / ar));
  const pos = camera.position.clone(), tgt = pos.clone().addScaledVector(camDir(), 5);
  const url = capture(w, h, pos, tgt, vf, wallMode, false);
  // metadatos de la cámara y qué se ve en el encuadre
  const cam2 = new THREE.PerspectiveCamera(vf, ar, .1, 100); cam2.position.copy(pos); cam2.lookAt(tgt); cam2.updateMatrixWorld(); cam2.updateProjectionMatrix();
  const inFrame = p => { const v = p.clone().project(cam2); return v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1; };
  const ids = items.filter(it => {
    const k = CATALOG[it.type], y = (it.elev ?? k.elev ?? 0) + (k.rug ? .01 : (k.h || .5) / 2);
    const pts = [[0, 0], ...corners(it.x, it.z, k.w, k.d, it.rot).map(c => [c[0] - it.x, c[1] - it.z])].map(([dx, dz]) => new THREE.Vector3(it.x + dx, y, it.z + dz));
    return pts.some(inFrame);
  }).map(it => it.id);
  const rooms = new Set(); const cr = camRoom(); if (cr && cr.k !== 'patio') rooms.add(cr.k);
  ROOMDEF.forEach(r => { const q = rectOf(r.r); if (inFrame(new THREE.Vector3(q.cx, .8, q.cz))) rooms.add(r.k); });
  ids.forEach(id => { const r = roomOf(byId(id)); if (r) rooms.add(r.k); });
  const closet = rooms.has('bed2') || inFrame(new THREE.Vector3(wx(298), 1.2, wz(1276)));
  const d = camDir(), yaw = (deg(Math.atan2(d.x, -d.z)) + 360) % 360, pitch = deg(Math.asin(d.y)), hdg = COMPASS[Math.round(yaw / 45) % 8];
  const mmEq = 18 / tH, hf = deg(2 * Math.atan(tH)), ph = camera.position.y;
  let pos1 = 'outside the suite';
  if (cr) { const q = rectOf(cr.r); pos1 = `${cr.en.toLowerCase()}, about ${(camera.position.x - (q.cx - q.w / 2)).toFixed(1)} m from its west wall and ${(camera.position.z - (q.cz - q.d / 2)).toFixed(1)} m from its north wall`; }
  const tilt = Math.abs(pitch) < 4 ? 'level' : pitch < 0 ? `tilted down ${Math.round(-pitch)} degrees` : `tilted up ${Math.round(pitch)} degrees`;
  const tail = ` Reproduce exactly the viewpoint and framing of the camera reference image: everything visible in it must appear, and nothing that is outside it.`;
  const camFull = ph <= 2.3 && cr
    ? `Eye-level interior photograph from the ${pos1}, camera ${ph.toFixed(2)} m above the floor, looking ${hdg}, ${tilt}, about ${Math.round(mmEq)} mm lens equivalent (${Math.round(hf)} degrees horizontal field of view), vertical lines straight.${tail}`
    : `High-angle isometric-style view with the ceiling removed and the near walls cut away: camera ${ph.toFixed(1)} m above the floor, ${cr ? 'above the ' + pos1 : 'outside the suite'}, looking ${hdg}, ${tilt}, about ${Math.round(mmEq)} mm lens equivalent (${Math.round(hf)} degrees horizontal field of view).${tail}`;
  return { url, w, h, ids, rooms: [...rooms], closet, camFull, label: `${cr ? title(cr.n) : 'Exterior'} · ${hdg} · ${ph.toFixed(1)} m` };
}
function planImage() {
  const key = snapshot(); if (planCache && planCache.key === key) return planCache.url;
  const url = planShot(1200, 1600, true); planCache = { key, url }; return url;
}
$('#shotNow').onclick = () => {
  const btn = $('#shotNow'); btn.disabled = true; btn.textContent = 'Capturando…';
  setTimeout(() => {
    try { const s = captureView(); s.n = myShots.length + 1; myShots.push(s); curShot = myShots.length - 1; $('#shotModal').hidden = false; document.body.classList.add('photo'); renderShotModal(); }
    finally { btn.disabled = false; btn.textContent = '📸 Capturar'; redraw(); }
  }, 30);
};
function renderShotModal() {
  const s = myShots[curShot]; if (!s) return;
  const style = $('#mstyle').value || Object.keys(STYLES)[0];
  $('#shotThumbs').innerHTML = myShots.map((m, i) => `<button class="${i === curShot ? 'on' : ''}" data-i="${i}">Toma ${m.n}</button>`).join('');
  $('#shotThumbs').querySelectorAll('button').forEach(b => { b.onclick = () => { curShot = +b.dataset.i; renderShotModal(); }; });
  const plan = $('#mPlan').checked, tour = $('#mTour').checked, insp = $('#mInspo').checked;
  const name = `mi-toma-${s.n}.jpg`;
  $('#shotImgs').innerHTML = `<figure><img alt="${name}" src="${s.url}"><figcaption>${name} · ${s.label}</figcaption></figure>` + (plan ? `<figure><img alt="plano-numerado.jpg" src="${planImage()}"><figcaption>plano-numerado.jpg</figcaption></figure>` : '');
  const tourF = tour ? [...new Set(s.rooms.flatMap(r => TOUR_BY_ROOM[r] || []))].slice(0, 3) : [];
  const inspF = insp ? [...new Set(s.rooms.flatMap(r => INSPO_BY_ROOM[r] || [2]))].slice(0, 3).map(n => `inspo-${n}.jpg`) : [];
  const files = [[name, 'camera reference captured from the 3D app: reproduce this exact viewpoint and framing'],
    ...(plan ? [['plano-numerado.jpg', 'top-down plan of the furnished suite; the numbers match the furniture list (ground truth for the layout)']] : []),
    ...tourF.map(f => [f, 'real finishes of this unit (virtual-tour screenshot). Ignore the app buttons and text, and ignore its staged furniture: only copy floors, walls, doors, windows, cabinets, ceiling and light']),
    ...inspF.map(f => [f, 'inspiration photo: mood, lighting and styling only; never copy its furniture or layout'])];
  $('#shotAttach').innerHTML = '<b>Adjunta en este orden:</b> ' + files.map(([f], i) => `${i + 1}. ${f}`).join(' · ') + (tourF.length || inspF.length ? '<br>Las fotos del tour y de inspiración están en la carpeta <code>01-referencias</code> del paquete.' : '');
  $('#shotPrompt').value = buildPrompt('all', style, { files, camFull: s.camFull, custom: { ids: s.ids, rooms: s.rooms, closet: s.closet } });
  $('#shotWarn').textContent = s.ids.length ? '' : '⚠ No hay muebles dentro del encuadre. Mueve la cámara para que se vean.';
}
$('#mstyle').innerHTML = Object.entries(STYLES).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('');
['#mstyle', '#mPlan', '#mTour', '#mInspo'].forEach(id => { $(id).onchange = renderShotModal; });
$('#shotClose').onclick = () => { $('#shotModal').hidden = true; if (!shooting) document.body.classList.remove('photo'); else document.body.classList.remove('photo'); redraw(); };
$('#shotMore').onclick = () => { $('#shotModal').hidden = true; document.body.classList.remove('photo'); redraw(); };
// Portapapeles: prompt + imagen de la toma (el portapapeles solo admite PNG para imágenes)
const pngFromUrl = url => new Promise((res, rej) => {
  const im = new Image();
  im.onload = () => { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); c.toBlob(b => b ? res(b) : rej(new Error('png')), 'image/png'); };
  im.onerror = rej; im.src = url;
});
async function copyShot(mode) {
  const btn = { both: $('#shotCopy'), txt: $('#shotCopyTxt'), img: $('#shotCopyImg') }[mode], label = btn.textContent, s = myShots[curShot], text = $('#shotPrompt').value;
  const say = m => { btn.textContent = m; setTimeout(() => { btn.textContent = label; }, 2200); };
  try {
    if (mode === 'txt') { await navigator.clipboard.writeText(text); return say('¡Prompt copiado!'); }
    const item = { 'image/png': pngFromUrl(s.url) };
    if (mode === 'both') item['text/plain'] = new Blob([text], { type: 'text/plain' });
    await navigator.clipboard.write([new ClipboardItem(item)]);
    say(mode === 'both' ? '¡Copiados! Pega en ChatGPT' : '¡Imagen copiada!');
  } catch {
    if (mode !== 'img') { try { await navigator.clipboard.writeText(text); } catch { const t = $('#shotPrompt'); t.select(); try { document.execCommand('copy'); } catch { } } }
    say(mode === 'img' ? 'No se pudo: mantén presionada la imagen' : 'Prompt copiado (la imagen no se pudo: guárdala con clic largo)');
  }
}
$('#shotCopy').onclick = () => copyShot('both');
$('#shotCopyTxt').onclick = () => copyShot('txt');
$('#shotCopyImg').onclick = () => copyShot('img');
if (navigator.canShare) {
  $('#shotShare').hidden = false;
  $('#shotShare').onclick = async () => {
    try {
      const s = myShots[curShot], urls = [[`mi-toma-${s.n}.jpg`, s.url], ...($('#mPlan').checked ? [['plano-numerado.jpg', planImage()]] : [])];
      const fs = await Promise.all(urls.map(async ([n, u]) => new File([await (await fetch(u)).blob()], n, { type: 'image/jpeg' })));
      if (navigator.canShare({ files: fs })) await navigator.share({ files: fs, text: $('#shotPrompt').value });
    } catch { }
  };
}

/* ============================================================
   Loop
   ============================================================ */
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  layoutTray(); redraw();
}
addEventListener('resize', resize);
controls.addEventListener('change', () => { if (shooting) syncCamUI(); if (wallMode === 3) applyWalls(false); redraw(); });

function frame(now) {
  if (tween) {
    const k = Math.min(1, (now - tween.t0) / tween.ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    camera.position.lerpVectors(tween.p0, tween.p1, e);
    controls.target.lerpVectors(tween.t0v, tween.t1, e);
    camera.lookAt(controls.target);
    if (k >= 1) tween = null;
    controls.update(); dirty = true;
  }
  animateWalls();
  if (dirty) { dirty = false; renderer.render(scene, camera); updateChips(); }
  requestAnimationFrame(frame);
}

// Init
const saved = load();
resize();
applyWalls(); drawRoomLabels(); drawChips();
$('#unitsBtn').textContent = 'Unidades: ' + units;
buildRoomBar(); buildTabs(); buildCards();
loadItems(saved || JAPANDI_ITEMS);
setView('3d');
if (location.hash === '#top') setView('top');
if (location.hash === '#eye') setView('eye');
tween && (tween.ms = 1);
requestAnimationFrame(frame);
setTimeout(hideHint, 9000);
// Utilidades para generar el paquete de render (tools/make_pack.js)
const shotPx = (eye, tg, fov, w, h) => capture(w, h, new THREE.Vector3(wx(eye[0]), 1.5, wz(eye[1])), new THREE.Vector3(wx(tg[0]), 1.0, wz(tg[1])), fov, 0, false);
const planShot = (w, h, numbers) => { const tf = Math.tan(THREE.MathUtils.degToRad(21)), top = Math.max(12.6 / 2 / tf, 8.4 / 2 / (tf * (w / h))) * 1.04; return capture(w, h, new THREE.Vector3(wx(505), top, wz(996) + .01), new THREE.Vector3(wx(505), 0, wz(996)), 42, 1, numbers); };
const aerialShot = (w, h) => capture(w, h, new THREE.Vector3(CENTER.x + 4.5, 15.5 * .78, CENTER.z + 15.5 * .72 + 1), new THREE.Vector3(CENTER.x, 0, CENTER.z - .3), 42, 1, false);
// Vista alta/isométrica: eye y tg = [x px, y px, altura en m]; walls 3 = muros que tapan bajan solos
const isoShotPx = (eye, tg, fov, w, h, tall = false) => { doorsTall = tall; try { return capture(w, h, new THREE.Vector3(wx(eye[0]), eye[2], wz(eye[1])), new THREE.Vector3(wx(tg[0]), tg[2], wz(tg[1])), fov, 3, false); } finally { doorsTall = false; applyWalls(true); } };
window.__app = { setView, items: () => items, select, camera, controls, shopRows, totals, ROOMDEF, buildPrompt, describe, shotPx, isoShotPx, planShot, aerialShot, EXTRAS, PRODUCTS, CATALOG, STYLES, money, shopText };
