import {
  W, H, BRICK_TOP, BRICK_W, BRICK_H, PADDLE_H, BALL_SIZE, MUTE_BTN,
} from './config.js';

export function render(ctx, state, muted) {
  ctx.clearRect(0, 0, W, H);

  for (const b of state.bricks) {
    if (!b.alive) continue;
    drawSprite(ctx, `block_${b.color}`, b.x, b.y, BRICK_W, BRICK_H);
    if (b.hp < state.hits) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * (1 - b.hp / state.hits)})`;
      ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
    }
  }
  // 4 frames iguales durante EXPLOSION_DURATION (globales de assets/spritesheet.js).
  for (const b of state.bricks) {
    if (b.explodeT === null) continue;
    const frame = Math.min(3, Math.floor(b.explodeT / (EXPLOSION_DURATION / 4)));
    drawFrame(ctx, EXPLOSION_FRAMES[b.color][frame], b.x, b.y, BRICK_W, BRICK_H);
  }
  drawSprite(ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.w, PADDLE_H);
  drawSprite(ctx, 'ball', state.ball.x, state.ball.y, BALL_SIZE, BALL_SIZE);

  // HUD en la franja superior (y < BRICK_TOP)
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(`Puntos: ${state.score}`, 16, 56);
  ctx.textAlign = 'center';
  ctx.fillText(`Nivel ${state.level}`, W / 2, 56);
  ctx.fillText(muted ? '🔇' : '🔊', MUTE_BTN.x + MUTE_BTN.w / 2, MUTE_BTN.y + MUTE_BTN.h / 2);
  ctx.textAlign = 'left';
  for (let i = 0; i < state.lives; i++) {
    const x = W - 16 - (i + 1) * BALL_SIZE - i * 6;
    drawSprite(ctx, 'ball', x, (BRICK_TOP - BALL_SIZE) / 2, BALL_SIZE, BALL_SIZE);
  }

  if (state.phase === 'gameover' || state.phase === 'cleared') {
    const cleared = state.phase === 'cleared';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '48px monospace';
    ctx.fillText(cleared ? `Nivel ${state.level} superado` : 'Game Over', W / 2, H / 2 - 20);
    ctx.font = '20px monospace';
    ctx.fillText(cleared ? 'Clic, Espacio o Enter para continuar' : 'Clic, Espacio o Enter para reiniciar', W / 2, H / 2 + 30);
  }
}
