"""Calibra la escala del plano (m por pixel) contra el área publicada (664 sq ft).
Prueba varias hipótesis de qué incluye ese número y las contrasta con objetos de tamaño
estándar medidos en el mismo plano (camas queen 60 in, puerta de entrada ~36 in).
Uso: python3 tools/calibrate.py reference/plano-10C.jpg"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi

SQFT = 0.09290304
AREA_M2 = 664 * SQFT
im = np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
dark = im.max(axis=2) < 95
dark[:523] = False; dark[1520:] = False          # barras negras del screenshot

def runs(v):
    r, s = [], None
    for i, x in enumerate(v):
        if x and s is None: s = i
        if not x and s is not None: r.append((s, i - 1)); s = None
    return r
big = lambda rr: [r for r in rr if r[1] - r[0] >= 4]

# --- geometría medida en píxeles de la imagen ---
xl0, xl1 = big(runs(dark[900]))[0]                 # muro izquierdo
xr0, xr1 = big(runs(dark[900]))[-1]                # muro derecho cuerpo principal
yb0, yb1 = big(runs(dark[:, 400]))[-1]             # muro inferior
xe1 = big(runs(dark[1380]))[-1][1]                 # muro derecho del vestíbulo
yt = 776                                           # cara exterior del ventanal
ys = big(runs(dark[:, 700]))[0][0]                 # tapa superior del vestíbulo (cara exterior)
t_ext, t_bot = xl1 - xl0 + 1, yb1 - yb0 + 1
poly = lambda a, b, c, d, e, f: (b - a) * (e - c) + (d - a) * (f - e)   # cuerpo + vestíbulo
A_gross = (xr1 - xl0) * (ys - yt) + (xe1 - xl0) * (yb1 - ys)
A_center = (xr1 - xl0 - t_ext / 2 - 8) * (ys - yt - 4 - t_bot / 2) + 0  # aprox. centro de muros
mask = np.zeros_like(dark); mask[yt:ys, xl0:xr1] = True; mask[ys:yb1, xl0:xe1] = True
A_net = int((mask & ~dark).sum())                  # huella menos muros (área libre)
bed_w = 99                                         # ancho de las dos camas en el plano (px)
door = 66                                          # arco puerta de entrada (px)

print(f'Muros: izq {t_ext}px, inferior {t_bot}px | huella bruta {A_gross} px², libre {A_net} px²')
print(f'{"hipótesis":34} {"m/px":>8} {"cama 60in":>10} {"puerta":>8} {"muro ext":>9}  veredicto')
rows = [('A. 664 = huella a caras exteriores', A_gross), ('B. 664 = área libre interior', A_net),
        ('C. 664 = huella a eje de muros', (A_gross + A_net) / 2)]
best = None
for name, A in rows:
    S = (AREA_M2 / A) ** .5
    bed, dr, wall = bed_w * S, door * S, t_ext * S
    err = abs(bed - 1.524) / 1.524 + abs(dr - .914) / .914
    ok = 'MEJOR' if best is None or err < best[0] else ''
    if ok: best = (err, name, S)
    print(f'{name:34} {S:8.5f} {bed:8.3f} m {dr:6.3f} m {wall:7.3f} m  err={err*100:4.1f}% {ok}')
S = best[2]
print(f'\n=> Mejor: {best[1]}  escala = {S:.5f} m/px en esta imagen ({1/S:.1f} px por metro)')
print(f'   Cama queen medida: {bed_w*S:.3f} m (real 1.524) | Huella: {A_gross*S*S:.2f} m² = {A_gross*S*S/SQFT:.0f} sq ft')
print(f'   Área libre interior: {A_net*S*S:.2f} m² = {A_net*S*S/SQFT:.0f} sq ft')
print(f'   Ancho total {(xr1-xl0)*S:.2f} m, largo {(yb1-yt)*S:.2f} m, vestíbulo hasta {(xe1-xl0)*S:.2f} m')
