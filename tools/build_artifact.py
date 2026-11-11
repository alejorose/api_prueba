"""Genera un HTML de un solo archivo (three.js desde jsDelivr, shop.js y fotos de inspiración incrustados)
para publicarlo como artefacto.  Uso: python3 tools/build_artifact.py salida.html"""
import re, sys, base64

h = open('index.html').read()
css = open('style.css').read()
js = open('app.js').read()
shop = open('shop.js').read()

# shop.js en línea (sin export) en lugar del import
shop = re.sub(r'^export ', '', shop, flags=re.M)
js = js.replace("import { PRODUCTS, EXTRAS, JAPANDI } from './shop.js';", shop)

# fotos de inspiración como data URI
uris = ['data:image/jpeg;base64,' + base64.b64encode(open(f'reference/inspo-{i}.jpg', 'rb').read()).decode() for i in range(1, 5)]
js = js.replace("const INSPO = [1, 2, 3, 4].map(i => `./reference/inspo-${i}.jpg`);", 'const INSPO = ' + repr(uris).replace("'", '"') + ';')

body = re.search(r'<body>(.*)</body>', h, re.S).group(1)
body = body.replace('<script type="module" src="app.js"></script>', '')
# el visor no permite descargas: quita captura/exportar/importar
body = re.sub(r'\s*<hr>\s*<button id="shotBtn">.*?<input type="file"[^>]*>', '', body, flags=re.S)
js = re.sub(r"\$\('#shotBtn'\)\.onclick.*?\n};\n\$\('#exportBtn'\).*?\n};\n\$\('#importBtn'\).*?\n\};\n", '', js, flags=re.S)

V = "https://cdn.jsdelivr.net/npm/three@0.160.0"
open(sys.argv[1], 'w').write(f'''<title>IMIX 10C Layout 3D</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{css}</style>
<script type="importmap">{{"imports":{{"three":"{V}/build/three.module.js","three/addons/":"{V}/examples/jsm/"}}}}</script>
{body}
<script type="module">
{js}
</script>
''')
