# SPEC 03 — Sonidos de rebote y rotura de bloques

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-10
> **Objetivo:** Reproducir `ball-bounce.mp3` en cada rebote contra paleta, paredes o techo y `break-sound.mp3` al romper un bloque, con silencio alternable (tecla M o botón en el HUD) que se recuerda entre sesiones.

---

## Alcance

**Dentro:**

- `assets/sounds/ball-bounce.mp3` suena cuando la pelota rebota en la paleta, en las paredes laterales o en el techo.
- `assets/sounds/break-sound.mp3` suena al romper un bloque. En ese golpe no suena el rebote.
- Los sonidos se pueden solapar: si se rompen dos bloques seguidos, suenan los dos completos.
- Silencio alternable con la tecla `M` y con un botón dibujado en el canvas, en la esquina superior izquierda, encima del texto de puntos.
- El botón muestra `🔊` si hay sonido y `🔇` si está silenciado.
- El estado de silencio se guarda en `localStorage` con la clave `arkanoid:muted` y se restaura al cargar.
- Hacer clic en el botón de silencio no lanza la pelota ni reinicia la partida.
- Si el navegador bloquea o falla la reproducción, el juego sigue sin errores en la consola.

**Fuera de alcance (para futuras specs):**

- Control de volumen (deslizador o niveles). Solo hay sonido o silencio.
- Música de fondo u otros efectos (perder vida, game over, victoria). No hay audio para ellos en `assets/`.
- Sonido distinto para el golpe a un bloque resistente que no se rompe (lo decide la SPEC 04).
- Web Audio API, audio posicional o variación de tono.

---

## Modelo de datos

```js
// src/audio.js — nuevo módulo, único que toca HTMLAudioElement y localStorage
export const MUTE_KEY = 'arkanoid:muted';   // valor '1' (silenciado) o '0'
export function createAudio() {
  return {
    muted,            // boolean, leído de localStorage al crear (false si no hay valor o falla)
    play(name),       // name: 'bounce' | 'break'; no hace nada si muted
    toggleMute(),     // invierte muted y lo guarda en localStorage
  };
}

// src/game.js — estado: cola de sonidos que produce update()
state.sounds = [];   // p. ej. ['bounce', 'break']; main.js la vacía en cada frame

// src/input.js — nuevo evento pendiente
input.toggleMute = false;   // true al pulsar M o hacer clic en el botón

// src/config.js
export const MUTE_BTN = { x: 12, y: 4, w: 32, h: 28 };   // zona clicable del botón (coordenadas lógicas)
```

Convenciones:

- `game.js` sigue sin tocar el DOM: solo añade nombres a `state.sounds`, y `main.js` los pasa a `audio.play`.
- `play(name)` reproduce un clon del `Audio` precargado (`cloneNode().play()`) para que los sonidos se solapen. La promesa rechazada se ignora con `.catch(() => {})`.
- Las lecturas y escrituras de `localStorage` van dentro de `try/catch`; si fallan, el silencio funciona solo en memoria.
- HUD: el botón ocupa `MUTE_BTN` y el texto de puntos baja a `y = 56` (sigue dentro de la franja `y < BRICK_TOP`).

---

## Plan de implementación

1. Crear `src/audio.js` con `createAudio()` (precarga ambos `Audio`, lee `arkanoid:muted`, implementa `play` y `toggleMute`). En `src/main.js`, crear la instancia. Prueba manual: el juego carga igual y sin errores; `audio.play('break')` en consola suena.
2. En `src/game.js`, añadir `sounds: []` en `createState()` y meter `'bounce'` en `moveBall` (paredes/techo) y en `bounceOnPaddle`, y `'break'` en `hitBrick`. Pasar `state` a `moveBall` y a `bounceOnPaddle`, o devolver un booleano de rebote, según convenga. En `main.js`, después de `update`, reproducir y vaciar `state.sounds`. Prueba manual: se oyen los rebotes en paleta, paredes y techo, y la rotura de cada bloque.
3. En `src/input.js`, tecla `KeyM` → `input.toggleMute = true`. En `mousedown`, si el punto lógico cae dentro de `MUTE_BTN`, poner `toggleMute = true` **sin** activar `launch` ni `restart`. En `main.js`, consumir `toggleMute` llamando a `audio.toggleMute()`. Prueba manual: M silencia y reactiva el sonido.
4. En `src/render.js`, aceptar `render(ctx, state, muted)`, dibujar `🔊`/`🔇` dentro de `MUTE_BTN` y mover el texto de puntos a `y = 56`. Prueba manual: el icono cambia al pulsar M o al hacer clic en él, el clic no lanza la pelota y tras recargar se conserva el estado.

---

## Criterios de aceptación

- [ ] Con `python3 -m http.server`, el juego carga sin errores ni avisos en la consola.
- [ ] Al rebotar la pelota en la paleta suena `ball-bounce.mp3`.
- [ ] Al rebotar en la pared izquierda, en la derecha y en el techo suena `ball-bounce.mp3`.
- [ ] Al romper un bloque suena `break-sound.mp3` y no suena `ball-bounce.mp3` en ese mismo golpe.
- [ ] Romper dos bloques en menos de 200 ms reproduce dos sonidos de rotura solapados (el segundo no corta al primero).
- [ ] Ningún sonido se reproduce mientras la pelota está pegada a la paleta en fase `ready`.
- [ ] Pulsar `M` alterna entre silencio y sonido, y el icono del HUD cambia entre `🔇` y `🔊`.
- [ ] Hacer clic en el icono alterna el silencio y no lanza la pelota ni reinicia la partida desde «Game Over» o «Has ganado».
- [ ] Con el silencio activo no suena nada.
- [ ] Tras recargar la página, el estado de silencio es el mismo que antes de recargar.
- [ ] El icono queda encima del texto de puntos, sin solaparse con él ni con la primera fila de bloques.
- [ ] Con `localStorage` bloqueado (p. ej. con las cookies deshabilitadas), el juego funciona y el silencio se puede alternar.
- [ ] No se añade ninguna dependencia ni paso de build.

---

## Decisiones

- **Sí:** el rebote suena en paleta, paredes y techo, y la rotura de bloque solo con `break-sound.mp3`. Así cada golpe tiene un único sonido.
- **No:** sonar rebote y rotura a la vez al romper un bloque. Se solapan dos sonidos para un solo evento.
- **Sí:** cola `state.sounds` que vacía `main.js`. `game.js` sigue siendo lógica pura, sin DOM, como en las SPEC 01 y 02.
- **No:** llamar a `audio.play` directamente desde `game.js`. Acopla la lógica al navegador.
- **Sí:** `HTMLAudioElement` + `cloneNode()` por reproducción. Basta para dos efectos cortos y permite solaparlos.
- **No:** Web Audio API. Más código (decodificar buffers, contexto) sin beneficio para dos sonidos.
- **Sí:** silencio con `M` y botón en el canvas, persistido en `localStorage` (`arkanoid:muted`). Lo pidió el usuario.
- **Sí:** botón dibujado en el canvas, no `<button>` HTML. Comparte el sistema de coordenadas lógicas y escala con el juego sin alinear nada con CSS.
- **No:** control de volumen. Fuera de lo pedido.
- **Sí:** errores de reproducción ignorados en silencio. La política de autoplay puede rechazar el primer `play()`; el juego no debe romperse por audio.

---

## Riesgos

| Riesgo                                                                 | Mitigación                                                                                                        |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| La política de autoplay bloquea el sonido                              | El primer sonido llega tras lanzar la pelota (clic o Espacio, gesto del usuario). `play().catch(() => {})` evita errores. |
| Muchos clones de `Audio` en rebotes rápidos                            | Los clones se liberan al terminar; a 360 px/s hay como mucho unos pocos rebotes por segundo.                      |
| El emoji `🔊`/`🔇` se ve distinto según el sistema operativo            | Aceptado: es solo un indicador; la zona clicable `MUTE_BTN` no depende de cómo se dibuje.                          |
| `localStorage` lanza excepción (modo privado, cookies bloqueadas)       | Acceso dentro de `try/catch`; el silencio funciona en memoria durante la sesión.                                  |

---

## Lo que **no** está en esta spec

- Control de volumen, música de fondo y sonidos de vida perdida, game over o victoria.
- Sonido del golpe a un bloque resistente (SPEC 04).
- Web Audio API o efectos de audio avanzados.

Cada uno de estos puntos, si se hace, va en su propia spec.
