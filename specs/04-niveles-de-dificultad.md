# SPEC 04 — Niveles de dificultad progresiva

> **Estado:** Borrador
> **Depende de:** SPEC 01, SPEC 02, SPEC 03
> **Fecha:** 2026-11-10
> **Objetivo:** Encadenar niveles infinitos en ciclos de 7: cada nivel añade una fila de color y cada ciclo nuevo acorta la paleta, acelera la pelota y hace los bloques más resistentes.

---

## Alcance

**Dentro:**

- Niveles numerados desde 1, sin fin. Se agrupan en **ciclos** de 7 niveles.
- Dentro de un ciclo, el nivel `n` (1–7) muestra `n` filas de 25 bloques, en este orden de aparición: azul, naranja, morado, verde, amarillo, rojo, gris.
- La fila más nueva siempre ocupa la posición superior (`y = BRICK_TOP`) y las anteriores se desplazan una fila hacia abajo. El nivel 1 es una sola fila azul en `y = 80`; el nivel 7 es idéntico a la rejilla actual de 175 bloques.
- Al empezar un ciclo nuevo se vuelve a una sola fila azul, con estos cambios por ciclo `c` (1, 2, 3…):
  - Golpes para romper un bloque: `min(c, 5)`.
  - Ancho de la paleta: `max(70, 162 − 10·(c − 1))` px.
  - Velocidad de la pelota: `min(480, 360 + 10·(c − 1))` px/s.
- Golpe a un bloque que no se rompe: la pelota rebota, suena `'bounce'` (SPEC 03), no suma puntos, no explota y el bloque se dibuja más oscuro.
- Golpe que rompe el bloque: igual que ahora (explosión de la SPEC 02, `'break'`, 5 puntos).
- Al romper todos los bloques (y terminar las explosiones), nueva fase `cleared` con el overlay «Nivel N superado» y «Clic, Espacio o Enter para continuar». Al confirmar se carga el nivel siguiente con la pelota pegada.
- Puntos y vidas se conservan entre niveles.
- «Game Over» reinicia desde el nivel 1 con 3 vidas y 0 puntos.
- El HUD muestra «Nivel N» centrado en la franja superior.

**Fuera de alcance (para futuras specs):**

- Guardar el nivel alcanzado o high scores entre sesiones.
- Selector de nivel o menú de inicio.
- Patrones de bloques con huecos o formas, editor de niveles o niveles en JSON.
- Power-ups, vidas extra o puntos según el color o la resistencia.
- Arte nuevo para bloques dañados (se oscurecen con una capa semitransparente).
- Pantalla de victoria final: el juego no termina mientras queden vidas.

---

## Modelo de datos

```js
// src/config.js — cambios
// Se eliminan ROWS y BRICK_COLORS (la rejilla ya no es fija).
// Orden de aparición. Los nombres son los del spritesheet; el color visible va comentado.
export const LEVEL_COLORS = ['green', 'hotpink', 'magenta', 'cyan', 'yellow', 'red', 'gray'];
//                            azul     naranja    morado     verde   amarillo  rojo   gris
export const LEVELS_PER_CYCLE = 7;        // = LEVEL_COLORS.length
export const MAX_HITS = 5;                // tope de golpes por bloque
export const PADDLE_W = 162;              // ancho base (ciclo 1)
export const PADDLE_W_STEP = 10, PADDLE_W_MIN = 70;
export const BALL_SPEED = 360;            // velocidad base (ciclo 1)
export const BALL_SPEED_STEP = 10, BALL_SPEED_MAX = 480;

// src/game.js — estado (campos nuevos o cambiados)
const state = {
  phase: 'ready',      // 'ready' | 'playing' | 'cleared' | 'gameover'  ('won' desaparece)
  level: 1,            // nivel actual, desde 1
  hits: 1,             // golpes que necesita cada bloque en este nivel = min(ciclo, MAX_HITS)
  ballSpeed: 360,      // px/s en este nivel
  paddle: { x, y, w }, // w = ancho de la paleta en este nivel
  bricks: [/* { x, y, color, alive, explodeT, hp } */],  // hp: golpes que le quedan (1..hits)
  // score, lives, ball, sounds: sin cambios
};

// src/game.js — funciones exportadas
createState();           // nivel 1, LIVES vidas, 0 puntos
loadLevel(state, level); // rellena level, hits, ballSpeed, paddle.w, bricks; phase = 'ready'; conserva score y lives
```

Convenciones:

- `ciclo = Math.floor((level − 1) / 7) + 1` y `filas = (level − 1) % 7 + 1`.
- Fila `i` (0 = arriba) de un nivel con `filas` filas: color `LEVEL_COLORS[filas − 1 − i]`, `y = BRICK_TOP + i·BRICK_H`.
- La paleta se dibuja con `drawSprite(ctx, 'paddle', x, y, paddle.w, PADDLE_H)`; el sprite se estira o encoge en ancho.
- Oscurecimiento de un bloque dañado: sobre el sprite, un `fillRect` negro con opacidad `0.5 · (1 − hp / hits)`.
- Todas las referencias a `PADDLE_W` y `BALL_SPEED` en lógica y render pasan a usar `state.paddle.w` y `state.ballSpeed`.

---

## Plan de implementación

1. En `src/config.js`, sustituir `ROWS`/`BRICK_COLORS` por las constantes nuevas. En `src/game.js`, extraer `loadLevel(state, level)` de `createState()` y generar las filas según `level`. `createState()` llama a `loadLevel(state, 1)`. Prueba manual: el juego arranca con una sola fila azul de 25 bloques en `y = 80`; en consola, `loadLevel(state, 7)` muestra la rejilla completa con el gris arriba y el azul abajo.
2. Sustituir `PADDLE_W` por `state.paddle.w` en `clampPaddle`, `stickBall`, `bounceOnPaddle` y `render`. Sustituir `BALL_SPEED` por `state.ballSpeed` en el lanzamiento y en `bounceOnPaddle`. Calcular `paddle.w` y `ballSpeed` en `loadLevel` a partir del ciclo. Prueba manual: con `loadLevel(state, 8)` la paleta mide 152 px, la pelota pegada queda centrada y la pelota va a 370 px/s.
3. Añadir `hp` a los bloques (`= state.hits`). En `hitBrick`: restar 1 a `hp`; si queda > 0, rebotar y añadir `'bounce'` sin puntos ni explosión; si llega a 0, comportamiento actual. En `render.js`, dibujar la capa oscura según `hp / hits`. Prueba manual: en el nivel 8 cada bloque necesita 2 golpes, se oscurece tras el primero y explota tras el segundo.
4. Sustituir la fase `won` por `cleared` (misma condición: sin bloques vivos ni explosiones). En `src/main.js`, en `cleared` con `input.restart`, llamar a `loadLevel(state, state.level + 1)` y anular `input.launch`. `gameover` sigue llamando a `createState()`. Prueba manual: al limpiar el nivel 1 aparece «Nivel 1 superado»; al confirmar se carga el nivel 2 con dos filas (naranja arriba, azul abajo) y se conservan puntos y vidas.
5. En `src/render.js`, dibujar «Nivel N» centrado en el HUD y el overlay de `cleared` («Nivel N superado» / «Clic, Espacio o Enter para continuar»). Eliminar el texto «Has ganado». Prueba manual: el HUD muestra el nivel correcto en todo momento y el overlay aparece solo al limpiar el nivel.

---

## Criterios de aceptación

- [ ] Con `python3 -m http.server`, el juego carga sin errores ni avisos en la consola.
- [ ] El nivel 1 tiene exactamente 25 bloques azules (`block_green`) en una fila con `y = 80`.
- [ ] El nivel 2 tiene 50 bloques: naranja en `y = 80` y azul en `y = 96`.
- [ ] El nivel 7 tiene 175 bloques, de arriba abajo: gris, rojo, amarillo, verde, morado, naranja, azul.
- [ ] El nivel 8 vuelve a 25 bloques azules en `y = 80`, cada uno necesita 2 golpes, la paleta mide 152 px y la pelota va a 370 px/s.
- [ ] El nivel 15 (ciclo 3) tiene bloques de 3 golpes, paleta de 142 px y pelota a 380 px/s.
- [ ] Desde el ciclo 5, los bloques necesitan siempre 5 golpes.
- [ ] Desde el ciclo 11, la paleta mide siempre 70 px.
- [ ] Desde el ciclo 13, la pelota va siempre a 480 px/s.
- [ ] Un golpe que no rompe el bloque lo hace rebotar, suena `ball-bounce.mp3`, no suma puntos, no muestra explosión y el bloque se ve más oscuro.
- [ ] El golpe que rompe el bloque muestra la explosión, suena `break-sound.mp3` y suma exactamente 5 puntos.
- [ ] La velocidad de la pelota es la misma antes y después de cada rebote dentro de un nivel.
- [ ] Al romper el último bloque, la explosión termina y después aparece «Nivel N superado»; la pelota no se mueve mientras se muestra.
- [ ] Clic, Espacio o Enter en «Nivel N superado» carga el nivel N+1 con la pelota pegada y sin lanzarla, con los mismos puntos y vidas.
- [ ] El HUD muestra «Nivel N» con el número correcto, sin solaparse con el botón de silencio, los puntos ni las vidas.
- [ ] En «Game Over», reiniciar vuelve al nivel 1 con 3 vidas, 0 puntos, paleta de 162 px y pelota a 360 px/s.
- [ ] La paleta más corta sigue limitada al canvas y el rebote por los extremos sigue desviando la pelota hacia ese lado.
- [ ] No se añade ninguna dependencia ni paso de build.

---

## Decisiones

- **Sí:** ciclos de 7 niveles, uno por color, en orden azul, naranja, morado, verde, amarillo, rojo y gris. Lo diseñó el usuario.
- **Sí:** la fila nueva entra arriba y empuja las anteriores hacia abajo. Lo eligió el usuario. Así el nivel 7 coincide con la rejilla de la SPEC 01.
- **No:** filas en posición fija que crecen hacia arriba. Descartado por el usuario.
- **Sí:** `LEVEL_COLORS` usa los nombres del spritesheet (`green` se ve azul, `hotpink` naranja, `magenta` morado, `cyan` verde). Renombrar los sprites rompería `assets/spritesheet.js` y la SPEC 02.
- **Sí:** golpes por bloque `= min(ciclo, 5)`. El usuario pidió que los golpes crezcan con el ciclo; el tope evita niveles interminables.
- **No:** golpes sin tope. En el ciclo 10 serían 250 golpes para limpiar una fila.
- **Sí:** paleta −10 px por ciclo con mínimo 70 px, y pelota +10 px/s por ciclo con tope 480 px/s. Valores elegidos por el usuario.
- **Sí:** niveles infinitos; el juego solo termina en «Game Over». Desaparece la fase `won`.
- **No:** victoria final al llegar a la paleta mínima. Descartado por el usuario.
- **Sí:** golpe parcial con rebote, sonido de rebote, sin puntos y bloque oscurecido. Los puntos y la explosión quedan reservados a la rotura.
- **No:** 5 puntos y sonido de rotura por cada golpe. Confunde el feedback de «bloque roto».
- **Sí:** oscurecer con una capa semitransparente. No existe arte de bloque dañado.
- **Sí:** se conservan puntos y vidas entre niveles, con pantalla «Nivel N superado» que espera confirmación.
- **No:** paso automático de nivel. El jugador no tendría pausa entre niveles.
- **No:** persistir el nivel alcanzado. Va con high scores en otra spec.

---

## Riesgos

| Riesgo                                                        | Mitigación                                                                                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| A 480 px/s la pelota atraviesa bloques (tunneling)            | Con `dt` acotado a 1/30 s el paso máximo es 16 px. Pelota (16) + bloque (16) dan una ventana de solape de 32 px, y pelota + paleta (14) una de 30 px; ambas son mayores que el paso. |
| La pelota se queda atascada rebotando dentro de un bloque resistente | Se procesa un bloque por frame y la velocidad se fuerza con `Math.abs` hacia fuera del bloque, igual que en la SPEC 01.                         |
| El sprite de la paleta estirado a 70 px se ve deformado        | Aceptado: se escala solo en ancho y con `image-rendering: pixelated`.                                                                              |
| Quedan referencias a `PADDLE_W`, `BALL_SPEED`, `ROWS` o `BRICK_COLORS` | El paso 2 las sustituye todas; tras eliminarlas de `config.js`, cualquier import que quede falla al cargar y se detecta en la consola.     |
| Un mismo clic confirma «Nivel superado» y lanza la pelota      | `main.js` anula `input.launch` al cargar el nivel, igual que al reiniciar en la SPEC 01.                                                            |

---

## Lo que **no** está en esta spec

- Persistencia del nivel, high scores, selector de nivel y menú de inicio.
- Patrones de bloques con formas, editor de niveles o niveles en JSON.
- Power-ups, vidas extra y puntos por color o resistencia.
- Arte específico para bloques dañados.
- Victoria final.

Cada uno de estos puntos, si se hace, va en su propia spec.
