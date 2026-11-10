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
