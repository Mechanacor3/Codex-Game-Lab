import { Game, renderToText } from './game';

// expose deterministic game on window for tests
declare global { interface Window {
  game: any;
  advanceTime(ms:number): void;
  render_game_to_text(): string;
} }

let game = new Game(1);
(window as any).game = game;

// UI state
let reducedMotion = false;
let highContrast = false;

(window as any).setReducedMotion = (v:boolean) => { reducedMotion = v; document.documentElement.classList.toggle('reduced-motion', !!v); };
(window as any).setHighContrast = (v:boolean) => { highContrast = v; document.documentElement.classList.toggle('high-contrast', !!v); };

(window as any).setGameSeed = (s:number) => { ((window as any).game as Game).setSeed(s); };
(window as any).setBoardSeed = (s:number) => { ((window as any).game as Game).setSeed(s); };
(window as any).setPreset = (p:'casual'|'spicy') => { ((window as any).game as Game).setPreset(p); };
(window as any).undo = () => ((window as any).game as Game).undo();
(window as any).setBoard = (b:number[]) => ((window as any).game as Game).setBoard(b);
(window as any).move = (dir:'up'|'down'|'left'|'right') => ((window as any).game as Game).move(dir);
(window as any).render_game_to_text = () => renderToText((window as any).game as Game);
(window as any).advanceTime = (ms:number) => { /* deterministic time progression: no-op but kept for API */ };

// minimal DOM build for polished UI while keeping deterministic hooks
function buildUI() {
  const app = document.getElementById('app')!;
  app.innerHTML = '';
  const controls = document.createElement('div'); controls.className = 'controls';
  controls.innerHTML = `
    <button id="restart" class="btn">Restart</button>
    <label class="tog"> <input id="hc" type="checkbox"> High contrast</label>
    <label class="tog"> <input id="rm" type="checkbox"> Reduced motion</label>
  `;
  app.appendChild(controls);

  const boardWrap = document.createElement('div'); boardWrap.style.position='relative';
  const board = document.createElement('div'); board.className = 'board'; board.id='board';
  // grid background cells
  for (let i=0;i<16;i++){ const c = document.createElement('div'); c.className='cell'; c.dataset.index=String(i); board.appendChild(c); }
  boardWrap.appendChild(board);
  app.appendChild(boardWrap);

  // overlays
  const overlay = document.createElement('div'); overlay.id='overlay'; overlay.style.display='none'; overlay.className='overlay'; boardWrap.appendChild(overlay);

  // hooks
  (document.getElementById('restart')!).addEventListener('click', ()=>{ resetGame(); });
  (document.getElementById('hc') as HTMLInputElement).addEventListener('change', (e)=>{ const v=(e.target as HTMLInputElement).checked; (window as any).setHighContrast(v); });
  (document.getElementById('rm') as HTMLInputElement).addEventListener('change', (e)=>{ const v=(e.target as HTMLInputElement).checked; (window as any).setReducedMotion(v); });

  // touch handlers for swipe (mobile)
  let startX = 0, startY = 0;
  board.addEventListener('touchstart', (ev)=>{ const t = ev.touches[0]; startX = t.clientX; startY = t.clientY; });
  board.addEventListener('touchend', (ev)=>{
    const t = ev.changedTouches[0]; const dx = t.clientX - startX; const dy = t.clientY - startY;
    if (Math.hypot(dx,dy) < 20) return;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx>0 ? 'right' : 'left') : (dy>0 ? 'down' : 'up');
    const moved = (window as any).move(dir);
    if (moved) render();
  });
}

// initialize UI after DOM ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>{ buildUI(); render(); });
else { buildUI(); render(); }

function resetGame(){
  // re-create deterministic game with same seed
  (window as any).game = new Game(1);
  // keep reference
  render();
}

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
  // text render preserved for tests
  const out = (window as any).render_game_to_text();
  const el = document.getElementById('render');
  if (el) el.textContent = out;

  // visual render: map tiles to absolute-positioned divs
  const board = document.getElementById('board');
  if (!board) return;
  // clear existing tiles
  const existing = board.querySelectorAll('.tile'); existing.forEach(n=>n.remove());
  const g = (window as any).game as Game;
  for (let i=0;i<16;i++){
    const v = g.board[i]; if (v===0) continue;
    const r = Math.floor(i/4), c = i%4;
    const tile = document.createElement('div'); tile.className='tile'; tile.textContent=String(v);
    // set color based on value (tiny mapping)
    tile.style.left = `${8 + c*(100+8)}px`; tile.style.top = `${8 + r*(100+8)}px`;
    tile.style.width='100px'; tile.style.height='100px';
    tile.style.fontSize = v>=1024? '18px' : '24px';
    tile.style.background = v===2? '#eee4da' : v===4? '#ede0c8' : '#f2b179';
    board.appendChild(tile);
  }

  // overlays on win/loss
  const overlay = document.getElementById('overlay')!;
  if (g.state === 'won') { overlay.style.display='flex'; overlay.innerHTML = `<div>You won!<div><button id="ov-restart" class="btn">Restart</button></div></div>`; (document.getElementById('ov-restart')!).addEventListener('click', resetGame); }
  else if (g.state === 'lost') { overlay.style.display='flex'; overlay.innerHTML = `<div>Game Over<div><button id="ov-restart2" class="btn">Restart</button></div></div>`; (document.getElementById('ov-restart2')!).addEventListener('click', resetGame); }
  else overlay.style.display='none';
}

render();

export {};
