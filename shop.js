/* Catálogo de compra (Japandi/alternativo) + layout propuesto.
 *
 * Fuentes: fichas de IKEA y tiendas consultadas por búsqueda web (nov-2026). IKEA no tiene API pública
 * oficial y la API de Amazon exige una cuenta de afiliado con ventas, así que los precios son ESTIMADOS
 * en CAD y hay que confirmarlos en la tienda.
 *   dims: 'V' = medidas vistas en la ficha del producto · 'E' = medidas estimadas/genéricas, por confirmar
 *   basis: 'CA' = precio visto en IKEA Canadá · 'INT' = convertido de otro país · 'EST' = estimación
 */
export const PRODUCTS = [
  // ---------- Sala ----------
  { id: 'landskrona', name: 'Sofá LANDSKRONA 3 plazas', en: 'IKEA LANDSKRONA 3-seat sofa, light beige fabric', store: 'IKEA', room: 'Sala',
    url: 'https://www.ikea.com/ca/en/search/?q=LANDSKRONA', w: 2.04, d: .89, h: .78, b: 'sofa', color: '#d6cbb8', em: '🛋️',
    price: 1199, lo: 1050, hi: 1350, basis: 'INT', dims: 'V', note: '204×89×78 cm. Precio CA no encontrado; convertido de otros países.' },
  { id: 'frotorp', name: 'Mesa de centro FRÖTORP Ø88', en: 'IKEA FRÖTORP round coffee table, black glass top with anthracite marble-effect base', store: 'IKEA', room: 'Sala',
    url: 'https://www.ikea.com/ca/en/p/froetorp-coffee-table-anthracite-marble-effect-black-glass-70497582/', w: .88, d: .88, h: .35, b: 'round', color: '#2b2e33', em: '⚫',
    price: 229, lo: 199, hi: 259, basis: 'INT', dims: 'V', note: 'Ø88 × 35 cm. Parecida a la mesa negra de tu inspiración.' },
  { id: 'besta', name: 'Mueble TV BESTÅ 120', en: 'IKEA BESTÅ TV bench 120 cm in light oak', store: 'IKEA', room: 'Sala',
    url: 'https://www.ikea.com/ca/en/search/?q=BESTA+TV+bench+120', w: 1.2, d: .4, h: .38, b: 'tv', color: '#c9a77c', em: '📺',
    price: 89, lo: 79, hi: 119, basis: 'INT', dims: 'V', note: '120×40×38 cm. Puertas y patas se venden aparte; anclar a la pared.' },
  { id: 'lohals_l', name: 'Tapete de yute LOHALS 133×195', en: 'IKEA LOHALS flatwoven natural jute rug 133×195 cm', store: 'IKEA', room: 'Sala',
    url: 'https://www.ikea.com/ca/en/search/?q=LOHALS', w: 1.33, d: 1.95, h: .02, b: 'rug', rug: 1, color: '#c8b58c', em: '🟫',
    price: 99, lo: 79, hi: 129, basis: 'INT', dims: 'V', note: 'Yute natural, ~13 mm de grosor.' },
  { id: 'lohals_s', name: 'Tapete de yute LOHALS 80×150', en: 'IKEA LOHALS flatwoven natural jute rug 80×150 cm', store: 'IKEA', room: 'Entrada / recámara',
    url: 'https://www.ikea.com/ca/en/search/?q=LOHALS', w: .8, d: 1.5, h: .02, b: 'rug', rug: 1, color: '#c8b58c', em: '🟫',
    price: 39, lo: 29, hi: 49, basis: 'INT', dims: 'V', note: '80×150 cm.' },
  { id: 'varmblixt', name: 'Lámpara VARMBLIXT vidrio naranja', en: 'IKEA VARMBLIXT orange glass donut lamp, 30 cm, glowing', store: 'IKEA', room: 'Sala',
    url: 'https://www.ikea.com/ca/en/search/?q=VARMBLIXT', w: .3, d: .1, h: .3, elev: .38, air: 1, b: 'glowdisc', color: '#f2761c', em: '🟠',
    price: 99, lo: 79, hi: 119, basis: 'INT', dims: 'V', note: 'Ø30 cm, LED integrado. Es la "mushroom lamp" de tu inspiración. Se apoya sobre el mueble TV.' },
  { id: 'arclamp', name: 'Lámpara de arco naranja', en: 'matte black arc floor lamp with a warm orange dome shade', store: 'Amazon', room: 'Sala',
    url: 'https://www.amazon.ca/s?k=arc+floor+lamp+orange+dome', w: .35, d: .35, h: 1.9, b: 'arclamp', color: '#f08a24', em: '💡',
    price: 109, lo: 80, hi: 150, basis: 'EST', dims: 'E', note: 'Base ~35 cm, alcance ~1.3 m. Confirmar medidas del modelo elegido.' },
  { id: 'mirror_round', name: 'Espejo redondo con correa 50 cm', en: 'round black-framed mirror 50 cm hanging from a leather strap', store: 'Amazon', room: 'Sala',
    url: 'https://www.amazon.ca/s?k=round+mirror+black+frame+leather+strap+50cm', w: .5, d: .03, h: .5, elev: 1.35, air: 1, b: 'mirrorround', color: '#2b2e33', em: '🪞',
    price: 55, lo: 40, hi: 80, basis: 'EST', dims: 'E', note: 'Se cuelga sobre el sofá.' },
  { id: 'ledge', name: 'Repisa MOSSLANDA 55', en: 'IKEA MOSSLANDA picture ledge 55 cm holding small framed art', store: 'IKEA', room: 'Sala / entrada',
    url: 'https://www.ikea.com/ca/en/search/?q=MOSSLANDA+55', w: .55, d: .12, h: .05, elev: 1.5, air: 1, b: 'ledge', color: '#2b2e33', em: '🖼️',
    price: 10, lo: 8, hi: 14, basis: 'INT', dims: 'V', note: '55×12 cm, carga máx. 5 kg.' },
  { id: 'plant', name: 'Planta (pothos / monstera)', en: 'potted trailing pothos or monstera plant in a woven basket', store: 'IKEA / vivero', room: 'Varios',
    url: 'https://www.ikea.com/ca/en/search/?q=plant', w: .4, d: .4, h: 1.2, b: 'plant', color: '#5f9d4c', em: '🌿',
    price: 29, lo: 15, hi: 49, basis: 'EST', dims: 'E', note: 'Las que cuelgan (pothos) van en repisas.' },
  // ---------- Comedor ----------
  { id: 'roundtable', name: 'Mesa redonda 90 cm', en: 'round dining table 90 cm in light oak with black legs', store: 'Amazon', room: 'Comedor',
    url: 'https://www.amazon.ca/s?k=round+dining+table+90cm+small', w: .9, d: .9, h: .75, b: 'round', color: '#d9c3a0', em: '⭕',
    price: 179, lo: 130, hi: 260, basis: 'EST', dims: 'E', note: 'IKEA DOCKSTA mide 103 cm: queda justo en este comedor, por eso se propone una de 90 cm.' },
  { id: 'odger', name: 'Silla ODGER', en: 'IKEA ODGER chair in beige', store: 'IKEA', room: 'Comedor',
    url: 'https://www.ikea.com/ca/en/search/?q=ODGER', w: .45, d: .51, h: .81, b: 'chair', color: '#d9cdb6', em: '🪑',
    price: 99, lo: 79, hi: 119, basis: 'INT', dims: 'V', note: '45×51×81 cm, asiento a 43 cm.' },
  { id: 'regolit', name: 'Lámpara colgante de papel REGOLIT 45', en: 'IKEA REGOLIT paper pendant lampshade 45 cm, glowing warm', store: 'IKEA', room: 'Comedor',
    url: 'https://www.ikea.com/ca/en/p/regolit-pendant-lamp-shade-white-handmade-70103410', w: .45, d: .45, h: .45, elev: 1.75, air: 1, b: 'pendant', color: '#f6f1e6', em: '🏮',
    price: 15, lo: 12, hi: 25, basis: 'CA', dims: 'V', note: 'Pantalla CA$4.99 + juego de cable (~CA$10, aparte).' },
  // ---------- Recámaras ----------
  { id: 'tarva', name: 'Cama TARVA queen (pino)', en: 'IKEA TARVA solid pine queen bed frame in natural pine with charcoal linen bedding and oat pillows', store: 'IKEA', room: 'Recámaras',
    url: 'https://www.ikea.com/ca/en/p/tarva-bed-frame-pine-90249949/', w: 1.6, d: 2.09, h: .92, b: 'bed', color: '#cfa970', duvet: '#4a4f57', em: '🛏️',
    price: 159, lo: 149, hi: 159, basis: 'CA', dims: 'V', note: '160×209×92 cm. Sin base de tablillas ni colchón (ver extras).' },
  { id: 'gra', name: 'Buró flotante GRÅFJÄLLET', en: 'IKEA GRÅFJÄLLET wall-mounted bedside shelf in black steel', store: 'IKEA', room: 'Recámaras',
    url: 'https://www.ikea.com/ca/en/search/?q=GRAFJALLET', w: .42, d: .29, h: .31, elev: .3, b: 'cabinet', color: '#2b2e33', em: '🗄️',
    price: 49, lo: 39, hi: 55, basis: 'INT', dims: 'V', note: '42×29×31 cm, se cuelga a 30 cm del piso.' },
  { id: 'lantern', name: 'Lámpara de pared linterna de papel', en: 'plug-in wall lamp with a white paper lantern shade on a black arm', store: 'Amazon', room: 'Recámaras',
    url: 'https://www.amazon.ca/s?k=paper+lantern+plug+in+wall+sconce+black+arm', w: .32, d: .38, h: .32, elev: 1.5, air: 1, b: 'sconce', color: '#f4efe4', em: '🏮',
    price: 49, lo: 35, hi: 65, basis: 'EST', dims: 'E', note: 'Con enchufe, sin obra. Como las lámparas de tu foto del dormitorio.' },
  { id: 'art', name: 'Cuadro abstracto grande', en: 'large abstract framed painting with deep red organic shapes on cream, thin dark wood frame', store: 'IKEA / Amazon', room: 'Recámaras',
    url: 'https://www.ikea.com/ca/en/search/?q=BJORKSTA', w: 1.0, d: .04, h: .7, elev: 1.1, air: 1, b: 'frame', color: '#a83a32', em: '🖼️',
    price: 85, lo: 60, hi: 130, basis: 'EST', dims: 'E', note: 'Marco + lámina ~100×70 cm sobre la cabecera.' },
  { id: 'desk', name: 'Escritorio 105×50', en: 'IKEA MICKE-style desk 105×50 cm in white', store: 'IKEA', room: 'Recámara 2',
    url: 'https://www.ikea.com/ca/en/search/?q=MICKE+desk', w: 1.05, d: .5, h: .75, b: 'table', color: '#e8e2d8', em: '🖥️',
    price: 99, lo: 79, hi: 129, basis: 'EST', dims: 'E', note: 'Medidas de memoria, confirmar en la ficha.' },
  // ---------- Entrada ----------
  { id: 'tjusig', name: 'Banca TJUSIG con zapatera', en: 'IKEA TJUSIG bench with shoe storage in black', store: 'IKEA', room: 'Entrada',
    url: 'https://www.ikea.com/ca/en/p/tjusig-bench-with-shoe-storage-black-50152703', w: 1.08, d: .34, h: .5, b: 'cabinet', color: '#2b2e33', em: '👟',
    price: 90, lo: 85, hi: 90, basis: 'CA', dims: 'V', note: '108×34×50 cm, cabe ~8 pares de zapatos. CA$89.99.' },
  { id: 'hooks', name: 'Barra de ganchos TJUSIG 78', en: 'IKEA TJUSIG wall hanger rail 78 cm hung with bags and a scarf', store: 'IKEA', room: 'Entrada',
    url: 'https://www.ikea.com/ca/en/search/?q=TJUSIG+hanger', w: .78, d: .06, h: .12, elev: 1.55, air: 1, b: 'hooks', color: '#2b2e33', em: '🧥',
    price: 16, lo: 12, hi: 20, basis: 'INT', dims: 'V', note: '78 cm de largo.' },
  { id: 'mirror_led', name: 'Espejo de piso con LED 20×63"', en: 'full-length black-frame floor mirror 51×160 cm with warm LED backlight, leaning on the wall', store: 'Amazon / Home Depot', room: 'Entrada',
    url: 'https://www.amazon.ca/s?k=led+full+length+floor+mirror+20x63', w: .51, d: .05, h: 1.6, b: 'mirror', color: '#2b2e33', em: '🪞',
    price: 189, lo: 150, hi: 230, basis: 'EST', dims: 'V', note: '~51×160 cm (20×63 in). Precio visto en EE. UU., convertido.' },
];

// Complementos sin figura 3D: suman al presupuesto.
export const EXTRAS = [
  { name: 'Colchón queen', qty: 2, store: 'IKEA / otra', url: 'https://www.ikea.com/ca/en/search/?q=queen+mattress', price: 399, lo: 299, hi: 599, basis: 'EST', note: 'Elige según firmeza. 152×203 cm.' },
  { name: 'Base de tablillas LURÖY queen', qty: 2, store: 'IKEA', url: 'https://www.ikea.com/ca/en/search/?q=LUROY+queen', price: 50, lo: 50, hi: 50, basis: 'CA', note: 'CA$50 por unidad.' },
  { name: 'Ropa de cama de lino (carbón / avena)', qty: 2, store: 'IKEA / Amazon', url: 'https://www.amazon.ca/s?k=linen+duvet+cover+queen+charcoal', price: 130, lo: 90, hi: 180, basis: 'EST', note: 'Funda de edredón y fundas de almohada.' },
  { name: 'Tira LED cálida 5 m con enchufe', qty: 1, store: 'Amazon', url: 'https://www.amazon.ca/s?k=warm+white+led+strip+5m+plug+in', price: 30, lo: 20, hi: 45, basis: 'EST', note: 'Bajo repisas y espejo, como en tu inspiración.' },
  { name: 'Láminas / cuadros pequeños para repisas', qty: 1, store: 'IKEA / Etsy', url: 'https://www.ikea.com/ca/en/search/?q=picture+frame', price: 90, lo: 60, hi: 140, basis: 'EST', note: '3 a 4 piezas.' },
  { name: 'Manta tejida y cojines', qty: 1, store: 'IKEA / Amazon', url: 'https://www.amazon.ca/s?k=chunky+knit+throw+blanket+cream', price: 60, lo: 40, hi: 90, basis: 'EST', note: 'Textiles de la sala.' },
  { name: 'Velas y decoración pequeña', qty: 1, store: 'IKEA', url: 'https://www.ikea.com/ca/en/search/?q=candles', price: 40, lo: 25, hi: 60, basis: 'EST', note: '' },
];

// Layout propuesto: [producto, x px, y px, grados, elevación opcional]
export const JAPANDI = [
  // Sala
  ['landskrona', 599, 862, -90], ['besta', 468, 862, 90], ['frotorp', 526, 862, 0], ['lohals_l', 526, 862, 90],
  ['varmblixt', 468, 845, 90], ['arclamp', 608, 782, -90], ['plant', 476, 790, 0],
  ['mirror_round', 627, 862, -90], ['ledge', 624, 805, -90, 1.5], ['ledge', 624, 925, -90, 1.85],
  // Comedor
  ['roundtable', 500, 1068, 0], ['odger', 453, 1068, 90], ['odger', 547, 1050, -90], ['odger', 547, 1088, -90], ['regolit', 500, 1068, 0],
  // Recámara principal
  ['tarva', 344.5, 878, 90], ['gra', 286.3, 808, 90], ['gra', 286.3, 948, 90], ['lantern', 281, 808, 90], ['lantern', 281, 948, 90],
  ['art', 279, 878, 90], ['lohals_s', 423, 878, 90], ['plant', 436, 786, 0],
  // Recámara 2
  ['tarva', 418, 1286, 180], ['gra', 338, 1345, 180], ['gra', 498, 1345, 180], ['lantern', 338, 1352, 180], ['lantern', 498, 1352, 180],
  ['art', 418, 1353, 180], ['desk', 501, 1255, -90], ['plant', 345, 1215, 0],
  // Entrada
  ['tjusig', 692, 1251, 0], ['hooks', 692, 1243, 0], ['ledge', 692, 1246, 0, 1.9], ['mirror_led', 640, 1353, 180], ['lohals_s', 660, 1300, 90],
];
