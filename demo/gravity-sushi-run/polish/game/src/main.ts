import Game from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const game = new Game();

// UI bindings (overlays, toggles, touch)
const startOverlay = document.getElementById('overlay-start')!;
const gameoverOverlay = document.getElementById('overlay-gameover')!;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement | null;
const btnRestart = document.getElementById('btn-restart') as HTMLButtonElement | null;
const toggleReduced = document.getElementById('toggle-reduced') as HTMLInputElement | null;
const toggleContrast = document.getElementById('toggle-contrast') as HTMLInputElement | null;
const canvasEl = document.getElementById('game') as HTMLCanvasElement;

function showStartOverlay() {
  startOverlay?.setAttribute('aria-hidden', 'false');
  (startOverlay as HTMLElement).style.pointerEvents = 'auto';
}
function hideStartOverlay() {
  startOverlay?.setAttribute('aria-hidden', 'true');
  (startOverlay as HTMLElement).style.pointerEvents = 'none';
}
function showGameoverOverlay() {
  gameoverOverlay?.setAttribute('aria-hidden', 'false');
  (gameoverOverlay as HTMLElement).style.pointerEvents = 'auto';
}
function hideGameoverOverlay() {
  gameoverOverlay?.setAttribute('aria-hidden', 'true');
  (gameoverOverlay as HTMLElement).style.pointerEvents = 'none';
}

// Start overlay visible initially but keep game state for tests unchanged
showStartOverlay();

btnStart?.addEventListener('click', () => {
  hideStartOverlay();
  // focus canvas for keyboard play
  canvasEl.focus?.();
});
btnRestart?.addEventListener('click', () => {
  // reset game state without changing core logic
  game.setStateForTest({ timeRemaining: 60000, score: 0, pieces: [], plateX: game.width/2, state: 'playing' });
  hideGameoverOverlay();
  hideStartOverlay();
  game.renderToCanvas(ctx);
});

toggleReduced?.addEventListener('change', () => { game.reduceMotion = !!toggleReduced.checked; });
toggleContrast?.addEventListener('change', () => { game.highContrast = !!toggleContrast.checked; game.renderToCanvas(ctx); });

// touch / pointer controls: drag to move, tap to drop
let pointerDown = false;
let pointerStartX = 0;
let pointerMoved = false;
let pointerDownTime = 0;
canvasEl.addEventListener('pointerdown', (ev) => {
  if (game.state !== 'playing') return;
  pointerDown = true;
  pointerStartX = ev.clientX - canvasEl.getBoundingClientRect().left;
  pointerMoved = false;
  pointerDownTime = performance.now();
  // capture so we receive moves
  (ev.target as Element).setPointerCapture((ev as any).pointerId);
});
canvasEl.addEventListener('pointermove', (ev) => {
  if (!pointerDown) return;
  const x = ev.clientX - canvasEl.getBoundingClientRect().left;
  if (Math.abs(x - pointerStartX) > 4) pointerMoved = true;
  game.plateX = Math.max(20, Math.min(game.width - 20, x));
  game.renderToCanvas(ctx);
});
canvasEl.addEventListener('pointerup', (ev) => {
  if (!pointerDown) return;
  pointerDown = false;
  const dt = performance.now() - pointerDownTime;
  // treat as tap if not moved much and short press
  if (!pointerMoved && dt < 350) {
    game.drop();
  }
  game.renderToCanvas(ctx);
});

// expose deterministic API
// advanceTime(ms)
(window as any).advanceTime = (ms: number) => {
  // allow stepping in fixed substeps for determinism
  const step = 50;
  let remain = Math.max(0, ms | 0);
  while (remain > 0 && (window as any).game && game.state === 'playing') {
    const s = Math.min(step, remain);
    game.step(s);
    remain -= s;
  }
  if (remain > 0) game.step(remain);
  game.renderToCanvas(ctx);
};

(window as any).render_game_to_text = () => game.render_text();
(window as any).setDropSeed = (s: number) => game.setDropSeed(s);
(window as any).setStateForTest = (o: any) => game.setStateForTest(o);
(window as any).drop = () => { game.drop(); game.renderToCanvas(ctx); };
(window as any).setPlateX = (x: number) => { game.plateX = x; game.renderToCanvas(ctx); };

// keyboard controls for interactive play
window.addEventListener('keydown', (e) => {
  if (game.state !== 'playing') return;
  if (e.key === 'ArrowLeft') { game.plateX = Math.max(20, game.plateX - game.plateSpeed / 10); }
  if (e.key === 'ArrowRight') { game.plateX = Math.min(game.width-20, game.plateX + game.plateSpeed / 10); }
  if (e.key === ' ') { game.drop(); }
  game.renderToCanvas(ctx);
});

// initial render
game.renderToCanvas(ctx);

// animate timer for visual mode (runs at 60fps) if not driven by tests
let last = performance.now();
function raf(now = performance.now()) {
  const dt = now - last; last = now;
  // In demo mode update visual clock and decrement timer only (don't call game.step to avoid
  // changing gameplay balance in non-test/demo runs). We still advance `animTime` so
  // wobble/squish visuals are deterministic and can be captured by tests.
  if (game.state === 'playing') {
    const adv = Math.min(50, dt);
    // advance visual clock used by render for deterministic wobble
    (game as any).animTime = ((game as any).animTime || 0) + adv;
    // decrement timer as before
    game.timeRemaining = Math.max(0, game.timeRemaining - adv);
    if (game.timeRemaining === 0) game.state = 'game_over';
  }
  game.renderToCanvas(ctx);
  // overlays: show gameover overlay when appropriate (but allow tests to interact programmatically)
  if (game.state === 'game_over') showGameoverOverlay();
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// expose internal game for debugging
(window as any).game = game;
