# Paquete de render para ChatGPT · IMIX Suite 10C (estilo Japandi)

Este paquete convierte a ChatGPT en tu "motor de render": le das el plano numerado, la toma de cámara, las fotos reales del tour y tus fotos de inspiración, y te devuelve imágenes fotorrealistas del departamento amueblado.

> Las imágenes de referencia salen de un modelo 3D sencillo (sin texturas). Sirven para fijar **dónde va cada mueble, su tamaño y el ángulo de cámara**. El realismo (materiales, luz, textiles) lo pone ChatGPT.

## Qué hay en la carpeta

```
00-LEEME-chatgpt.md              ← esta guía
01-referencias/
  plano-numerado.jpg             plano de planta con cada mueble numerado
  vista-aerea.jpg                vista 3D de todo el departamento
  plano-original-10C.jpg         plano oficial del constructor (referencia de arquitectura)
  tour-*.jpg                     capturas del tour virtual: acabados reales
  inspo-1..4.jpg                 tus fotos de inspiración (solo ambiente)
02-tomas/                        referencia de cámara de cada cuarto (2 ángulos por cuarto)
03-prompts/                      un prompt por toma, con la lista de archivos a adjuntar
04-muebles-medidas-y-precios.md  lista numerada con medidas, tiendas, precios y posiciones
layout.json                      posiciones de los muebles (datos)
```

## Antes de empezar

- Necesitas **ChatGPT con generación de imágenes** (Plus o superior). Cada mensaje admite hasta 10 archivos; cada prompt de este paquete usa 5 a 7.
- Orientación del plano: **arriba = norte = lado de las ventanas y el balcón; derecha = este**.
- Las fotos del tour son de **otra unidad amueblada distinto**. Úsalas solo por los acabados (pisos, paredes, gabinetes, puertas), no por los muebles.

## Opción A (recomendada): un Proyecto de ChatGPT

1. En ChatGPT crea un **Proyecto** nuevo llamado "IMIX 10C render".
2. En *Instrucciones del proyecto* pega el **Mensaje de arranque** (más abajo).
3. En *Archivos del proyecto* sube todo `01-referencias/` y `04-muebles-medidas-y-precios.md`. Así no los repites en cada toma.
4. Para cada toma, abre un chat dentro del proyecto, **adjunta** `02-tomas/toma-….jpg` y pega el prompt de `03-prompts/`.

## Opción B: chat suelto

1. Abre un chat nuevo y pega el **Mensaje de arranque**.
2. Para cada toma, abre `03-prompts/prompt-….md`: adjunta los archivos que enumera (en ese orden) y pega el prompt.
3. Pide **una imagen por mensaje**.

## Mensaje de arranque (pégalo primero)

```text
You are my interior-visualization render engine. I will send you one shot at a time. For each shot I attach:
(1) a numbered top-down plan of a real 664 sq ft condo (Suite 10C, 2 bedrooms, 2 bathrooms) with every furniture piece numbered,
(2) a plain, untextured 3D camera reference that shows the exact viewpoint and framing I want,
(3) screenshots of the real unit's virtual tour (finishes only),
(4) inspiration photos (mood only).
A text prompt lists every piece with real dimensions and its position.

For every shot, generate ONE photorealistic interior photograph. Rules:
- The layout is ground truth. Place exactly the listed furniture, with the listed proportions, at the listed positions. Do not add, remove or move furniture, walls, windows, doors or built-ins.
- Reproduce the camera viewpoint and framing of the 3D camera reference (eye height about 1.5 m, wide-angle, vertical lines straight).
- Use the tour screenshots for the real finishes: grey-brown wood-look vinyl plank floor, white walls and ceiling, floor-to-ceiling windows, dark grey flat-panel kitchen cabinets with grey backsplash and stainless appliances, white panel doors.
- Use the inspiration photos only for mood: warm amber lamp light mixed with soft window light, jute rugs, light pine/oak with matte black accents, linen bedding, paper lanterns, trailing plants. Never copy their furniture.
- Keep the whole series consistent: same floor colour, same wall white, same light temperature (early evening, lamps on), same textiles.
- No people, no text, no watermarks, no extra decor that blocks the furniture list.
- Output landscape 3:2 (1536x1024) unless I say otherwise. After each image add one short line: anything you could not place exactly as listed.
```

## Tomas disponibles

| Toma | Prompt | Archivos que adjuntas |
|---|---|---|
| Vista aérea (todo el depto.) | `03-prompts/prompt-vista-aerea.md` | `plano-numerado.jpg`, `vista-aerea.jpg`, `inspo-1.jpg`, `inspo-2.jpg`, `inspo-3.jpg`, `inspo-4.jpg` |
| Sala · toma 1 | `03-prompts/prompt-sala-1.md` | `plano-numerado.jpg`, `toma-sala-1.jpg`, `tour-sala.jpg`, `inspo-2.jpg`, `inspo-4.jpg` |
| Sala · toma 2 | `03-prompts/prompt-sala-2.md` | `plano-numerado.jpg`, `toma-sala-2.jpg`, `tour-sala.jpg`, `inspo-2.jpg`, `inspo-4.jpg` |
| Recámara principal · toma 1 | `03-prompts/prompt-recamara-principal-1.md` | `plano-numerado.jpg`, `toma-recamara-principal-1.jpg`, `tour-recamara-principal.jpg`, `tour-bano-principal.jpg`, `inspo-3.jpg`, `inspo-2.jpg` |
| Recámara principal · toma 2 | `03-prompts/prompt-recamara-principal-2.md` | `plano-numerado.jpg`, `toma-recamara-principal-2.jpg`, `tour-recamara-principal.jpg`, `tour-bano-principal.jpg`, `inspo-3.jpg`, `inspo-2.jpg` |
| Cocina y comedor · toma 1 | `03-prompts/prompt-cocina-comedor-1.md` | `plano-numerado.jpg`, `toma-cocina-comedor-1.jpg`, `tour-cocina.jpg`, `tour-pasillo.jpg`, `inspo-2.jpg`, `inspo-1.jpg` |
| Cocina y comedor · toma 2 | `03-prompts/prompt-cocina-comedor-2.md` | `plano-numerado.jpg`, `toma-cocina-comedor-2.jpg`, `tour-cocina.jpg`, `tour-pasillo.jpg`, `inspo-2.jpg`, `inspo-1.jpg` |
| Recámara 2 (con clóset) · toma 1 | `03-prompts/prompt-recamara-2-1.md` | `plano-numerado.jpg`, `toma-recamara-2-1.jpg`, `tour-recamara2-closet.jpg`, `tour-cocina-hacia-recamara2.jpg`, `inspo-3.jpg`, `inspo-4.jpg` |
| Recámara 2 (con clóset) · toma 2 | `03-prompts/prompt-recamara-2-2.md` | `plano-numerado.jpg`, `toma-recamara-2-2.jpg`, `tour-recamara2-closet.jpg`, `tour-cocina-hacia-recamara2.jpg`, `inspo-3.jpg`, `inspo-4.jpg` |
| Entrada · toma 1 | `03-prompts/prompt-entrada-1.md` | `plano-numerado.jpg`, `toma-entrada-1.jpg`, `tour-entrada.jpg`, `tour-pasillo.jpg`, `inspo-1.jpg` |

Orden sugerido: primero **Vista aérea** (comprueba que respeta el plano), luego **Sala**, **Cocina y comedor**, **Recámara principal**, **Recámara 2** y **Entrada**.

## Si el resultado no respeta el plano

Responde en el mismo chat (una corrección a la vez):

- `The furniture positions do not match the numbered plan. Keep the same camera and style, but move piece #N so that it matches the plan and the prompt.`
- `Keep exactly the same composition and camera. Only change: <lo que quieres cambiar>.`
- `Piece #N is the wrong size. It must be <ancho> x <fondo> x <alto> cm, about <proporción> of the sofa width. Redo it at the correct scale.`
- `Remove everything that is not on the furniture list.`
- `Make the light warmer and dimmer, evening mood, lamps on, keep everything else identical.`
- `Same room, same furniture, but from the second camera reference (toma ...-2.jpg).`
- Para retocar una zona: usa la herramienta de **editar imagen** de ChatGPT, selecciona la zona y describe solo ese cambio.

## Consejos

- Una toma por mensaje; los prompts largos con varias imágenes funcionan mejor si pides una sola salida.
- Si ChatGPT inventa muebles, repite el prompt con: `Use ONLY the furniture in the list. Nothing else.`
- Para variar el estilo sin tocar la distribución cambia solo el bloque `STYLE` del prompt.
- Guarda las imágenes que te gusten de cada cuarto y súbelas como referencia en la siguiente toma para mantener consistencia.

## Datos clave del departamento

- Huella 61.7 m² (664 sq ft, a caras exteriores de muros); área libre interior ≈ 50 m².
- Sala 2.70 × 3.31 m · Recámara principal 2.62 × 3.31 m · Cocina/comedor 2.48 × 3.28 m · Recámara 2 3.09 × 2.46 m (+ clóset empotrado de 0.62 × 2.46 m en la pared oeste) · Entrada 3.32 × 1.79 m · Balcón 5.62 × 2.23 m.
- Puerta de entrada en el muro este; corredor entre cocina y recámara 2; baños sin amueblar (acabados: loseta gris oscuro grande, muebles blancos).

## Nombres de las recámaras

En el tour virtual (Peek) la recámara con el clóset de puertas corredizas aparece como "Bedroom 1": es la **Recámara 2** de este paquete (la de abajo en el plano, junto a la entrada). La recámara con baño propio es la **Recámara principal** (la de arriba, junto al ventanal).

## Aviso

Las medidas salen de escalar el plano oficial (calibradas con los 664 sq ft) y de las fichas de producto; verifícalas antes de comprar. Los precios son estimados.
