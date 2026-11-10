import { createState, update } from './game.js';
import { createInput } from './input.js';
import { render } from './render.js';
import { createAudio } from './audio.js';

const MAX_DT = 1 / 30; // evita saltos tras una pausa de pestaña

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const input = createInput(canvas);
const audio = createAudio(); // se usa a partir del paso 2
let state = createState();
let last = 0;

function frame(now) {
  const dt = Math.min((now - last) / 1000, MAX_DT);
  last = now;
  if (state.phase === 'gameover' || state.phase === 'won') {
    if (input.restart) {
      state = createState();
      input.launch = false; // el mismo clic/Espacio no debe lanzar la pelota
    }
  }
  input.restart = false;
  update(state, input, dt);
  render(ctx, state);
  requestAnimationFrame(frame);
}

loadSpritesheet(() => {
  requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });
});
