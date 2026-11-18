# Navegación de la cámara: qué copiamos de otros programas

Investigación (documentación oficial de cada programa) y cómo quedó en el modo **Tomas** del visor.

## Cómo lo hacen

| Programa | Orbitar / mirar | Deslizar (pan) | Acercar | Volar / caminar |
|---|---|---|---|---|
| **Blender** | Botón central (MMB) arrastrar | Shift + MMB | Rueda, Ctrl + MMB, teclado numérico +/- | Fly/Walk: W o ↑ avanza, **Shift** más rápido, **Alt** más lento, clic o Espacio confirma, **Esc**/clic derecho vuelve al inicio |
| **Inventor** | Shift + botón central (también F4, ViewCube, SteeringWheels) | Botón central (F2) | Rueda (F3) | — (navegación orbital) |
| **Unity** (vista de escena, también Unreal) | — | Botón central | Rueda | **Mantener botón derecho**: el mouse gira la cámara, **WASD** mueve, **Q/E** baja/sube, **Shift** rápido, **rueda** cambia la velocidad |
| **Juegos en primera persona** | Mouse (con *pointer lock*) | — | — | WASD + mouse; Esc suelta el mouse |

Conclusión: para "caminar" por un cuarto lo estándar es **WASD + mirar con el mouse + Shift para correr + Q/E para altura**.
Blender/Inventor usan el botón central para órbita/pan porque trabajan *alrededor de un objeto*; aquí queremos estar *dentro* del cuarto.

## Cómo quedó en el visor (modo 🎥 Tomas)

| Acción | Control |
|---|---|
| Moverte | **W A S D** (los botones ▲◀▼▶ en pantalla hacen lo mismo) |
| Bajar / subir | **Q / E** (o el slider de altura) |
| Rápido / lento | **Shift** ×3 / **Alt** ×0.3 |
| Velocidad base | **[ ]** o **rueda mientras mantienes clic** (como Unity) |
| Mirar | **Clic izquierdo o derecho + arrastrar** (como el vuelo de Unity); flechas del teclado |
| Deslizar | **Botón central + arrastrar** (como Blender/Inventor) |
| Acercar / alejar | **Rueda** (avanza por donde miras); con **Shift** más rápido |
| Mouse bloqueado | Botón 🖱: mirar sin mantener clic, **Esc** suelta |
| Capturar | **Enter** (o 📸); **Esc** cierra la vista de la toma |
| Ocultar la ayuda | **H** |

En pantalla táctil: un dedo mira, dos dedos pellizcan/deslizan, y los botones de moverte/mirar mantienen presionado para avanzar.

## Notas técnicas

- **Pointer Lock** (bloquear el mouse) requiere un gesto del usuario y, dentro de un `iframe`, el permiso `allow-pointer-lock`. El visor de artefactos
  puede no concederlo; por eso el modo por defecto es *clic + arrastrar*, que funciona en todos lados, y el bloqueo es opcional con aviso si falla.
- La cámara se mueve en el plano horizontal con WASD (no vuela hacia donde miras), como en un juego en primera persona; la rueda sí avanza siguiendo la mirada.

## Fuentes

- Blender Manual, Navigate / Fly-Walk: https://docs.blender.org/manual/en/3.0/editors/3dview/navigate/walk_fly.html y https://docs.blender.org/manual/en/3.4/editors/3dview/navigate/index.html
- Autodesk Inventor, SteeringWheels: https://help.autodesk.com/cloudhelp/2025/ENU/Inventor-Help/files/GUID-5D371AC3-EBC4-4B8D-9A9B-4B9B2B290D8B.htm y atajos F2/F3/F4: https://ukcommunity.arkance.world/hc/en-us/articles/21564498735890-Inventor-Quick-Tip-F-Key-Shortcuts
- Unity, Scene view navigation: https://docs.unity3d.com/Manual/SceneViewNavigation.html
- MDN, `Element.requestPointerLock()`: https://developer.mozilla.org/docs/Web/API/Element/requestPointerLock

## Gestos táctiles (HUD estilo juego móvil)

Al entrar a 🎥 Tomas en un teléfono aparece un HUD pensado para pulgares, con las convenciones de los juegos móviles de cámara libre
(doble stick, pellizco para zoom, doble toque, vibración). Los controles del HUD son semitransparentes.

| Gesto / control | Qué hace |
|---|---|
| **Joystick** (abajo, pulgar izquierdo) | Caminar; analógico (más lejos = más rápido) y al borde corre ×2 |
| **Arrastrar con 1 dedo** en la vista | Mirar (como mirar en un shooter); sigue girando con **inercia** al soltar |
| **Pellizcar** | Lente (zoom): 14–85 mm |
| **Dos dedos arrastrando** | Deslizar de lado y **subir/bajar** la cámara |
| **Doble toque en el piso** | Caminar hasta ahí (animado) |
| ▲ ▼ (derecha) | Subir / bajar manteniendo presionado |
| **Obturador** (grande, pulgar derecho) | Capturar, con vibración |
| 📍 / 3:2 / 👁 | Vistas por cuarto · formato horizontal/vertical · ocultar controles |
| ⚙ | Sensibilidad, invertir mirar, **modo zurdo**, panel clásico con sliders |

Notas: el lente largo gira más despacio (la sensibilidad se escala con el campo de visión); la vibración usa `navigator.vibrate` donde el
navegador lo permite (Android; iOS Safari no lo soporta). No se usa giroscopio: pedir el sensor requiere un permiso que los visores
embebidos suelen bloquear.

## Giro con dos dedos

En la vista principal (3D y Planta) y en el modo Tomas, **girar dos dedos** rota la vista, como en los mapas: el giro sigue a tus dedos.
Funciona junto con el pellizco (zoom) y el arrastre con dos dedos (deslizar), incluso si el primer dedo cae sobre un mueble.
