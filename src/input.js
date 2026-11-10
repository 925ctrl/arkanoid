import { W } from './config.js';

// Estado de entrada compartido. `mouseX` (coordenada lógica), `launch` y
// `restart` son eventos pendientes: quien los procesa debe ponerlos a null / false.
export function createInput(canvas) {
  const input = { left: false, right: false, mouseX: null, launch: false, restart: false };

  const LEFT = new Set(['ArrowLeft', 'KeyA']);
  const RIGHT = new Set(['ArrowRight', 'KeyD']);

  window.addEventListener('keydown', (e) => {
    if (LEFT.has(e.code)) input.left = true;
    else if (RIGHT.has(e.code)) input.right = true;
    else if (e.code === 'Space') {
      input.launch = true;
      input.restart = true;
    } else if (e.code === 'Enter') input.restart = true;
    else return;
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

  canvas.addEventListener('mousedown', () => {
    input.launch = true;
    input.restart = true;
  });

  return input;
}
