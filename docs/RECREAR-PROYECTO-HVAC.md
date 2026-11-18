# Guía para recrear este proyecto con mini splits (HVAC) en vez de muebles

Documento para **otra sesión de Claude**. Describe con detalle qué es el proyecto actual (visor 3D para amueblar el
departamento IMIX Suite 10C), cómo está construido, qué se reutiliza tal cual y qué hay que reemplazar para que la
misma aplicación sirva para **ubicar y dimensionar sistemas de aire acondicionado mini split** y generar prompts/imágenes
fotorrealistas del resultado.

> Idioma del producto: **español** (la interfaz y las notas) con prompts de render en **inglés** (para ChatGPT).
> Usuario final: una persona que planea desde el **celular**, con los dedos. Lo táctil no es opcional.

---

## 0. Dos caminos (elige uno)

**Camino A, el más rápido (recomendado): duplicar el repositorio y refactorizar.**
```bash
git clone <repo-actual> hvac-minisplit-planner && cd hvac-minisplit-planner
rm -rf .git && git init          # historia nueva
```
Luego seguir las secciones 4 a 9: cambiar el dominio (muebles → equipos HVAC) sin tocar el motor 3D, los gestos, la cámara, la captura, la generación
de prompts ni la publicación. El repo ya trae `vendor/three` (r160), por lo que no hay CDN que instalar.

**Camino B: reconstruir desde cero con este documento.** Seguir las secciones 1 a 9 en orden. Todo el comportamiento
descrito en 2 y 3 ya fue probado y es el estándar de calidad esperado.

En ambos casos el repo nuevo **no debe mencionar muebles ni IKEA**, salvo como historial.

---

## 1. Qué hace el proyecto actual

Visor 3D (three.js) del departamento a escala, con:

1. **Plano reconstruido** desde una imagen (muros, cuartos, ventanales, puertas, cocina) en píxeles de la imagen, convertido a metros.
2. **Catálogo** inferior por categorías; tocar un ítem lo agrega; se arrastra, gira (15° / 90°), duplica, borra, cambia color. Imán de 5 cm.
3. **Colisiones** (SAT sobre rectángulos orientados): el ítem se pone rojo si choca con muros/instalaciones/otros ítems.
4. **Vistas:** 3D, Planta 2D, Persona (a 1.6 m).
5. **Selector de cuarto** (barra inferior): enfoca un cuarto, muestra tarjeta con dimensiones y botones Vaciar/Restaurar.
6. **Modo 🎥 Tomas:** cámara libre estilo juego (WASD + mouse; en celular joystick, pellizco, giro con dos dedos, doble toque para caminar)
   con marco 3:2 / 2:3, captura de imagen y **prompt automático** con lo que cae en el encuadre.
7. **Lista de compras** con precios (estimados), medidas marcadas ✓ si se vieron en la ficha del producto, total y rango.
8. **Paquete de render** (`render-pack/` + zip): plano numerado, tomas fijas por cuarto, fotos de referencia del lugar real, un prompt por toma,
   lista numerada de muebles con medidas/precios, instrucciones cortas para un Proyecto de ChatGPT.
9. **Publicación** como artefacto de un solo archivo HTML.
10. **Candado 🔒** para recorrer la vista sin mover nada.

## 2. Arquitectura y archivos

| Archivo | Líneas aprox. | Rol |
|---|---|---|
| `index.html` | 230 | Estructura: canvas, barra superior, HUD, panel de cámara, modales (toma, tienda, foto), bandeja del catálogo, panel de selección |
| `style.css` | 270 | Estilos móviles (safe-area, paneles semi-transparentes, `touch-action`) |
| `app.js` | 1,740 | Todo el motor (ver secciones abajo). Módulo ES |
| `shop.js` | 120 | `PRODUCTS` (productos reales con medidas/precio), `EXTRAS` (renglones sin modelo), `JAPANDI` (layout por defecto) |
| `vendor/` | | three.module.js r160 + addons (OrbitControls, etc.). Import map en `index.html` |
| `reference/` | | Plano original, fotos del lugar real, fotos de inspiración |
| `tools/make_pack.js` | 120 | Playwright: genera `render-pack/` (tomas fijas, prompts, listas, README) |
| `tools/build_artifact.py` | 33 | Une html+css+js+shop.js+imágenes en un solo `.html` (three desde jsDelivr) |
| `tools/calibrate.py` | 55 | Calibra la escala del plano con el área oficial |
| `tools/render-pack-master.md`, `render-pack-instrucciones.txt` | | Plantillas de la guía y de las instrucciones del Proyecto de ChatGPT |
| `docs/` | | `calibration.md`, `navigation.md` (investigación de controles tipo Blender/Unity), `shopping.md` |

Secciones de `app.js` (buscar los banners `/* ===`):

1. **Plano**: `S` (m/px), `X0,Y0` (origen), `wx()/wz()`, `WALLS` (rectángulos `[x0,y0,x1,y1]` en px), `ROOMDEF`
   (id, nombre, `r` rectángulo, `lab`, cámara por cuarto `eye/tg/fov/cam/alt`), `FIXTURES` (cocina, baños, etc. con alto/color), `COLLIDERS`.
2. **Catálogo** `CATALOG[id] = {n, cat, w, d, h, c, em, b, rug?, air?, elev?, shop?}`. `b` es el nombre del constructor 3D.
   `PRODUCTS` de `shop.js` se vuelcan al catálogo con prefijo `p_`.
3. **Escena**: renderer, luces, ACES tone mapping, sombras, piso/paredes, `mull` (montantes de ventanal, solo con muro alto), `doorsTall`.
4. **Constructores** `BUILD.<b>(g, it, {w,d,h}, color)`: arman un mueble con cajas/cilindros (`part`, `cyl`). Origen en el piso, respaldo hacia -Z.
5. **Estado**: `items[]`, `save()/load()` en `localStorage` (clave versionada), historial para deshacer (`hist`, `snapshot`), colisiones
   (`corners`, `overlap`, `checkCollisions`, `floats()` para ítems que no colisionan como alfombras o cosas colgadas).
6. **Selección + arrastre**: raycasting, `groundPoint`, imán, anillo de selección, distancias libres (atrás/frente/izq/der).
7. **Catálogo UI** (bandeja con pestañas y tarjetas) + **selector de cuarto** (`setRoomSel`, `focusRoomPlan`, `applyRoomFocus`, `updateRoomCard`).
8. **Cámara**: vistas 3D/Planta/Persona, OrbitControls, zoom y pan propios, etiquetas de cuarto (`chips`), minimapa.
9. **Menú** (muros bajos/altos/ocultos, unidades m/ft, cotas, imán, exportar/importar, resetear).
10. **Foto-realista**: `buildPrompt(shot, style, opts)`, `describe(it, n)`, `planShot`, `aerialShot`, `shotPx`, `isoShotPx`, estilos `STYLES`.
11. **Lista de compras** (`shopRows`, `totals`, `shopText`).
12. **Modo Tomas**: HUD, joystick, gestos, teclado/mouse, captura, `renderShotModal`, `copyShot` (prompt + imagen al portapapeles).
13. **Loop** (`requestAnimationFrame`). `window.__app = {...}` expone funciones para las pruebas con Playwright.

## 3. Comportamientos que ya funcionan y deben conservarse (no re-inventar)

**Táctil (prioridad):**
- Un dedo en el fondo: orbitar; sobre un ítem: moverlo. Pellizco = zoom aunque el primer dedo caiga sobre un ítem (zoom/pan propios, se cancela el arrastre accidental y se deshace).
- **Giro con dos dedos** rota la vista, junto con pellizco (zoom) y arrastre de dos dedos (deslizar).
- Etiquetas flotantes (`chips`) con `pointer-events:none` y detección de toque con `chipAt()`; así no roban el segundo dedo.
- **Candado 🔓/🔒** (tecla L): con candado puesto los ítems no se tocan y todo gesto mueve la vista.
- Controles semi-transparentes; HUD de Tomas con joystick analógico (más lejos = más rápido, al borde corre ×2), arrastre = mirar con inercia,
  pellizco = lente 14–85 mm, dos dedos = deslizar/subir/bajar, doble toque = caminar hasta ahí, obturador grande, modo zurdo, vibración.
- En Tomas `controls.enabled=false` y se usa `camera.setViewOffset` para centrar el marco de captura por encima de los paneles.

**Escritorio:** WASD, Q/E altura, Shift rápido, Alt lento, `[ ]` velocidad, mouse arrastrar = mirar, central = deslizar, rueda = avanzar, Enter captura, H oculta ayuda.

**Calidad visual:** ACES, sombras suaves, luces puntuales de lámparas, muros automáticos tipo "cutaway" (los cercanos a la cámara bajan), alto de puertas
(`doorsTall`) en vistas isométricas.

**Prompts:** inglés, estructura fija: archivos adjuntos con propósito → rotación del plano (arriba = norte) → reglas estrictas ("no mover muros,
colocar exactamente lo listado, sin gente ni texto") → dimensiones de cuartos → acabados fijos del lugar real → lista numerada de ítems medidos →
estilo → cámara (nivel de ojos 1.5 m, 24 mm, verticales rectas) e iluminación.

**Errores ya resueltos (no repetirlos):**
- Los `.chip` flotantes interceptaban toques → `pointer-events:none`.
- Distancia 3D por defecto muy lejana → fórmula de ajuste `3.9/(tf*aspect)*1.32` y `maxDistance` 45.
- Mirar con mouse duplicaba rotación → `controls.mouseButtons` en null y `controls.enabled=false` en Tomas.
- Botones del HUD tapaban el joystick → fila 📍/3:2/👁 debajo de la barra superior.
- Objetos inclinados contra la pared se hundían: desplazar la base hacia adelante (`position = -d/2 + h*sin(ángulo)`).
- Muros con huecos: cada tramo de muro debe llegar al muro vecino (revisar esquinas visualmente en Planta y 3D).
- Instrucciones de un Proyecto de ChatGPT: **máximo 8,000 caracteres** → mantenerlas en un archivo corto aparte (~2,300).
- Cada mensaje de ChatGPT admite hasta 10 archivos; los prompts usan 5 a 8.
- El visor de artefactos no permite descargas: se quitan captura PNG/exportar/importar en el build.
- Bash puede bloquear heredocs con falsos positivos de seguridad: usar las herramientas Write/Edit.
- curl a tiendas puede estar bloqueado por el proxy: investigar precios con búsqueda web, no con scraping.

## 4. Dominio nuevo: HVAC mini split

Para el usuario "amueblar" pasa a ser **"climatizar"**: decidir **dónde colgar las unidades interiores, dónde poner la(s) unidad(es) exterior(es),
por dónde pasa la tubería y si todo cumple distancias y capacidad**.

### 4.1 Tipos de ítem (reemplazan `CATALOG`/`PRODUCTS`)

| Categoría de catálogo | Ítem | Modelo 3D (`b`) | Medidas orientativas* | Notas de colocación |
|---|---|---|---|---|
| Interior | Unidad interior de pared ("head") 9k / 12k / 18k / 24k BTU | `wallhead` (caja con esquinas redondeadas, rejilla, aleta, LED) | 0.80–1.10 W × 0.20–0.26 D × 0.29–0.34 H m | Cuelga de un muro (`elev` típico 1.8–2.1 m al borde inferior). Respaldo contra el muro. |
| Interior | Cassette de techo / unidad de piso / ducto corto (opcional) | `cassette`, `floorunit` | cassette ≈ 0.6×0.6; piso ≈ 0.7×0.22×0.6 | Solo si el usuario los pide |
| Exterior | Condensador 9k–12k / 18k / 24k (monozona) y multizona 2–3 puertos | `condenser` (caja con rejilla y ventilador) | 0.78–0.95 W × 0.30–0.40 D × 0.55–0.70 H m | Piso o soporte de pared; separaciones de la 4.3 |
| Líneas | Set de línea (cobre + aislante + cable) con longitud | `lineset` (polilínea con tubo) | Ø exterior ≈ 0.05–0.08 m | **Nuevo tipo de objeto** (ver 4.4) |
| Líneas | Drenaje de condensado / bomba de condensado | `drain`, `condpump` | | Pendiente ≥ ~1% por gravedad, o bomba |
| Líneas | Penetración de muro (taladro ~Ø 65–80 mm) | `sleeve` | | Un punto sobre un muro exterior |
| Eléctrico | Desconectivo exterior, tomacorriente/circuito dedicado, cable de comunicación | `disconnect`, `outlet` | | Cerca del condensador |
| Control | Control remoto de pared, módulo WiFi | `remote` | | Opcional |

\* Valores orientativos de partida; **cada producto real debe llevar sus medidas de la ficha técnica** y la marca `dims: 'V'` (visto) o `'E'` (estimado).

### 4.2 Datos por producto (reemplazan `PRODUCTS` en `shop.js`)

```js
{ id, name, en, brand, model, kind: 'indoor'|'outdoor'|'lineset'|'accessory',
  btu, seer: n, hspf: n, coldClimate: bool,   // capacidad y eficiencia
  w, d, h, elev, b, color, em,                 // geometría y modelo 3D
  clear: { top, sides, back, front },          // distancias mínimas del fabricante (m)
  maxLine: m, maxLift: m,                      // límites de tubería
  elec: { volts, amps, breaker },
  price, lo, hi, basis: 'CA'|'INT'|'EST', dims: 'V'|'E', store, url, note }
```
Mantener `basis` (precio visto en Canadá / convertido / estimado) y `dims`, y mostrar los avisos honestos de "precio estimado".

### 4.3 Reglas físicas y de colocación (reemplazan el motor de choques)

Las colisiones simples no bastan: hacen falta **zonas de despeje**. Cada ítem HVAC define un **volumen de despeje** (rectángulo extra, o caja 3D) además de
su huella, y el chequeo pasa de "rojo/no rojo" a **verde / ámbar / rojo**:

- **Unidad interior:** despeje arriba ≥ ~15 cm del techo, a los lados ≥ ~15 cm de muros/esquinas, **cono de descarga de aire** libre al frente
  (≈ 2–3 m de alcance, ángulo ~±40°; no apuntar directo a cama/escritorio/sofá), no colocar sobre puertas/ventanas ni detrás de cortinas, no sobre
  televisores ni sobre cabecera si el flujo cae sobre las personas. Altura de montaje por defecto ≈ 1.9–2.0 m al borde inferior (verificar en manual).
- **Unidad exterior:** despeje atrás ≥ ~30 cm, lados ≥ ~30–60 cm, frente/descarga ≥ ~1–1.5 m, arriba libre; elevada del piso (soporte ≥ ~15 cm); nunca
  bloquear salida de emergencia ni quedar a la vista de la fachada si el reglamento lo prohíbe.
- **Línea de tubería:** longitud máxima y desnivel del fabricante; el visor calcula la longitud recorrida y avisa. Evitar cruces con puertas/ventanales.
- **Condensado:** por gravedad solo si hay pendiente hacia un desagüe; si no, bomba.

> **Todos estos números son orientativos.** Cada producto trae sus valores en `clear`. El documento y la interfaz deben decir que se confirme con el manual
> del fabricante y con un instalador certificado.

**Advertencia de edificio (muy importante para condominios):** muchos condominios **prohíben o regulan** condensadores en balcones/fachada y la penetración de
muros exteriores o de vidrio. El departamento ya puede traer fan coil/climatización central. El visor debe incluir una **nota fija**: "Verifica con la administración
del edificio antes de comprar". No afirmar como hecho qué permite este edificio en particular.

### 4.4 Cambios de modelo de datos

- `items[]` conserva `{id, type, x, z, rot, color, elev?}`. Agregar `circuit?` (id de circuito), `zone?` (id de zona/cuarto) y para **líneas** `path: [[x,z,y]...]`.
- `lineset` no se arrastra como caja: se **dibuja** tocando puntos (Planta), con puntos editables y longitud en vivo (m y ft), y se une a una unidad interior y a una exterior.
  Reutilizar el sistema de selección; los puntos son manijas. Renderizar con `THREE.TubeGeometry` sobre la polilínea.
- Persistencia: nueva clave de `localStorage` (ej. `hvac-layout-v1`), versionada.

### 4.5 Dimensionamiento (panel nuevo por cuarto, reemplaza la tarjeta de dimensiones)

Mostrar por cuarto (en `updateRoomCard`): área, volumen, orientación y vidrio (de `ROOMDEF`), **carga estimada en BTU/h** y **BTU instalados**, con indicador
(subdimensionado / ok / sobredimensionado). Fórmula de partida editable: carga ≈ área (ft²) × 20 BTU/h/ft², con ajustes por: ventanal grande (+), piso alto/sol (+),
cocina (+4,000), ocupantes (+600 c/u sobre 2). Etiquetar claramente como **estimación rápida, no cálculo Manual J**. Para este departamento (664 ft²) el orden de magnitud
es de unos **12,000–18,000 BTU/h** totales; lo debe confirmar el usuario con un cálculo de carga real.

Sumar también: zonas que comparten un condensador multizona (suma de BTU interiores vs capacidad del exterior), amperaje por circuito, longitud de línea por zona.

## 5. Plano del lugar (reutilizar)

Si el usuario sigue en **IMIX Suite 10C** (664 sq ft, 2 recámaras, 2 baños, Toronto), **se conserva todo el plano**: `S = 0.0156 m/px`, `X0 = 262`, `Y0 = 615`,
`WALLS`, `ROOMDEF`, `FIXTURES`, `COLLIDERS`, `reference/plano-10C.jpg`, `docs/calibration.md`. Datos: huella 61.7 m² = 664 ft² medida a caras exteriores de muros;
área libre ≈ 50 m²; sala 2.70×3.31 m; recámara principal 2.62×3.31 m (+ clóset ~0.6×0.9 m); cocina/comedor 2.48×3.28 m; recámara 2 3.09×2.46 m (+ clóset empotrado 0.62×2.46 m);
entrada 3.32×1.79 m; balcón 5.62×2.23 m (fuera de los 664 ft²). Orientación: arriba = norte = ventanales/balcón.

Si es **otro lugar**, repetir el procedimiento: subir el plano, medirlo en píxeles, **calibrar la escala** (`tools/calibrate.py`: probar hipótesis de a qué se refiere el área
publicada y contrastar con objetos de tamaño estándar), reconstruir muros como rectángulos `[x0,y0,x1,y1]`, definir cuartos y cámaras, y verificar en Planta y 3D que no queden huecos.

**Nuevo en el plano para HVAC:** marcar en `ROOMDEF`/`FIXTURES` los **muros exteriores** (candidatos a penetración), los **muros de carga o de concreto** (no taladrables sin permiso),
el **balcón/patio** (posible ubicación exterior sujeta a reglamento), los **desagües** (baños, cocina), los **tableros** y las **alturas de techo** (≈ 2.4 m por defecto).
Si el usuario no tiene estos datos, ponerlos como supuestos visibles y editables.

## 6. Interfaz a cambiar

- **Textos:** título "Planificador de mini splits"; pestañas del catálogo: Interior · Exterior · Tuberías · Eléctrico · Control.
- **Tarjeta de cuarto:** además de dimensiones, BTU requeridos vs instalados, número de unidades, longitud de línea.
- **Capas (nuevo):** botones para mostrar/ocultar *Despejes*, *Cono de aire*, *Tuberías*, *Eléctrico*, *Etiquetas de BTU*. Útiles en 3D y Planta.
- **Cono de aire:** malla semitransparente (translúcida, `depthWrite:false`) que sale de cada unidad interior; cambia a ámbar si el cono toca una cama/escritorio/sofá (importar esos
  muebles como "obstáculos de referencia" simples, sin catálogo completo, si el usuario aún quiere ver el mobiliario).
- **Lista de compras → "Lista de materiales (BOM)":** unidades, condensador, tubería (metros × precio por metro), soportes, bomba de condensado, desconectivo, cable, cubre-línea, mano de obra
  estimada (renglón aparte, editable), total y rango, con advertencias.
- **Modo Tomas y candado:** se mantienen sin cambios.
- **Deshacer, imán, exportar/importar JSON:** se mantienen; el JSON incluye `lineset.path`.

## 7. Generación de imágenes fotorrealistas (pipeline a conservar)

Mismo flujo con ChatGPT. Qué cambia en `buildPrompt`:

- Encabezado: "photorealistic interior photograph of a condo room with a ductless mini-split system installed".
- Los renglones numerados ahora son: *"3. Wall-mounted indoor unit, 0.92 × 0.23 × 0.30 m, white with a thin silver trim, mounted 1.95 m above the floor on the north wall, 0.40 m from the east wall, air outlet pointing south"* y, si aplica,
  *"Copper line set and white PVC line cover running down the wall to a 0.08 m wall penetration at 0.35 m above the floor"*.
- Reglas estrictas: no agregar ni mover unidades, no ductos, no ventanas distintas, no cables visibles fuera de las canaletas listadas, no texto/marcas legibles.
- Referencias adjuntas: plano numerado con **íconos HVAC**, referencia 3D sin texturas de cada toma, **foto del producto real** (para que la unidad se parezca), fotos del lugar real (acabados), inspiración de estilo.
- Tomas recomendadas: una por cuarto con unidad interior (vista que muestre muro + cono de aire hacia la cama/sofá), una **exterior** del condensador en su ubicación, una aérea
  con ícono de línea y una **de detalle** de la penetración/cubre-línea.
- Hacer que el plano numerado (`planShot`) dibuje símbolos para unidades, condensador, líneas y despejes, y leyenda con BTU.
- Mantener: ≤ 10 archivos por mensaje; instrucciones del Proyecto ≤ 8,000 caracteres (usar ~2,300); una toma por mensaje; correcciones tipo "mantén la misma composición, solo cambia X".
- El paquete (`tools/make_pack.js`) se actualiza: tomas por cuarto con unidad, `04-equipos-y-medidas.md` (ítems numerados con modelo, BTU, medidas, despejes, precio), `layout.json`, guía `00-LEEME`.

## 8. Investigación y datos de producto

Hacer **investigación web real** (con WebSearch; no inventar):
- 6–10 modelos monozona y multizona comerciales en Canadá (p. ej. series de Mitsubishi Electric, Fujitsu, Daikin, Gree, Midea/Senville, Pioneer, MRCOOL; verificar disponibilidad
  y que existan versiones **cold-climate**, relevantes en Toronto), con ficha: BTU, SEER/HSPF, dimensiones **interior y exterior**, peso, distancias mínimas, longitud máxima de línea, voltaje/amperaje, ruido.
- Precios en CAD con su fuente y fecha (`basis`); marcar ofertas de ejemplo como estimadas.
- Incentivos o requisitos locales (p. ej. programas de eficiencia de Ontario/Canadá): citar fuente y decir "verifica vigencia"; no prometer montos.
- Normas aplicables para mencionar como recordatorio (permisos eléctricos, instalación de refrigerante por técnico certificado, código de edificación y reglas del condominio) sin dar asesoría legal.
- API: igual que antes, no hay APIs públicas oficiales de las tiendas; los precios se mantienen como estimados con enlace a la tienda.

## 9. Plan de trabajo paso a paso (para la otra sesión)

1. **Preparación:** duplicar el repo (Camino A) o crear estructura (B). Servir con `python3 -m http.server 8123`. Verificar que carga sin errores (`node --check app.js`).
2. **Plan de calibración** (si cambia el lugar) y reconstrucción del plano; verificar huella vs área publicada.
3. **Modelo de datos HVAC:** sustituir `CATALOG`/`PRODUCTS`, añadir `clear`, `btu`, etc. Escribir constructores `wallhead`, `condenser`, `lineset`, `drain`, `sleeve`, `disconnect`.
4. **Motor de despejes:** extender `checkCollisions` a tres estados + volúmenes de despeje y cono de aire; pruebas unitarias (Playwright evaluando `__app`).
5. **Líneas dibujables** en Planta con longitud en vivo.
6. **Panel de BTU por cuarto** y total; conectores multizona.
7. **UI:** pestañas, capas, tarjeta de cuarto, BOM.
8. **Prompts y paquete de render** (sección 7); regenerar `render-pack/` y su zip.
9. **Pruebas:** capturas con Playwright de cada vista (3D, Planta, Persona, un cuarto, Tomas), en **viewport móvil** (≈ 420×800, `hasTouch:true`) y de escritorio; comprobar que no hay choques en el layout por defecto y que los gestos funcionan.
10. **Publicar:** `python3 tools/build_artifact.py salida.html` → publicar el HTML como artefacto (misma ruta de archivo para conservar la URL). Commit y push a la rama indicada por el usuario.
11. **Entregar** al usuario en español: qué se hizo, supuestos (carga, despejes, reglas del edificio), y cómo usar.

## 10. Criterios de aceptación

- [ ] Se puede agregar una unidad interior a un muro desde el celular, con dedos, y ajustar su altura y posición; aparece su cono de aire y su despeje.
- [ ] Una unidad que viola despejes (techo, esquina, ventana) se ve **ámbar o roja** con el motivo en texto.
- [ ] El condensador puede ubicarse en el exterior permitido y marca su despeje trasero/frontal.
- [ ] Se dibuja una línea entre interior y exterior; se ve su longitud y avisa si excede el máximo del modelo.
- [ ] Cada cuarto muestra BTU requeridos vs instalados.
- [ ] El BOM suma precios con rango y avisos honestos (estimado vs visto).
- [ ] Candado de vista, zoom con pellizco, giro con dos dedos y modo Tomas funcionan como en el proyecto original.
- [ ] El botón 📷 y el modo Tomas generan prompts con las unidades numeradas, y el paquete incluye plano numerado, tomas y fotos de producto.
- [ ] No quedan textos de muebles/IKEA en la interfaz.
- [ ] Artefacto publicado y abre en el celular sin errores de consola.

## 11. Reglas de estilo para la sesión que lo recrea

- Responder al usuario **en español**, breve, sin jerga; decir qué se probó y qué no.
- No declarar "terminado" sin haberlo probado (capturas y comprobaciones con Playwright; revisar visualmente las imágenes).
- No inventar precios, medidas ni normas: citar la ficha o marcar como estimado.
- Primero lo que se ve y se toca (celular); luego lo técnico.
- Mantener `README.md` y `docs/` al día (calibración, navegación, BOM, este documento).
