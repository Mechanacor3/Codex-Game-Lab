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

// We'll override window.move below to add animation handling while preserving return value
// keep render_game_to_text and advanceTime hooks
(window as any).render_game_to_text = () => renderToText((window as any).game as Game);
(window as any).advanceTime = (ms:number) => { /* will be replaced by animator below */ };

// Animator: virtual-time driven, so tests can call window.advanceTime(ms)
class Animator {
  duration = 180; // ms for slide
  time = 0;
  running = false;
  dir: 'up'|'down'|'left'|'right' = 'left';
  clones: HTMLElement[] = [];
  mergedIdx = new Set<number>();
  boardEl: HTMLElement | null = null;

  start(dir:'up'|'down'|'left'|'right', preTiles: {idx:number,value:number,left:number,top:number}[], mergedIdx:number[]) {
    if (reducedMotion) return this.finishImmediately();
    this.dir = dir;
    this.time = 0; this.running = true;
    this.mergedIdx = new Set(mergedIdx);
    this.boardEl = document.getElementById('board');
    // create clones positioned at pre positions
    this.clearClones();
    for (const t of preTiles) {
      const el = document.createElement('div'); el.className = 'tile anim-clone'; el.textContent = String(t.value);
      el.style.left = `${t.left}px`;
      el.style.top = `${t.top}px`;
      el.style.width = '100px'; el.style.height = '100px';
      el.style.position = 'absolute'; el.style.transform = 'translate(0,0)'; el.style.zIndex = '5';
      (this.boardEl as HTMLElement).appendChild(el);
      this.clones.push(el);
    }
    // initial render ensures final tiles are present but hidden; caller should set final tiles hidden before calling start
  }

  advance(ms:number) {
    if (!this.running) return;
    this.time += ms;
    const p = Math.min(1, this.time / this.duration);
    // compute offset based on dir
    const offset = Math.round(40 * (1 - (1 - p)*(1 - p))); // ease-out curve
    const dx = (this.dir === 'left') ? -offset : (this.dir === 'right') ? offset : 0;
    const dy = (this.dir === 'up') ? -offset : (this.dir === 'down') ? offset : 0;
    for (const el of this.clones) {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.opacity = String(1 - p);
    }
    if (this.time >= this.duration) this.finish();
  }

  finish() {
    this.clearClones();
    this.running = false;
    // reveal final tiles with pop on merged indices
    const board = document.getElementById('board');
    if (!board) return;
    const tiles = board.querySelectorAll('.tile');
    tiles.forEach((t, i)=>{
      const el = t as HTMLElement;
      el.style.opacity = '1';
      // apply pop if this index was marked merged
      const idx = Number(el.dataset['index'] ?? -1);
      if (this.mergedIdx.has(idx)) {
        el.classList.add('pop');
        setTimeout(()=> el.classList.remove('pop'), 220);
      }
    });
  }

  finishImmediately() { this.clearClones(); this.running = false; const board = document.getElementById('board'); if (!board) return; const tiles = board.querySelectorAll('.tile'); tiles.forEach(t=> (t as HTMLElement).style.opacity='1'); }

  clearClones() { for (const c of this.clones) c.remove(); this.clones = []; }
}

const animator = new Animator();
// wire advanceTime to animator
(window as any).advanceTime = (ms:number) => { animator.advance(ms); render(); };

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

// wrapper move that captures pre-state, calls game.move, then orchestrates animation
(window as any).move = (dir:'up'|'down'|'left'|'right') => {
  const g = (window as any).game as Game;
  if (!g) return false;
  if (g.state !== 'playing') return false;
  // capture pre-board
  const pre = g.cloneBoard();
  // compute pre tile positions
  const preTiles: {idx:number,value:number,left:number,top:number}[] = [];
  for (let i=0;i<16;i++){
    const v = pre[i]; if (v===0) continue;
    const r = Math.floor(i/4), c = i%4;
    const left = 8 + c*(100+8);
    const top = 8 + r*(100+8);
    preTiles.push({idx:i,value:v,left,top});
  }
  const moved = g.move(dir);
  // after move, compute merged indices by simple per-index increase detection
  const post = g.cloneBoard();
  const mergedIdx: number[] = [];
  for (let i=0;i<16;i++){
    const before = pre[i] || 0; const after = post[i] || 0;
    if (after > before) mergedIdx.push(i);
  }
  if (moved) {
    // render final board but hide tiles until animation finishes
    render(true);
    // start animator (unless reduced motion)
    animator.start(dir, preTiles, mergedIdx);
    if (reducedMotion) animator.finish();
  }
  return moved;
};

function render(hideTiles=false) {
  // text render preserved for tests
  const out = (window as any).render_game_to_text();
  const el = document.getElementById('render');
  if (el) el.textContent = out;

  // visual render: map tiles to absolute-positioned divs
  const board = document.getElementById('board');
  if (!board) return;
  // clear existing final tiles (but keep clones if animator running)
  const existing = board.querySelectorAll('.tile'); existing.forEach(n=>{
    if ((n as HTMLElement).classList.contains('anim-clone')) return; // leave clones
    n.remove();
  });
  const g = (window as any).game as Game;
  for (let i=0;i<16;i++){
    const v = g.board[i]; if (v===0) continue;
    const r = Math.floor(i/4), c = i%4;
    const tile = document.createElement('div'); tile.className='tile'; tile.textContent=String(v);
    tile.dataset.index = String(i);
    // set color based on value (tiny mapping)
    tile.style.left = `${8 + c*(100+8)}px`; tile.style.top = `${8 + r*(100+8)}px`;
    tile.style.width='100px'; tile.style.height='100px';
    tile.style.fontSize = (v>=1024? '18px' : '24px');
    tile.style.background = (v===2? '#eee4da' : v===4? '#ede0c8' : '#f2b179');
    tile.style.position = 'absolute';
    tile.style.opacity = animator.running ? '0' : '1';
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
