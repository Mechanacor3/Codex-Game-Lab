import Game from './game';

const g = new Game();
// attach to window for tests
const anyw: any = window as any;
anyw.game = g;
anyw.setSeed = (s: number) => { g.setSeed(s); };
anyw.setBoard = (b: number[][]) => { g.setBoard(b); render(); };
anyw.render_game_to_text = () => g.render_game_to_text();
anyw.advanceTime = (ms: number) => { g.advanceTime(ms); render(); };

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
  if (dir) {
    ev.preventDefault();
    const changed = g.move(dir);
    // If moved, we may need to advance scheduled spawn immediately in normal usage
    // but keep deterministic hook: scheduled spawn runs when advanceTime called.
    render();
  }
});

// initial render
render();
