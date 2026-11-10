import { W, H, MUTE_BTN } from './config.js';

// Estado de entrada compartido. `mouseX` (coordenada lógica), `launch`,
// `restart` y `toggleMute` son eventos pendientes: quien los procesa debe
// ponerlos a null / false.
export function createInput(canvas) {
  const input = {
    left: false, right: false, mouseX: null,
    launch: false, restart: false, toggleMute: false,
  };

  const LEFT = new Set(['ArrowLeft', 'KeyA']);
  const RIGHT = new Set(['ArrowRight', 'KeyD']);

  window.addEventListener('keydown', (e) => {
    if (LEFT.has(e.code)) input.left = true;
    else if (RIGHT.has(e.code)) input.right = true;
    else if (e.code === 'Space') {
      input.launch = true;
      input.restart = true;
    } else if (e.code === 'Enter') input.restart = true;
    else if (e.code === 'KeyM') {
      if (!e.repeat) input.toggleMute = true;
    } else return;
    if (e.code !== 'Enter') e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    if (LEFT.has(e.code)) input.left = false;
    else if (RIGHT.has(e.code)) input.right = false;
  });

  // Se convierte de píxeles CSS a coordenadas lógicas (el canvas se escala por CSS).
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - rect.left) * W) / rect.width;
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * W) / rect.width;
    const y = ((e.clientY - rect.top) * H) / rect.height;
    if (x >= MUTE_BTN.x && x <= MUTE_BTN.x + MUTE_BTN.w &&
        y >= MUTE_BTN.y && y <= MUTE_BTN.y + MUTE_BTN.h) {
      input.toggleMute = true; // el clic en el botón no lanza ni reinicia
      return;
    }
    input.launch = true;
    input.restart = true;
  });

  return input;
}
