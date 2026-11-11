# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responde siempre en español en este proyecto.

## Estado del proyecto

Juego de Arkanoid en HTML, CSS y JavaScript puros: **cero dependencias, sin paso de build, sin gestor de paquetes**. El juego está implementado (specs 01–04) y se publica en GitHub Pages. No hay test runner ni linter: se verifica jugando y con los criterios de aceptación de cada spec. El README está desactualizado (dice que no está implementado).

Ejecutar: los módulos ES (`<script type="module">`) no cargan desde `file://`, así que hay que servir la carpeta de forma estática: `python3 -m http.server` y abrir `http://localhost:8000`. Esto también evita el canvas contaminado (tainted) con el spritesheet.

Despliegue: `.github/workflows/static.yml` publica el repositorio entero en GitHub Pages en cada push a `main`. Todo lo que esté en la raíz queda público.

## Estructura

```
index.html              canvas 800×600 + spritesheet.js (clásico) + src/main.js (módulo)
style.css               escala el canvas por CSS
src/
  config.js             constantes (resolución, bloques, paleta, pelota, velocidades, vidas, puntos, MUTE_BTN)
  main.js               bucle requestAnimationFrame; une input → update → sonidos → render
  game.js               lógica pura: createState, loadLevel, update (sin DOM ni dibujo)
  input.js              teclado y ratón → objeto `input` con eventos pendientes
  render.js             dibujo en canvas (HUD, bloques, overlays) usando las globales de assets
  audio.js              Web Audio: buffers decodificados una vez, silencio persistido en localStorage
assets/                 spritesheet + sonidos (ver abajo)
specs/                  specs numeradas NN-slug.md + .spec-config.yml
.claude/skills/         skills /spec y /spec-impl
```

### Arquitectura del juego

- `config.js` es la única fuente de números mágicos; otros módulos importan de ahí.
- `game.js` solo muta el `state`. No toca DOM ni audio: para sonar, empuja nombres (`'bounce'`, `'break'`) en `state.sounds`, y `main.js` los reproduce y vacía la cola cada frame.
- `input.js` expone eventos pendientes (`launch`, `restart`, `toggleMute`, `mouseX`); quien los consume los pone a `false`/`null`.
- Fases (`state.phase`): `ready` (pelota pegada) → `playing` → `cleared` (nivel superado) o `gameover`. Los niveles son infinitos en ciclos de 7 (ver SPEC 04); puntos y vidas se conservan entre niveles.
- Coordenadas lógicas 800×600; el ratón se convierte de píxeles CSS a lógicas.
- `dt` se limita a 1/30 s en `main.js`; las velocidades están en px/s.
- `main.js` carga con `loadSpritesheet(cb)` e inicia el bucle solo dentro de `cb`.

## Assets (`assets/`)

- `spritesheet-breakout.png` — atlas de sprites único para todo lo visual.
- `spritesheet.js` — script clásico (no módulo) que define **globales**: `SPRITES` (rectángulos de origen de paleta, pelota y bloques por color), `EXPLOSION_FRAMES` (4 frames por color) y `EXPLOSION_DURATION` (150 ms), además de las funciones `loadSpritesheet(cb)`, `drawSprite(ctx, name, x, y, w, h)` y `drawFrame(ctx, frame, x, y, w, h)`.
  - Cargar con un `<script src="assets/spritesheet.js">` normal, **antes** del módulo principal. Los módulos de `src/` usan esas globales sin importarlas; no convertirlo a módulos ES sin actualizar a los consumidores.
  - Las funciones de dibujo no hacen nada (en silencio) hasta que la imagen se ha cargado.
  - Los sprites de bloque se direccionan por nombre `block_<color>` (colores: gray, red, yellow, cyan, magenta, hotpink, green). Tamaño nativo: bloque 32×16, paleta 162×14, pelota 16×16; los argumentos `w`/`h` los escalan.
  - La imagen se copia a un canvas fuera de pantalla al cargar (`ssImg` es un canvas, no un `Image`).
  - `EXPLOSION_FRAMES.gray` reutiliza los frames de rojo (no existe arte de explosión gris).
- `sounds/ball-bounce.mp3`, `sounds/break-sound.mp3` — rebote (paleta/pared/bloque no roto) y rotura de bloque. Se cargan por `src/audio.js`.

## Desarrollo spec-driven

Toda funcionalidad no trivial se diseña primero como spec y se implementa después contra ella. La spec es el contrato: si el código y la spec discrepan, se corrige la spec, no se improvisa en el código.

### Ciclo

1. `/spec <descripción en una frase>` → diseño interactivo en 4 fases (contexto, preguntas, redacción, guardado). No escribe código. Guarda `specs/NN-slug.md` en estado `Borrador`.
2. El humano relee y cambia el estado a `Aprobado` a mano (el agente no lo hace).
3. `/spec-impl <NN|slug|NN-slug>` → solo funciona con specs aprobadas. Crea y cambia a la rama `spec-NN-slug` (si `AutoCreateBranch: true` en `specs/.spec-config.yml`; con `false` pregunta antes), muestra el resumen de la spec, implementa **un paso del plan a la vez** y pausa para revisar el diff. Nunca hace commits por su cuenta. Exige árbol de trabajo limpio o confirmación.
4. Al terminar, la spec pasa a `Implementado` y se integra por PR (los commits previos son `Spec 0N …  (#N)`).

Ambas skills son de invocación manual (`disable-model-invocation: true`). Si falta algo en la spec durante la implementación: parar, describir la ambigüedad y ofrecer 2–3 opciones; lo que quede fuera de alcance se anota para la siguiente spec.

### Convenciones de las specs (`specs/NN-slug.md`)

- Numeración correlativa de dos dígitos, slug en kebab-case, en **español**. Una spec nueva copia idioma y encabezados de las existentes; la forma de referencia está en `.claude/skills/spec/template.md`.
- Cabecera en blockquote: `**Estado:**` (`Borrador`, `En revisión`, `Aprobado`, `Implementado`, `Obsoleto`), `**Depende de:**` (SPEC NN o «ninguna»), `**Fecha:**`, `**Objetivo:**` (una sola frase; si no cabe, dividir la spec).
- Secciones, en este orden: `Alcance` (con **Dentro** y **Fuera de alcance**, ambos obligatorios), `Modelo de datos`, `Plan de implementación` (pasos numerados, cada uno deja el sistema ejecutable), `Criterios de aceptación` (checklist booleano verificable), `Decisiones` (qué sí y qué no, con motivo), `Riesgos` (opcional), `Lo que **no** está en esta spec`.
- Sin TODOs ni funciones completas de código: la spec describe, el código viene después.

### Specs existentes

| Spec | Tema | Depende de |
| --- | --- | --- |
| 01 | MVP jugable (paleta, pelota, bloques, vidas, puntos) | — |
| 02 | Animación de destrucción de bloques | 01 |
| 03 | Sonidos de rebote y rotura, con silencio alternable (`M` o botón; persistido en `localStorage`) | 01, 02 |
| 04 | Niveles infinitos en ciclos de 7, dificultad progresiva por ciclo | 01, 02, 03 |

Para cambiar o ampliar el juego: léelas (sobre todo las más recientes) antes de tocar `src/`, y escribe una spec nueva con `/spec` en lugar de modificar una `Implementado`, salvo para corregirla.
