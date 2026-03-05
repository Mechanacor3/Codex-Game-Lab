import Game from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const game = new Game();

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
  // Only decrement real time when playing and not in a test-driven environment
  if (game.state === 'playing') {
    // do small step but don't call game.step here to keep determinism in tests. We will decrement timer slowly for demo.
    // For demo mode, advance by actual dt but cap to avoid large jumps.
    const adv = Math.min(50, dt);
    game.timeRemaining = Math.max(0, game.timeRemaining - adv);
    if (game.timeRemaining === 0) game.state = 'game_over';
  }
  game.renderToCanvas(ctx);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// expose internal game for debugging
(window as any).game = game;
