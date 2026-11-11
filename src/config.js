export const W = 800, H = 600;           // resolución lógica del canvas
export const COLS = 25;                  // COLS * BRICK_W = W
export const BRICK_W = 32, BRICK_H = 16;
export const BRICK_TOP = 80;             // y de la primera fila (deja sitio al HUD)
// Color de cada fila por orden de aparición (nombres del spritesheet; el color visible va debajo).
export const LEVEL_COLORS = ['green', 'hotpink', 'magenta', 'cyan', 'yellow', 'red', 'gray'];
//                           azul     naranja    morado     verde   amarillo  rojo   gris
export const LEVELS_PER_CYCLE = LEVEL_COLORS.length;
export const MAX_HITS = 5;               // tope de golpes por bloque
export const PADDLE_W = 162, PADDLE_W_STEP = 10, PADDLE_W_MIN = 70, PADDLE_H = 14, PADDLE_Y = 560;
export const BALL_SIZE = 16;
export const BALL_SPEED = 360, BALL_SPEED_STEP = 10, BALL_SPEED_MAX = 480; // px/s, base del ciclo 1
export const PADDLE_SPEED = 480;         // px/s con teclado
export const MAX_BOUNCE_ANGLE = 60;      // grados respecto a la vertical
export const LIVES = 3;
export const POINTS_PER_BRICK = 5;
export const MUTE_BTN = { x: 12, y: 4, w: 32, h: 28 }; // zona clicable del botón de silencio (coordenadas lógicas)
