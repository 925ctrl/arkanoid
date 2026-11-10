import { W, H, BRICK_TOP, BRICK_W, BRICK_H, PADDLE_W, PADDLE_H, BALL_SIZE } from './config.js';

export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);

  for (const b of state.bricks) {
    if (b.alive) drawSprite(ctx, `block_${b.color}`, b.x, b.y, BRICK_W, BRICK_H);
  }
  drawSprite(ctx, 'paddle', state.paddle.x, state.paddle.y, PADDLE_W, PADDLE_H);
  drawSprite(ctx, 'ball', state.ball.x, state.ball.y, BALL_SIZE, BALL_SIZE);

  // HUD en la franja superior (y < BRICK_TOP)
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(`Puntos: ${state.score}`, 16, BRICK_TOP / 2);
  ctx.textAlign = 'right';
  ctx.fillText(`Vidas: ${state.lives}`, W - 16, BRICK_TOP / 2);

  if (state.phase === 'gameover' || state.phase === 'won') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '48px monospace';
    ctx.fillText(state.phase === 'won' ? 'Has ganado' : 'Game Over', W / 2, H / 2 - 20);
    ctx.font = '20px monospace';
    ctx.fillText('Clic, Espacio o Enter para reiniciar', W / 2, H / 2 + 30);
  }
}
