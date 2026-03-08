import Game from './game';

const g = new Game();
// attach to window for tests
const anyw: any = window as any;
anyw.game = g;
anyw.setSeed = (s: number) => { g.setSeed(s); };
anyw.setBoardSeed = (s: number) => { g.setSeed(s); };
anyw.setBoard = (b: number[][]) => { g.setBoard(b); render(); };
anyw.render_game_to_text = () => g.render_game_to_text();
anyw.advanceTime = (ms: number) => { g.advanceTime(ms); render(); };
anyw.setPreset = (p: 'casual' | 'spicy') => { g.setPreset(p); render(); };
anyw.undo = () => { const ok = g.undo(); render(); return ok; };

function render() {
  const el = document.getElementById('render');
  if (el) el.textContent = anyw.render_game_to_text();
}

// map keys
window.addEventListener('keydown', (ev) => {
  const key = ev.key;
  let dir: any = null;
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') dir = 'left';
  if (key === 'ArrowRight' || key === 'd' || key === 'D') dir = 'right';
  if (key === 'ArrowUp' || key === 'w' || key === 'W') dir = 'up';
  if (key === 'ArrowDown' || key === 's' || key === 'S') dir = 'down';
  if (key === 'u' || key === 'U') {
    ev.preventDefault();
    g.undo();
    render();
    return;
  }
  if (dir) {
    ev.preventDefault();
    const changed = g.move(dir);
    render();
  }
});

// initial render
render();
