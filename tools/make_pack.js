/* Genera render-pack/: imágenes de referencia, prompts por toma y la guía para ChatGPT.
 * Requiere un servidor estático en :8123 (python3 -m http.server 8123) y Playwright instalado.
 * Uso: NODE_PATH=$(npm root -g) node tools/make_pack.js */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'render-pack');
for (const d of ['01-referencias', '02-tomas', '03-prompts']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
const save = (url, rel) => fs.writeFileSync(path.join(OUT, rel), Buffer.from(url.split(',')[1], 'base64'));
const write = (rel, txt) => fs.writeFileSync(path.join(OUT, rel), txt);

const TOUR_DESC = 'real finishes of this unit (virtual-tour screenshot). Ignore the app buttons and text on it, and ignore its staged furniture: only copy floors, walls, doors, windows, cabinets, ceiling and light';
const INSPO_DESC = n => `inspiration photo ${n}: mood, lighting and styling only; never copy its furniture or layout`;
const ROOMS = {
  liv:   { slug: 'sala', es: 'Sala', tour: ['tour-sala.jpg'], inspo: [2, 4] },
  prim:  { slug: 'recamara-principal', es: 'Recámara principal', tour: ['tour-recamara-principal.jpg', 'tour-bano-principal.jpg'], inspo: [3, 2] },
  kit:   { slug: 'cocina-comedor', es: 'Cocina y comedor', tour: ['tour-cocina.jpg', 'tour-pasillo.jpg'], inspo: [2, 1] },
  bed2:  { slug: 'recamara-2', es: 'Recámara 2 (con clóset)', tour: ['tour-recamara2-closet.jpg', 'tour-cocina-hacia-recamara2.jpg'], inspo: [3, 4] },
  entry: { slug: 'entrada', es: 'Entrada', tour: ['tour-entrada.jpg', 'tour-pasillo.jpg'], inspo: [1] },
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  page.on('pageerror', e => console.log('ERR', e.message));
  await page.goto('http://localhost:8123/index.html');
  await page.waitForTimeout(3000);

  // --- imágenes ---
  save(await page.evaluate(() => __app.planShot(1200, 1600, true)), '01-referencias/plano-numerado.jpg');
  save(await page.evaluate(() => __app.aerialShot(1536, 1152)), '01-referencias/vista-aerea.jpg');
  const shots = [];   // { key, variant, file, room }
  for (const [key, meta] of Object.entries(ROOMS)) {
    const def = await page.evaluate(k => { const r = __app.ROOMDEF.find(x => x.k === k); return { eye: r.eye, tg: r.tg, fov: r.fov, alt: r.alt || null }; }, key);
    const views = [[1, def.eye, def.tg, def.fov]];
    if (def.alt) views.push([2, def.alt.eye, def.alt.tg, def.alt.fov]);
    for (const [n, eye, tg, fov] of views) {
      const file = `02-tomas/toma-${meta.slug}-${n}.jpg`;
      save(await page.evaluate(([e, t, f]) => __app.shotPx(e, t, f, 1536, 1152), [eye, tg, fov]), file);
      shots.push({ key, n, file, meta });
    }
  }

  // --- prompts por toma ---
  const promptFiles = [];
  const attachTxt = list => list.map(([f, d], i) => `${i + 1}. \`${f}\`  —  ${d}`).join('\n');
  for (const s of shots) {
    const files = [
      ['plano-numerado.jpg', 'top-down plan of the furnished suite; the numbers match the furniture list (ground truth for the layout)'],
      [path.basename(s.file), 'plain 3D camera reference (no textures): reproduce this exact viewpoint and framing'],
      ...s.meta.tour.map(f => [f, TOUR_DESC]),
      ...s.meta.inspo.map(n => [`inspo-${n}.jpg`, INSPO_DESC(n)]),
    ];
    const prompt = await page.evaluate(([k, f, alt]) => __app.buildPrompt(k, 'japandi', { files: f, alt }), [s.key, files, s.n === 2]);
    const attach = [['01-referencias/plano-numerado.jpg'], [s.file], ...s.meta.tour.map(f => ['01-referencias/' + f]), ...s.meta.inspo.map(n => [`01-referencias/inspo-${n}.jpg`])].map(a => a[0]);
    const name = `prompt-${s.meta.slug}-${s.n}.md`;
    write('03-prompts/' + name, `# ${s.meta.es} · toma ${s.n}\n\n## 1. Adjunta estos archivos (en este orden)\n\n${attach.map((a, i) => `${i + 1}. \`${a}\``).join('\n')}\n\n## 2. Pega este prompt\n\n\`\`\`text\n${prompt}\n\`\`\`\n\n## 3. Formato\n\nImagen horizontal 3:2 (1536×1024). Si el resultado no respeta la distribución, usa las frases de corrección de \`00-LEEME-chatgpt.md\`.\n`);
    promptFiles.push({ name, es: s.meta.es, n: s.n, attach });
  }
  // vistas isométricas de la recámara 2: hacia el escritorio y hacia el clóset
  const ISO = [
    { slug: 'iso-escritorio', es: 'Recámara 2 · isométrica hacia el escritorio', eye: [290, 1405, 3.7], tg: [485, 1262, 0.5], fov: 48, tall: false,
      cam: 'High-angle isometric-style view of the second bedroom with the ceiling removed and the near walls cut away. The camera hovers about 3.7 m above the floor outside the south-west corner, tilted down about 35 degrees, 35 mm lens, looking north-east toward the desk on the east wall. The full bed (head against the south wall, on the right side of the frame) with its wall art, two wall lamps and floating bedside shelves is in the foreground, the desk against the east wall is in the middle distance, and the white closet doors are on the near west wall.' },
    { slug: 'iso-closet', es: 'Recámara 2 · isométrica hacia el clóset', eye: [585, 1335, 4.2], tg: [340, 1288, 0.7], fov: 54, tall: true,
      cam: 'High-angle isometric-style view of the second bedroom with the ceiling removed and the near walls cut away. The camera hovers about 4.2 m above the floor outside the south-east corner, tilted down about 35 degrees, 35 mm lens, looking west-north-west toward the built-in closet: three white sliding doors, closed, fill the whole west wall (0.62 m deep x 2.46 m long closet). The bed (head against the south wall, on the left side of the frame) with its wall art and wall lamps is in the lower left, the plant by the closet door is in the middle, and the desk runs along the east wall in the lower right foreground.' },
  ];
  for (const v of ISO) {
    const file = `02-tomas/toma-recamara-2-${v.slug}.jpg`;
    save(await page.evaluate(([e, t, f, a]) => __app.isoShotPx(e, t, f, 1536, 1152, a), [v.eye, v.tg, v.fov, v.tall]), file);
    const files = [
      ['plano-numerado.jpg', 'top-down plan of the furnished suite; the numbers match the furniture list (ground truth for the layout)'],
      [path.basename(file), 'plain 3D camera reference (no textures): reproduce this exact high-angle viewpoint, framing and which walls are cut away'],
      ['tour-recamara2-closet.jpg', TOUR_DESC], ['tour-cocina-hacia-recamara2.jpg', TOUR_DESC], ['inspo-3.jpg', INSPO_DESC(3)],
    ];
    const prompt = await page.evaluate(([f, c]) => __app.buildPrompt('bed2', 'japandi', { files: f, camFull: c }), [files, v.cam + ' Natural perspective with slight wide-angle distortion only; keep verticals straight.']);
    const attach = ['01-referencias/plano-numerado.jpg', file, '01-referencias/tour-recamara2-closet.jpg', '01-referencias/tour-cocina-hacia-recamara2.jpg', '01-referencias/inspo-3.jpg'];
    const name = `prompt-recamara-2-${v.slug}.md`;
    write('03-prompts/' + name, `# ${v.es}\n\n## 1. Adjunta estos archivos (en este orden)\n\n${attach.map((a, i) => `${i + 1}. \`${a}\``).join('\n')}\n\n## 2. Pega este prompt\n\n\`\`\`text\n${prompt}\n\`\`\`\n\n## 3. Formato\n\nImagen horizontal 3:2 (1536×1024). Vista alta tipo maqueta: sin techo y con los muros cercanos cortados, como en la referencia de cámara.\n`);
    promptFiles.push({ name, es: v.es, n: '', attach });
  }
  // vista aérea completa
  {
    const files = [['plano-numerado.jpg', 'top-down numbered plan of the furnished suite (ground truth for the layout)'], ['vista-aerea.jpg', 'plain 3D aerial reference (no textures): reproduce this viewpoint'],
      ...[1, 2, 3, 4].map(n => [`inspo-${n}.jpg`, INSPO_DESC(n)])];
    const prompt = await page.evaluate(f => __app.buildPrompt('all', 'japandi', { files: f }), files);
    const attach = ['01-referencias/plano-numerado.jpg', '01-referencias/vista-aerea.jpg', ...[1, 2, 3, 4].map(n => `01-referencias/inspo-${n}.jpg`)];
    write('03-prompts/prompt-vista-aerea.md', `# Vista aérea de todo el departamento\n\n## 1. Adjunta estos archivos (en este orden)\n\n${attach.map((a, i) => `${i + 1}. \`${a}\``).join('\n')}\n\n## 2. Pega este prompt\n\n\`\`\`text\n${prompt}\n\`\`\`\n\n## 3. Formato\n\nImagen horizontal 3:2 (1536×1024).\n`);
    promptFiles.unshift({ name: 'prompt-vista-aerea.md', es: 'Vista aérea (todo el depto.)', n: '', attach });
  }

  // --- muebles, medidas y precios ---
  const data = await page.evaluate(() => {
    const items = __app.items();
    return {
      rows: items.map((it, i) => { const k = __app.CATALOG[it.type]; const p = k.shop; return { n: i + 1, name: k.n, store: p ? p.store : '—', w: k.w, d: k.d, h: k.h, elev: it.elev ?? k.elev ?? 0, price: p ? p.price : 0, url: p ? p.url : '', dims: p ? p.dims : '', desc: __app.describe(it, i + 1), x: +it.x.toFixed(3), z: +it.z.toFixed(3), rot: +(it.rot * 180 / Math.PI).toFixed(1), type: it.type }; }),
      extras: __app.EXTRAS, totals: __app.totals(), shopText: __app.shopText(),
    };
  });
  const cm = v => Math.round(v * 100);
  let md = `# Muebles, medidas y precios (Japandi)\n\nNúmeros = los del \`plano-numerado.jpg\`. Medidas en cm (ancho × fondo × alto). ✓ = medidas vistas en la ficha del producto; (?) = por confirmar. Precios estimados en CAD, sin impuestos.\n\n| # | Pieza | Tienda | Medidas (cm) | Altura de montaje | Precio est. |\n|---|---|---|---|---|---|\n`;
  for (const r of data.rows) md += `| ${r.n} | ${r.url ? `[${r.name}](${r.url})` : r.name} | ${r.store} | ${cm(r.w)} × ${cm(r.d)} × ${cm(r.h)} ${r.dims === 'V' ? '✓' : r.dims ? '(?)' : ''} | ${r.elev ? cm(r.elev) + ' cm' : '—'} | ${r.price ? 'CA$' + r.price : '—'} |\n`;
  md += `\n## Complementos sin figura 3D\n\n${data.extras.map(e => `- ${e.qty}× ${e.name} (${e.store}) ~CA$${e.price} c/u`).join('\n')}\n\n**Total estimado: CA$${Math.round(data.totals.mid).toLocaleString('en-CA')}** (rango CA$${Math.round(data.totals.lo).toLocaleString('en-CA')} – ${Math.round(data.totals.hi).toLocaleString('en-CA')}).\n\n## Posición exacta de cada pieza (texto del prompt)\n\n${data.rows.map(r => '- ' + r.desc).join('\n')}\n`;
  write('04-muebles-medidas-y-precios.md', md);
  write('layout.json', JSON.stringify({ unidades: 'metros; origen = esquina noroeste del balcón; x = este, z = sur; rot en grados', items: data.rows.map(({ desc, ...r }) => r) }, null, 1));

  // --- guía principal ---
  const master = fs.readFileSync(path.join(__dirname, 'render-pack-master.md'), 'utf8');
  const table = '| Toma | Prompt | Archivos que adjuntas |\n|---|---|---|\n' + promptFiles.map(p => `| ${p.es}${p.n ? ' · toma ' + p.n : ''} | \`03-prompts/${p.name}\` | ${p.attach.map(a => '`' + a.replace('01-referencias/', '').replace('02-tomas/', '') + '`').join(', ')} |`).join('\n');
  write('00-LEEME-chatgpt.md', master.replace('{{TABLA_TOMAS}}', table));
  write('INSTRUCCIONES-PROYECTO.txt', fs.readFileSync(path.join(__dirname, 'render-pack-instrucciones.txt'), 'utf8'));

  await browser.close();
  console.log('listo', promptFiles.length, 'prompts,', shots.length + 2, 'imágenes generadas');
})();
