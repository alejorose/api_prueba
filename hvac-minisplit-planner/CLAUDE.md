# Contexto para Claude

Proyecto: visor 3D (three.js r160, sin build; módulos ES + `vendor/`) para el departamento IMIX Suite 10C. Se está convirtiendo de **muebles** a **mini splits (HVAC)**.

- Lee primero `EMPEZAR-AQUI.md` (fases y criterios) y `docs/RECREAR-PROYECTO-HVAC.md` (especificación detallada).
- Responde al usuario en **español**, breve. Prompts de render en inglés.
- Prioridad: uso táctil en celular. No rompas gestos, candado, modo Tomas ni la cámara.
- Prueba con Playwright (viewport móvil 420×800 `hasTouch`) y revisa las imágenes antes de decir que algo está listo. `window.__app` expone el estado para pruebas.
- No inventes precios, medidas ni normas: cita la ficha o marca como estimado (`dims:'E'`, `basis:'EST'`).
- Publicar: `python3 tools/build_artifact.py salida.html` y publicar el HTML como artefacto.
- Commits en la rama que indique el usuario; no abras PR sin que lo pida.
