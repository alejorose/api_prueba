# IMIX Suite 10C · Layout 3D

Visor 3D interactivo para amueblar el departamento **IMIX by Quadreal · Suite 10C**
(2 recámaras · 2 baños · 664 sq ft). El plano está reconstruido a escala desde el
plano oficial (aproximado — verifica medidas reales antes de comprar).

## Uso

Sirve la carpeta con cualquier servidor estático y abre `index.html`:

```bash
python3 -m http.server 8000   # http://localhost:8000
```

- **Vistas:** 3D · Planta (2D) · Persona (recorrido a 1.6 m).
- **Muebles:** elige una categoría abajo y toca un mueble para agregarlo.
  Arrástralo para moverlo; panel para girar 15°/90°, duplicar, borrar y cambiar color.
- **Choques:** el mueble se pone rojo si choca con muros, instalaciones u otros muebles.
- **Menú (⋯):** muros altos/bajos/ocultos, metros/pies, imán de 5 cm, layout sugerido,
  captura PNG, exportar/importar JSON. Se guarda solo en el navegador.
- Teclado: `R` gira 90°, flechas mueven, `Supr` borra.

three.js r160 va incluido en `vendor/` (sin CDN).

## Foto-realista con ChatGPT (botón 📷)

Genera un paquete de referencia para un generador de imágenes: **plano numerado**,
**vista de la toma** (sala, cocina/comedor, recámaras) y **vista aérea**, más un **prompt**
con medidas de cada cuarto, y por mueble: dimensiones, posición respecto a los muros,
hacia dónde mira y espacio libre al frente. Guarda las imágenes, adjúntalas en ChatGPT
y pega el prompt.

Al seleccionar un mueble se muestran las distancias libres (atrás/frente/izq/der);
en ámbar si son menores a 60 cm.

`python3 tools/build_artifact.py salida.html` genera una versión de un solo archivo.

## Calibración

La escala sale de medir el plano contra el área publicada. Ver `docs/calibration.md` y `tools/calibrate.py`.

## Vista tipo maqueta

Fondo azul marino, base de maqueta, luz cálida por cuarto y muros automáticos que bajan
los que tapan la vista (Muros: auto). Etiquetas flotantes por cuarto (toca una para acercarte),
minimapa arriba a la derecha (toca un cuarto para ir a él) y botones 3D / Planta / Persona.

## Estilo Japandi + lista de compras

El layout por defecto usa productos reales de IKEA y Amazon (medidas de ficha, precios estimados en CAD):
botón 🛒 para la lista y el presupuesto, pestaña "Tienda" para agregar piezas. Ver `docs/shopping.md`
(investigación de APIs, supuestos de precio) y `shop.js` (catálogo y layout).

## Paquete para ChatGPT

`render-pack/` (y `render-pack.zip`): plano numerado, tomas de cámara de cada cuarto (2 ángulos), fotos del tour
e inspiración, un prompt por toma y la guía `00-LEEME-chatgpt.md`. Se regenera con
`NODE_PATH=$(npm root -g) node tools/make_pack.js` (necesita `python3 -m http.server 8123` y Playwright).

## Modo Tomas (🎥 / 📷)

Cámara libre para encuadrar tú mismo: botones para moverte (▲▼◀▶), girar y mirar arriba/abajo, sliders de altura y lente
(14–70 mm), presets por cuarto y vistas isométricas, marco 3:2 u 2:3 y botón 📸. Al capturar muestra la imagen, el plano
numerado y un prompt editable que describe tu cámara (cuarto, altura, dirección, lente) y lista los muebles dentro del encuadre.

Navegación con teclado y mouse (WASD, Q/E, Shift, mirar con clic + arrastrar, rueda, botón central): ver `docs/navigation.md`.
