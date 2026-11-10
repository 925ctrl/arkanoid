# SPEC 02 — Animación de destrucción de bloques

> **Estado:** implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-10
> **Objetivo:** Al romper un bloque, mostrar en su lugar la animación de explosión de 4 frames (`EXPLOSION_FRAMES`) durante `EXPLOSION_DURATION` ms antes de que desaparezca.

---

## Alcance

**Dentro:**

- Al golpear un bloque, se dibuja en su posición la animación de explosión de su color (4 frames, 150 ms en total) y después desaparece.
- El bloque deja de colisionar y suma puntos en el instante del golpe, no al terminar la animación.
- La animación avanza con `dt`, en cualquier fase del juego (`ready`, `playing`, `gameover`, `won`).
- La fase `won` se activa cuando no quedan bloques vivos **y** han terminado todas las animaciones en curso.
- Los bloques `gray` usan los frames de `red` (ya resuelto en `EXPLOSION_FRAMES.gray`).

**Fuera de alcance (para futuras specs):**

- Audio (`break-sound.mp3`, `ball-bounce.mp3`).
- Partículas, destellos, sacudida de pantalla o cualquier otro efecto visual.
- Arte de explosión propio para `gray`.
- Cambiar la duración o los frames de la animación (se usan tal cual los define `assets/spritesheet.js`).
- Bloques resistentes, power-ups, varios niveles.

---

## Modelo de datos

Se amplía el bloque de la SPEC 01 con un único campo; no hay estructuras nuevas.

```js
// src/game.js — bloque
{ x, y, color, alive, explodeT }
// alive:    true mientras el bloque colisiona y se dibuja entero.
// explodeT: null si no está explotando; si no, ms transcurridos desde el golpe
//           (0 <= explodeT < EXPLOSION_DURATION). Solo es no-null con alive === false.
```

Convenciones:

- `EXPLOSION_DURATION` y `EXPLOSION_FRAMES` son globales de `assets/spritesheet.js`, no se duplican en `src/config.js`.
- Frame mostrado: `Math.min(3, Math.floor(explodeT / (EXPLOSION_DURATION / 4)))`, es decir, 4 frames iguales (37,5 ms cada uno).
- Se dibuja a tamaño nativo (32×16) con `drawFrame`, en la posición del bloque.
- Al terminar (`explodeT >= EXPLOSION_DURATION`) se pone `explodeT = null` y el bloque deja de dibujarse.

---

## Plan de implementación

1. En `src/game.js`, inicializar `explodeT: null` en los bloques de `createState()`; en `hitBrick`, además de `alive = false`, poner `explodeT = 0`. Añadir al inicio de `update` un avance de todas las explosiones (`explodeT += dt * 1000`; a `null` al superar `EXPLOSION_DURATION`), fuera de cualquier condición de fase. Prueba manual: el juego se comporta como antes; en consola, `explodeT` de un bloque roto pasa de 0 a `null` en ~150 ms.
2. En `src/render.js`, tras dibujar los bloques vivos, dibujar con `drawFrame(ctx, EXPLOSION_FRAMES[b.color][frame], b.x, b.y, BRICK_W, BRICK_H)` los bloques con `explodeT !== null`. Prueba manual: al romper un bloque se ve la animación en su sitio y luego desaparece, para cada uno de los 7 colores.
3. En `src/game.js`, cambiar la condición de victoria a «ningún bloque con `alive` ni con `explodeT !== null`». Prueba manual: al romper el último bloque se ve su explosión completa y después aparece «Has ganado».

---

## Criterios de aceptación

- [x] Con `python3 -m http.server`, el juego carga sin errores ni avisos en la consola.
- [x] Al romper un bloque, en su posición se muestran 4 frames de explosión distintos, en orden, y después el hueco queda vacío.
- [x] La animación dura 150 ms (`EXPLOSION_DURATION`), no más de 1 frame de diferencia a 60 Hz.
- [x] Los 7 colores muestran una explosión; el bloque gray muestra la de red.
- [x] La puntuación sube exactamente 5 puntos en el frame del golpe, no al terminar la animación.
- [x] La pelota atraviesa el hueco de un bloque que está explotando (no rebota contra él).
- [x] Romper varios bloques en frames consecutivos anima cada uno de forma independiente.
- [x] Al romper el último bloque, la explosión se ve completa y «Has ganado» aparece al terminar, no antes.
- [x] Si se pierde la pelota con una explosión en curso, esta termina sola y no queda ningún frame congelado.
- [x] Reiniciar desde «Game Over» o «Has ganado» deja los 175 bloques enteros y sin ninguna explosión residual.
- [x] No se añade ninguna dependencia ni paso de build.

---

## Decisiones

- **Sí:** campo `explodeT` en el bloque. No añade estructuras: `createState()` ya reinicia los bloques y con ello las explosiones.
- **No:** array `state.explosions` aparte. Obligaría a mantener y reiniciar un segundo array para un efecto de 150 ms; se reconsidera si llegan efectos más complejos (partículas).
- **Sí:** `alive = false` al golpear, con la explosión como estado visual aparte. La colisión y los puntos no cambian respecto a la SPEC 01.
- **Sí:** la animación avanza en todas las fases. Así nunca queda una explosión congelada bajo el overlay ni tras perder una vida.
- **No:** avanzar la animación solo en `playing`. Dejaría frames a medias visibles en `gameover`/`won`.
- **Sí:** `won` espera a que acaben las explosiones. Se ve explotar el último bloque, a costa de 150 ms de retraso.
- **No:** `won` inmediato. Cortaría la animación bajo el overlay.
- **Sí:** el audio se deja fuera. `break-sound.mp3` se integra con el resto del audio en otra spec.
- **Sí:** reutilizar los globales `EXPLOSION_FRAMES` / `EXPLOSION_DURATION` / `drawFrame`, sin copiarlos a `config.js`, igual que se hace con `drawSprite`.

---

## Riesgos

| Riesgo                                                            | Mitigación                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| La pelota pierde una vida en el hueco de 150 ms antes de `won`    | Imposible en la práctica: la pelota recorre como mucho 54 px en 150 ms (360 px/s) y los bloques están lejos del borde inferior. |
| `dt` acotado a 1/30 s alarga la animación tras una pausa de pestaña | Aceptado: solo afecta a una explosión en curso en el instante de la pausa.                                           |

---

## Lo que **no** está en esta spec

- Audio de rotura o de rebote.
- Partículas, destellos o sacudida de pantalla.
- Arte de explosión específico para gray.
- Bloques resistentes, power-ups y varios niveles.

Cada uno de estos puntos, si se hace, va en su propia spec.
