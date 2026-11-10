# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responde siempre en español en este proyecto.

## Estado del proyecto

Juego de Arkanoid en HTML, CSS y JavaScript puros: **cero dependencias, sin paso de build, sin gestor de paquetes**. Según el README, el juego todavía no está implementado: solo existen los assets. No hay `index.html`, ni test runner, ni linter, y el directorio aún no es un repositorio git. Cuando exista un `index.html`, se ejecuta abriéndolo directamente o sirviendo la carpeta de forma estática (p. ej. `python3 -m http.server`); esto también hace falta para que el spritesheet cargue sin problemas de canvas contaminado (tainted).

## Assets (`assets/`)

- `spritesheet-breakout.png` — atlas de sprites único para todo lo visual.
- `spritesheet.js` — script clásico (no módulo) que define **globales**: `SPRITES` (rectángulos de origen de paleta, pelota y bloques por color), `EXPLOSION_FRAMES` (4 frames por color) y `EXPLOSION_DURATION` (150 ms), además de las funciones `loadSpritesheet(cb)`, `drawSprite(ctx, name, x, y, w, h)` y `drawFrame(ctx, frame, x, y, w, h)`.
  - Cargar con un `<script src="assets/spritesheet.js">` normal; no convertirlo a módulos ES sin actualizar a los consumidores de esas globales.
  - Llamar a `loadSpritesheet(cb)` e iniciar el bucle del juego solo dentro de `cb`; las funciones de dibujo no hacen nada (en silencio) hasta que la imagen se ha cargado.
  - Los sprites de bloque se direccionan por nombre `block_<color>` (colores: gray, red, yellow, cyan, magenta, hotpink, green). Tamaño nativo: bloque 32×16, paleta 162×14, pelota 16×16; los argumentos `w`/`h` los escalan.
  - La imagen se copia a un canvas fuera de pantalla al cargar (`ssImg` es un canvas, no un `Image`).
  - `EXPLOSION_FRAMES.gray` reutiliza los frames de rojo (no existe arte de explosión gris).
- `sounds/ball-bounce.mp3`, `sounds/break-sound.mp3` — el único audio disponible (rebote de paleta/pared y rotura de bloque).

## Skills del proyecto (`.claude/skills/`)

Flujo spec-driven, de invocación manual (`disable-model-invocation: true`):

- `/spec <descripción>` — diseño interactivo de specs en 4 fases; escribe `specs/NN-slug.md` a partir de `spec/template.md`. Las respuestas deben coincidir con el idioma del prompt, y las specs nuevas con el idioma y los encabezados de las existentes.
- `/spec-impl <NN-nombre-spec>` — implementa una spec `Approved` en una rama `spec-NN-slug`, con pausas para revisar diffs y sin hacer commits por su cuenta. Requiere un repo git (usa `git branch`/`checkout`), así que hay que ejecutar `git init` antes.

Para funcionalidades grandes, escribe una spec con `/spec` antes de programar.
