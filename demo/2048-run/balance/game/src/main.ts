import { Game, renderToText } from './game';

// expose deterministic game on window for tests
declare global { interface Window {
  game: any;
  advanceTime(ms:number): void;
  render_game_to_text(): string;
} }

const game = new Game(1);
(window as any).game = game;

(window as any).setGameSeed = (s:number) => game.setSeed(s);
(window as any).setBoardSeed = (s:number) => { game.setSeed(s); };
(window as any).setPreset = (p:'casual'|'spicy') => { game.setPreset(p); };
(window as any).undo = () => game.undo();
(window as any).setBoard = (b:number[]) => game.setBoard(b);
(window as any).move = (dir:'up'|'down'|'left'|'right') => game.move(dir);
(window as any).render_game_to_text = () => renderToText(game);
(window as any).advanceTime = (ms:number) => { /* deterministic time progression: no-op but kept for API */ };

// keyboard controls
window.addEventListener('keydown', (e) => {
  const map: Record<string, any> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right'
  };
  const k = (e.key.length ===1) ? e.key.toLowerCase() : e.key;
  const dir = (map as any)[k];
  if (dir) {
    const moved = (window as any).move(dir);
    if (moved) render();
  }
});

function render() {
  const out = (window as any).render_game_to_text();
  const el = document.getElementById('render');
  if (el) el.textContent = out;
}

render();

export {};
