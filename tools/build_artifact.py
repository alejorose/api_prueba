"""Genera un HTML de un solo archivo (three.js desde jsDelivr) para publicarlo como artefacto.
Uso: python3 tools/build_artifact.py salida.html"""
import re, sys
h = open('index.html').read(); css = open('style.css').read(); js = open('app.js').read()
css = css.replace("--accent2:#7db249;", "--accent2:#7db249;color-scheme:dark;", 1)
js = js.replace("if (confirm('¿Quitar todos los muebles?')) loadItems([]);", "loadItems([]);")
body = re.search(r'<body>(.*)</body>', h, re.S).group(1)
body = body.replace('<script type="module" src="app.js"></script>', '')
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
