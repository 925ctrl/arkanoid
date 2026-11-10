import {
  W, H, COLS, ROWS, BRICK_W, BRICK_H, BRICK_TOP, BRICK_COLORS,
  PADDLE_W, PADDLE_H, PADDLE_Y, PADDLE_SPEED, BALL_SIZE, BALL_SPEED,
  MAX_BOUNCE_ANGLE, LIVES, POINTS_PER_BRICK,
} from './config.js';

function clampPaddle(paddle) {
  paddle.x = Math.max(0, Math.min(W - PADDLE_W, paddle.x));
}

// La pelota pegada sigue a la paleta, centrada sobre ella.
function stickBall(state) {
  state.ball.x = state.paddle.x + (PADDLE_W - BALL_SIZE) / 2;
  state.ball.y = state.paddle.y - BALL_SIZE;
}

export function update(state, input, dt) {
  const { paddle } = state;

  if (input.mouseX !== null) {
    paddle.x = input.mouseX - PADDLE_W / 2;
    input.mouseX = null;
  }
  paddle.x += (Number(input.right) - Number(input.left)) * PADDLE_SPEED * dt;
  clampPaddle(paddle);

  if (state.phase === 'ready') {
    stickBall(state);
    if (input.launch) {
      state.phase = 'playing';
      state.ball.vx = 0;
      state.ball.vy = -BALL_SPEED;
    }
  }
  input.launch = false;

  if (state.phase === 'playing') {
    moveBall(state.ball, dt);
    bounceOnPaddle(state.ball, paddle);
    hitBrick(state);
    if (state.bricks.every((b) => !b.alive)) state.phase = 'won';
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

  brick.alive = false;
  state.score += POINTS_PER_BRICK;

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
// punto de impacto; la velocidad se mantiene en BALL_SPEED.
function bounceOnPaddle(ball, paddle) {
  if (ball.vy <= 0) return;
  const overlaps =
    ball.x + BALL_SIZE > paddle.x && ball.x < paddle.x + PADDLE_W &&
    ball.y + BALL_SIZE > paddle.y && ball.y < paddle.y + PADDLE_H;
  if (!overlaps) return;

  const offset = Math.max(-1, Math.min(1,
    (ball.x + BALL_SIZE / 2 - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)));
  const angle = (offset * MAX_BOUNCE_ANGLE * Math.PI) / 180;
  ball.vx = BALL_SPEED * Math.sin(angle);
  ball.vy = -BALL_SPEED * Math.cos(angle);
  ball.y = paddle.y - BALL_SIZE;
}

function moveBall(ball, dt) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x < 0) {
    ball.x = 0;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x > W - BALL_SIZE) {
    ball.x = W - BALL_SIZE;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
  }
}

export function createState() {
  const paddleX = (W - PADDLE_W) / 2;
  const bricks = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({
        x: col * BRICK_W,
        y: BRICK_TOP + row * BRICK_H,
        color: BRICK_COLORS[row],
        alive: true,
      });
    }
  }
  return {
    phase: 'ready',
    score: 0,
    lives: LIVES,
    paddle: { x: paddleX, y: PADDLE_Y },
    ball: {
      x: paddleX + (PADDLE_W - BALL_SIZE) / 2,
      y: PADDLE_Y - BALL_SIZE,
      vx: 0,
      vy: 0,
    },
    bricks,
  };
}
