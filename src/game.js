import {
  W, H, COLS, BRICK_W, BRICK_H, BRICK_TOP, LEVEL_COLORS, LEVELS_PER_CYCLE,
  PADDLE_W, PADDLE_W_STEP, PADDLE_W_MIN, PADDLE_H, PADDLE_Y, PADDLE_SPEED,
  BALL_SIZE, BALL_SPEED, BALL_SPEED_STEP, BALL_SPEED_MAX, MAX_HITS,
  MAX_BOUNCE_ANGLE, LIVES, POINTS_PER_BRICK,
} from './config.js';

function clampPaddle(paddle) {
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}

// La pelota pegada sigue a la paleta, centrada sobre ella.
function stickBall(state) {
  state.ball.x = state.paddle.x + (state.paddle.w - BALL_SIZE) / 2;
  state.ball.y = state.paddle.y - BALL_SIZE;
}

// Las explosiones avanzan en cualquier fase; EXPLOSION_DURATION es global de assets/spritesheet.js.
function advanceExplosions(bricks, dt) {
  for (const b of bricks) {
    if (b.explodeT === null) continue;
    b.explodeT += dt * 1000;
    if (b.explodeT >= EXPLOSION_DURATION) b.explodeT = null;
  }
}

export function update(state, input, dt) {
  const { paddle } = state;

  advanceExplosions(state.bricks, dt);

  if (input.mouseX !== null) {
    paddle.x = input.mouseX - paddle.w / 2;
    input.mouseX = null;
  }
  paddle.x += (Number(input.right) - Number(input.left)) * PADDLE_SPEED * dt;
  clampPaddle(paddle);

  if (state.phase === 'ready') {
    stickBall(state);
    if (input.launch) {
      state.phase = 'playing';
      state.ball.vx = 0;
      state.ball.vy = -state.ballSpeed;
    }
  }
  input.launch = false;

  if (state.phase === 'playing') {
    moveBall(state.ball, dt, state.sounds);
    bounceOnPaddle(state.ball, paddle, state.ballSpeed, state.sounds);
    hitBrick(state);
    if (state.bricks.every((b) => !b.alive && b.explodeT === null)) state.phase = 'won';
    else if (state.ball.y > H) loseLife(state);
  }
}

function loseLife(state) {
  state.lives -= 1;
  state.ball.vx = 0;
  state.ball.vy = 0;
  if (state.lives > 0) {
    state.phase = 'ready';
    stickBall(state);
  } else {
    state.phase = 'gameover';
  }
}

// Rompe como máximo un bloque por frame y rebota por el eje de menor penetración.
function hitBrick(state) {
  const { ball } = state;
  const brick = state.bricks.find((b) =>
    b.alive &&
    ball.x + BALL_SIZE > b.x && ball.x < b.x + BRICK_W &&
    ball.y + BALL_SIZE > b.y && ball.y < b.y + BRICK_H);
  if (!brick) return;

  brick.hp -= 1;
  if (brick.hp > 0) {
    state.sounds.push('bounce');
  } else {
    brick.alive = false;
    brick.explodeT = 0;
    state.score += POINTS_PER_BRICK;
    state.sounds.push('break');
  }

  const fromLeft = ball.x + BALL_SIZE - brick.x;
  const fromRight = brick.x + BRICK_W - ball.x;
  const fromTop = ball.y + BALL_SIZE - brick.y;
  const fromBottom = brick.y + BRICK_H - ball.y;

  if (Math.min(fromLeft, fromRight) < Math.min(fromTop, fromBottom)) {
    ball.vx = fromLeft < fromRight ? -Math.abs(ball.vx) : Math.abs(ball.vx);
  } else {
    ball.vy = fromTop < fromBottom ? -Math.abs(ball.vy) : Math.abs(ball.vy);
  }
}

// Solo rebota si la pelota baja y solapa la paleta. El ángulo depende del
// punto de impacto; la velocidad se mantiene en ballSpeed.
function bounceOnPaddle(ball, paddle, ballSpeed, sounds) {
  if (ball.vy <= 0) return;
  const overlaps =
    ball.x + BALL_SIZE > paddle.x && ball.x < paddle.x + paddle.w &&
    ball.y + BALL_SIZE > paddle.y && ball.y < paddle.y + PADDLE_H;
  if (!overlaps) return;

  const offset = Math.max(-1, Math.min(1,
    (ball.x + BALL_SIZE / 2 - (paddle.x + paddle.w / 2)) / (paddle.w / 2)));
  const angle = (offset * MAX_BOUNCE_ANGLE * Math.PI) / 180;
  ball.vx = ballSpeed * Math.sin(angle);
  ball.vy = -ballSpeed * Math.cos(angle);
  ball.y = paddle.y - BALL_SIZE;
  sounds.push('bounce');
}

function moveBall(ball, dt, sounds) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x < 0) {
    ball.x = 0;
    ball.vx = Math.abs(ball.vx);
    sounds.push('bounce');
  } else if (ball.x > W - BALL_SIZE) {
    ball.x = W - BALL_SIZE;
    ball.vx = -Math.abs(ball.vx);
    sounds.push('bounce');
  }
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
    sounds.push('bounce');
  }
}

// Rellena el nivel (desde 1) conservando puntos y vidas. La fila más nueva va arriba.
export function loadLevel(state, level) {
  const rows = ((level - 1) % LEVELS_PER_CYCLE) + 1;
  const cycle = Math.floor((level - 1) / LEVELS_PER_CYCLE) + 1;
  const hits = Math.min(cycle, MAX_HITS);
  const bricks = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({
        x: col * BRICK_W,
        y: BRICK_TOP + row * BRICK_H,
        color: LEVEL_COLORS[rows - 1 - row],
        alive: true,
        explodeT: null,
        hp: hits,
      });
    }
  }
  state.level = level;
  state.hits = hits;
  state.bricks = bricks;
  state.ballSpeed = Math.min(BALL_SPEED_MAX, BALL_SPEED + BALL_SPEED_STEP * (cycle - 1));
  state.paddle.w = Math.max(PADDLE_W_MIN, PADDLE_W - PADDLE_W_STEP * (cycle - 1));
  state.paddle.x = (W - state.paddle.w) / 2;
  state.phase = 'ready';
  stickBall(state);
}

export function createState() {
  const state = {
    phase: 'ready',
    level: 1,
    score: 0,
    lives: LIVES,
    paddle: { x: 0, y: PADDLE_Y, w: PADDLE_W },
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
    bricks: [],
    hits: 1,
    ballSpeed: BALL_SPEED,
    sounds: [], // cola de sonidos del frame; la vacía main.js
  };
  loadLevel(state, 1);
  return state;
}
