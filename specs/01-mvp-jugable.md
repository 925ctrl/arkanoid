# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** Aprobado
> **Depende de:** ninguna (usa los assets existentes en `assets/`)
> **Fecha:** 2026-11-10
> **Objetivo:** Un Arkanoid jugable en el navegador con un nivel fijo, 3 vidas, puntuación, victoria/derrota y reinicio rápido.

---

## Alcance

**Dentro:**

- Canvas con resolución lógica fija de 800×600, escalado por CSS para caber en la ventana (se mantiene la proporción).
- Un solo nivel fijo: 7 filas × 25 columnas de bloques, que ocupan los 800 px de ancho (una fila por color: gray, red, yellow, cyan, magenta, hotpink, green), de 32×16 px.
- Paleta controlada con ratón o teclado (flechas / A-D).
- Pelota pegada a la paleta al inicio y tras perder una vida; se lanza con clic o Espacio.
- Rebote en paredes laterales y techo, en la paleta (ángulo según el punto de impacto) y en bloques.
- Todos los bloques se rompen de un golpe y desaparecen sin animación.
- 3 vidas; perder la pelota por abajo resta una.
- Puntuación: 5 puntos por bloque, visible en el HUD junto con las vidas.
- Pantallas de "Game Over" (0 vidas) y "Has ganado" (0 bloques), con reinicio por clic, Espacio o Enter.
- Estructura de código en módulos ES.

**Fuera de alcance (para futuras specs):**

- Audio (`ball-bounce.mp3`, `break-sound.mp3`) y animación de explosión (`EXPLOSION_FRAMES`).
- Bloque gray resistente (2 golpes) o cualquier bloque con estado distinto.
- Varios niveles, progresión de dificultad y formato de datos de niveles.
- Power-ups, pausa, menú de inicio, high scores y persistencia.
- Soporte táctil / móvil.
- Tests automáticos, linter y paso de build.

---

## Modelo de datos

```js
// src/config.js
export const W = 800, H = 600;           // resolución lógica del canvas
export const COLS = 25, ROWS = 7;        // COLS * BRICK_W = W
export const BRICK_W = 32, BRICK_H = 16;
export const BRICK_TOP = 80;             // y de la primera fila (deja sitio al HUD)
export const BRICK_COLORS = ['gray', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green']; // una por fila
export const PADDLE_W = 162, PADDLE_H = 14, PADDLE_Y = 560;
export const BALL_SIZE = 16;
export const BALL_SPEED = 360;           // px/s, constante
export const PADDLE_SPEED = 480;         // px/s con teclado
export const MAX_BOUNCE_ANGLE = 60;      // grados respecto a la vertical
export const LIVES = 3;
export const POINTS_PER_BRICK = 5;

// src/game.js — estado único del juego
const state = {
  phase: 'ready',   // 'ready' (pelota pegada) | 'playing' | 'gameover' | 'won'
  score: 0,
  lives: LIVES,
  paddle: { x, y: PADDLE_Y },            // x = borde izquierdo
  ball: { x, y, vx, vy },                // x,y = esquina superior izquierda
  bricks: [/* { x, y, color, alive } */],
};
```

Convenciones:

- Origen en la esquina superior izquierda; y crece hacia abajo.
- Velocidades en px/s; la actualización usa `dt` en segundos (acotado a 1/30 s para evitar atravesar bloques tras una pausa de pestaña).
- Los sprites se dibujan con `drawSprite` de `assets/spritesheet.js` (global, script clásico), sin escalar: bloque `block_<color>`, paleta y pelota a su tamaño nativo.

---

## Plan de implementación

1. Crear `index.html` (canvas `#game`, carga `assets/spritesheet.js` como script clásico y luego `src/main.js` como `type="module"`) y `style.css` (canvas centrado, fondo oscuro, escalado manteniendo proporción). Crear `src/config.js` y `src/main.js`, que llama a `loadSpritesheet(cb)` y arranca el bucle con `requestAnimationFrame` dentro de `cb`. Prueba manual: servir con `python3 -m http.server`, ver el canvas vacío sin errores en consola.
2. Crear `src/game.js` con `createState()` y `src/render.js` con `render(ctx, state)`. Dibujar la paleta, la pelota pegada a ella y la rejilla de bloques. Prueba manual: se ve el nivel completo.
3. Crear `src/input.js` (ratón, teclado, lanzamiento). Mover la paleta con ratón y con flechas/A-D, limitada a `[0, W - PADDLE_W]`; la pelota pegada la sigue. Prueba manual: la paleta responde a ambos controles y no sale del canvas.
4. En `game.js`, lanzar la pelota (clic/Espacio en fase `ready`) y moverla con rebote en paredes y techo. Prueba manual: la pelota rebota en tres lados.
5. Rebote en paleta con ángulo según el punto de impacto (`offset` en `[-1, 1]` desde el centro → ángulo `offset * MAX_BOUNCE_ANGLE`; la velocidad se mantiene en `BALL_SPEED`). Prueba manual: golpear por el borde desvía la pelota; por el centro, sube recta.
6. Colisión con bloques: al tocar uno vivo, se marca `alive = false`, se suma `POINTS_PER_BRICK` y se invierte `vx` o `vy` según el eje de menor penetración. Se procesa como máximo un bloque por frame. Prueba manual: los bloques desaparecen y el rebote es coherente.
7. Vidas y HUD: al salir por abajo se resta una vida, se vuelve a `ready`; con 0 vidas, `gameover`. Dibujar puntuación y vidas en la franja superior (y < `BRICK_TOP`). Prueba manual: perder tres veces muestra Game Over.
8. Victoria y reinicio: con 0 bloques vivos, fase `won`. En `gameover` y `won` se dibuja un texto central; clic, Espacio o Enter llama a `createState()`. Prueba manual: ganar y perder, y reiniciar en ambos casos.

---

## Criterios de aceptación

- [ ] Con `python3 -m http.server`, abrir `index.html` carga el juego sin errores ni avisos en la consola.
- [ ] Se ven 175 bloques (7 filas × 25 columnas, sin hueco a los lados), con un color distinto por fila, la paleta y la pelota.
- [ ] La paleta sigue al ratón y también se mueve con ←/→ y A/D, sin salir del canvas.
- [ ] La pelota permanece pegada a la paleta hasta que se pulsa clic o Espacio.
- [ ] La pelota rebota en paredes laterales y techo.
- [ ] Golpear la paleta por su extremo derecho envía la pelota hacia la derecha y por el izquierdo hacia la izquierda; por el centro sube en vertical.
- [ ] La velocidad de la pelota es la misma antes y después de cada rebote.
- [ ] Romper un bloque lo hace desaparecer y suma exactamente 5 puntos.
- [ ] Un bloque nunca se rompe sin que la pelota lo toque, y la pelota nunca lo atraviesa a velocidad normal.
- [ ] Perder la pelota resta una vida y la pelota vuelve pegada a la paleta.
- [ ] Con 0 vidas aparece "Game Over" y la pelota ya no se mueve.
- [ ] Al romper los 175 bloques aparece "Has ganado".
- [ ] Desde "Game Over" o "Has ganado", clic, Espacio o Enter reinicia con 3 vidas, 0 puntos y los 175 bloques.
- [ ] Al redimensionar la ventana, el canvas se reescala sin deformarse y el ratón sigue alineado con la paleta.
- [ ] No hay ninguna dependencia externa ni paso de build.

---

## Decisiones

- **Sí:** módulos ES (`src/*.js`) por elección del usuario. Separa configuración, estado, entrada y render.
- **Sí:** `assets/spritesheet.js` se mantiene como script clásico cargado antes del módulo; sus globales (`drawSprite`, `loadSpritesheet`, `SPRITES`) son visibles desde los módulos. No se convierte a módulo para no romper a sus consumidores.
- **Consecuencia aceptada:** los módulos ES no cargan desde `file://` por CORS, así que el juego requiere servidor estático (`python3 -m http.server`). Ya era necesario para el spritesheet.
- **Sí:** resolución lógica fija 800×600 escalada por CSS. Las coordenadas no dependen de la ventana.
- **No:** canvas a pantalla completa. Complica colisiones y distribución de bloques.
- **Sí:** ángulo de rebote según punto de impacto con velocidad constante. Da control al jugador, como el Arkanoid original.
- **No:** rebote especular simple en la paleta. La trayectoria no sería controlable.
- **Sí:** 5 puntos fijos por bloque. Es fácil de verificar.
- **No:** puntos por color. Requiere tabla de valores sin necesidad en el MVP.
- **Sí:** todos los bloques de un golpe, incluido gray. No hay estado por bloque más allá de `alive`.
- **No:** audio ni explosiones en el MVP. El arte y el sonido existen y se integran en otra spec.
- **Sí:** movimiento con `dt` en segundos, para que la velocidad no dependa de los Hz del monitor.

---

## Riesgos

| Riesgo                                              | Mitigación                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| La pelota atraviesa bloques o la paleta (tunneling) | `dt` acotado a 1/30 s; a 360 px/s el paso máximo es 12 px, menor que el alto de bloque (16 px). |
| Rebote erróneo en esquinas de bloques               | Se resuelve por el eje de menor penetración y se procesa un solo bloque por frame.               |
| Abrir `index.html` con doble clic no funciona       | Documentado: se necesita servidor estático por los módulos ES.                                   |
| La pelota queda en bucle horizontal casi sin subir   | El ángulo máximo es 60° respecto a la vertical, así que `vy` nunca es casi cero en la paleta.   |

---

## Lo que **no** está en esta spec

- Audio y animaciones de explosión.
- Varios niveles, bloques resistentes y power-ups.
- Pausa, menú de inicio, high scores y persistencia.
- Soporte táctil o móvil.
- Tests automáticos, linter o build.

Cada uno de estos puntos, si se hace, va en su propia spec.
