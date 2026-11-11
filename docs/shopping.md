# Lista de compras Japandi (IKEA / Amazon)

Estilo tomado de las 4 fotos de inspiración (`reference/inspo-*.jpg`): luz ámbar cálida (lámpara de vidrio
naranja, farolitos de papel, espejo con LED), tapetes de yute, madera clara con acentos negros, ropa de cama
de lino en carbón/avena/óxido, plantas colgantes y cuadros.

## ¿Hay API de IKEA o Amazon?

| Tienda | API | Qué encontré |
|---|---|---|
| IKEA | **No hay API pública oficial.** | Existen endpoints internos que usa su sitio (búsqueda en `sik.search.blue.cdtapps.com`, disponibilidad en `api.salesitem.ingka.com`) y especificaciones de la comunidad (`idelsink/ikea-openapi`). No están soportados por IKEA, pueden cambiar sin aviso y hay que revisar sus términos de uso. También hay servicios de pago que los raspan (Apify, Zyla). |
| Amazon | **Creators API** (sustituye a la PA-API 5.0). | Exige una cuenta de Amazon Associates del mercado (amazon.ca) con al menos 10 ventas calificadas en 30 días; las credenciales de la PA-API anterior no sirven. |

Desde el entorno donde se construyó esta app, IKEA y Amazon rechazan las consultas directas (proxy), así que
**no se consultan precios en vivo**. Medidas y precios salen de las fichas de producto encontradas por búsqueda web
(noviembre de 2026). Cada producto en `shop.js` indica su grado de confianza:

- `dims: V` medidas vistas en la ficha del producto; `E` estimadas, por confirmar.
- `basis: CA` precio visto en IKEA Canadá · `INT` convertido de otro país · `EST` estimación.

Para precios en vivo, lo más sencillo es un enlace de afiliado (Amazon Associates) o un servicio de datos de pago;
la app ya guarda `url`, `price`, `lo` y `hi` por producto, así que bastaría un script que los actualice.

## Presupuesto estimado (CAD, sin impuestos)

Total del layout propuesto: **≈ CA$5,200** (rango ≈ CA$4,200 – 6,700), incluyendo ~CA$1,380 de complementos sin
figura 3D (colchones, bases, ropa de cama, LED, láminas, textiles). Lo más caro: sofá LANDSKRONA (~1,200) y
2 colchones queen (~800). Los precios exactos están en la app (🛒) y en `shop.js`.

## Medidas verificadas (fichas de IKEA)

LANDSKRONA 3 plazas 204×89×78 cm · FRÖTORP Ø88×35 cm · BESTÅ TV 120×40×38 cm · LOHALS 133×195 y 80×150 cm ·
VARMBLIXT Ø30 cm · TARVA queen 160×209×92 cm (CA$149–159) · GRÅFJÄLLET 42×29×31 cm · ODGER 45×51×81 cm ·
TJUSIG banca 108×34×50 cm (CA$89.99) · MOSSLANDA 55×12 cm · REGOLIT 45 cm (CA$4.99).

## Ajustes por medidas

- Sala (2.70 m de ancho): sofá 0.89 + mesa 0.88 + mueble TV 0.40 deja ~27 cm de paso a cada lado de la mesa
  (ajustado). Alternativa: mesa de centro de ~70 cm.
- Comedor: IKEA DOCKSTA (Ø103) queda justo; se propone una mesa redonda de 90 cm de Amazon (por confirmar).
- Recámaras: cama TARVA queen mide 160×209 cm (más grande que una queen genérica de 152×203).
- Entrada: se corrigió el plano (la puerta está en el muro este); banca, ganchos, repisa, espejo con LED y tapete.
