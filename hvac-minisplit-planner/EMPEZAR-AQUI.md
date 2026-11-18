# Empezar aquí: convertir este visor de muebles en planificador de mini splits (HVAC)

Esta carpeta es un **clon limpio** del proyecto "IMIX 10C · Layout 3D". Funciona tal cual para muebles. Tu trabajo (Claude) es convertirlo a **HVAC**
sin romper el motor (3D, gestos táctiles, cámara, modo Tomas, prompts, publicación).

## Cómo usar este archivo

1. Abre una sesión de Claude Code en esta carpeta (o en el repo nuevo donde la pusiste).
2. Pega **el prompt de la sección 1** y deja que trabaje por fases.
3. Si algo no está claro, la especificación está en `docs/RECREAR-PROYECTO-HVAC.md`; este archivo es el guion de ejecución.

## 1. Prompt para pegar en Claude

```text
Lee CLAUDE.md, EMPEZAR-AQUI.md y docs/RECREAR-PROYECTO-HVAC.md. Convierte este proyecto de visor de muebles en un planificador de mini splits (HVAC)
para el departamento IMIX Suite 10C (Toronto, 664 sq ft), siguiendo las fases de EMPEZAR-AQUI.md en orden. Reutiliza el motor existente.
Después de cada fase: prueba con Playwright en viewport móvil, revisa las capturas, haz commit y dime en español qué quedó y qué falta.
Hazlo todo sin pedirme confirmación salvo que falte un dato que solo yo tengo (marcas preferidas, presupuesto, reglas del condominio).
Empieza por la Fase 0.
```

## 2. Datos que el usuario puede dar (si no, usa supuestos visibles)

- Marcas/modelos preferidos y presupuesto. · ¿El edificio permite condensador en el balcón o ya tiene fan coil? (si no se sabe: supuesto + nota "verifica con la administración").
- Alturas de techo (por defecto 2.4 m). · Dónde está el tablero eléctrico y los desagües.
- Cuántas zonas quiere (1 por recámara + sala, o multizona).

## 3. Fases

**Fase 0 · Preparación (15 min)**
- Servir (`python3 -m http.server 8123`), abrir con Playwright, confirmar que no hay errores de consola (`pageerror`) y que el layout de muebles carga.
- Instalar/usar Playwright si falta (el entorno suele traerlo). `node --check app.js`.
- Crear rama de trabajo, o seguir la que indique el usuario.

**Fase 1 · Marca del proyecto**
- Cambiar títulos y textos de "IMIX 10C · Layout 3D / muebles / IKEA / Japandi" a "Planificador de mini splits". Nueva clave de `localStorage` (`hvac-layout-v1`).
- Ocultar el catálogo de muebles (no borrarlo todavía; se convertirá en referencia de obstáculos).

**Fase 2 · Catálogo HVAC** (`app.js` CATALOG/BUILD, `shop.js`)
- Constructores 3D: `wallhead` (unidad interior), `condenser`, `lineset`, `drain`, `sleeve`, `disconnect`.
- `PRODUCTS` con campos nuevos (`btu`, `seer`, `clear`, `maxLine`, `elec`, `dims`, `basis`). Investigar 6–10 modelos reales en Canadá con WebSearch; marcar lo no verificado como estimado.
- Pestañas: Interior · Exterior · Tuberías · Eléctrico · Control.

**Fase 3 · Reglas de colocación**
- Ítems que cuelgan de un muro: snap al muro más cercano, `elev` editable, orientación hacia el interior del cuarto.
- Estados verde/ámbar/rojo con **motivo en texto** (despeje al techo, a esquinas, a ventanas, cono de aire sobre cama/escritorio, condensador sin espacio).
- Cono de aire translúcido por unidad interior.

**Fase 4 · Tuberías**
- Dibujar líneas tocando puntos en Planta; longitud en vivo (m y ft); aviso al pasar `maxLine`; render con `TubeGeometry`.

**Fase 5 · Dimensionamiento**
- Tarjeta de cuarto con BTU requeridos vs instalados (estimación rápida, no Manual J); suma por condensador multizona y por circuito.

**Fase 6 · Lista de materiales (BOM)**
- Sustituir la lista de compras: unidades, condensador, tubería por metro, soportes, bomba de condensado, desconectivo, cable, cubre-línea, mano de obra (renglón editable). Total y rango con avisos.

**Fase 7 · Prompts y paquete de render**
- Adaptar `buildPrompt`, `describe`, `planShot` (símbolos HVAC) y `tools/make_pack.js` (tomas por cuarto, exterior del condensador, detalle de penetración, foto del producto). Regenerar `render-pack/`.

**Fase 8 · Pulido y publicación**
- Revisar celular (gestos, candado, modo Tomas). `python3 tools/build_artifact.py` → publicar artefacto → commit/push → resumen en español al usuario.

## 4. Criterios de aceptación

Ver sección 10 de `docs/RECREAR-PROYECTO-HVAC.md`. Mínimo para "listo": agregar una unidad interior desde el celular, ver su cono y despejes, colocar el condensador, trazar la línea con longitud, ver BTU por cuarto, BOM con avisos, prompts con unidades numeradas, artefacto publicado sin errores.

## 5. Para el usuario: subir esta carpeta a un repo nuevo

```bash
cd hvac-minisplit-planner
git init -b main && git add -A && git commit -m "Base clonada desde el visor de muebles"
# crea un repo vacío en GitHub y luego:
git remote add origin <URL-del-repo-nuevo> && git push -u origin main
```
Después abre Claude Code en ese repo y pega el prompt de la sección 1.
