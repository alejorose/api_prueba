# Calibración de medidas (Suite 10C, 664 sq ft)

El plano oficial no trae cotas, solo el área (664 sq ft = 61.69 m²). `tools/calibrate.py`
mide en píxeles la huella del departamento sobre `reference/plano-10C.jpg` y prueba
tres hipótesis de qué incluye ese número, contrastándolas con objetos de tamaño estándar:

| Hipótesis | m/px | Cama (real 1.524 m) | Veredicto |
|---|---|---|---|
| **A. 664 = huella a caras exteriores de muros** | **0.01526** | **1.511 m** | **Cuadra** |
| B. 664 = área libre interior | 0.01695 | 1.678 m | Descartada (camas de 66 in) |
| C. 664 = huella a eje de muros | 0.01604 | 1.588 m | Descartada |

Resultado (escala del modelo: 1.56 cm/px sobre el plano de trabajo):

- Huella a caras exteriores: **61.7 m² = 664 ft²** (≈ 6.0 m de ancho × 9.7 m de largo, vestíbulo hasta 7.6 m).
- Área libre interior (sin muros): **≈ 50 m² = 538 ft²**. Es la que importa para amueblar.
- Camas queen del plano: 1.52 m (60 in). Muro exterior ≈ 0.24 m, muro inferior ≈ 0.35 m.
- Balcón/patio: fuera de los 664 ft² (~5.6 × 2.3 m).

Supuestos: el área se midió a caras exteriores (práctica común en Toronto), la
línea del ventanal es la cara norte y el vestíbulo llega hasta el eje del muro del pasillo.
Verifica con una medida real (por ejemplo el ancho de la sala) antes de comprar muebles grandes.
