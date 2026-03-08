// Minimal visual layer for deterministic 2048; preserves window.* hooks
(function(){
  const d = document;
  function $(s){return d.querySelector(s)}
  const boardEl = $('#board');
  const renderPre = $('#render');
  const startOverlay = $('#startOverlay');
  const endOverlay = $('#endOverlay');
  const endTitle = $('#endTitle');
  const endMsg = $('#endMsg');
  const playBtn = $('#playBtn');
  const restartBtn = $('#restartBtn');
  const endRestart = $('#endRestart');
  const hcToggle = $('#hcToggle');
  const rmToggle = $('#rmToggle');

  const CELL = 116; // 100 tile + 16 gap math
  let boardRect = {left:0,top:0,size:500};

  function getGame(){ return window.game; }

  function setBodyFlag(name, on){ document.body.classList.toggle(name, on); localStorage.setItem('flag_'+name, on ? '1' : '0'); }
  function loadFlags(){ hcToggle.checked = !!localStorage.getItem('flag_high-contrast'); rmToggle.checked = !!localStorage.getItem('flag_reduced-motion'); setBodyFlag('high-contrast', hcToggle.checked); setBodyFlag('reduced-motion', rmToggle.checked); }
  loadFlags();
  hcToggle.addEventListener('change', ()=> setBodyFlag('high-contrast', hcToggle.checked));
  rmToggle.addEventListener('change', ()=> setBodyFlag('reduced-motion', rmToggle.checked));

  function screenToCell(x,y){ const r = boardEl.getBoundingClientRect(); const cx = Math.floor(((x - r.left) / r.width) * 4); const cy = Math.floor(((y - r.top) / r.height) * 4); return {c: Math.max(0, Math.min(3, cx)), r: Math.max(0, Math.min(3, cy))}; }

  function clearBoardDOM(){ while(boardEl.firstChild) boardEl.removeChild(boardEl.firstChild); }

  function createGridBackground(){ for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const el = document.createElement('div'); el.className='grid-cell'; el.style.width='100px'; el.style.height='100px'; el.style.left=(c*(100+16))+'px'; el.style.top=(r*(100+16))+'px'; boardEl.appendChild(el); } }

  function renderVisual(){ const g = getGame(); if(!g) return; // draw tiles
    // update textual render for tests
    try{ renderPre.textContent = window.render_game_to_text(); }catch(e){}
    // overlays
    if(g.state === 'won' || g.state === 'lost'){ startOverlay.hidden = true; endOverlay.hidden=false; endTitle.textContent = g.state === 'won' ? 'You Win' : 'Game Over'; endMsg.textContent = `Score: ${g.score}`; } else { endOverlay.hidden = true; }

    // maintain tiles by key
    const existing = new Map();
    boardEl.querySelectorAll('.tile').forEach(t => existing.set(t.dataset.pos, t));

    for(let r=0;r<4;r++) for(let c=0;c<4;c++){ const v = g.board[r][c]; const pos = r+"-"+c; if(v===0){ // remove tile if exists
        if(existing.has(pos)){ const t = existing.get(pos); t.style.opacity='0'; setTimeout(()=>{ t.remove(); }, 150); existing.delete(pos); }
        continue; }
      let tile = existing.get(pos);
      if(!tile){ tile = document.createElement('div'); tile.className='tile'; tile.textContent = v; tile.dataset.pos = pos; tile.style.width='100px'; tile.style.height='100px'; tile.style.left=(c*(100+16))+'px'; tile.style.top=(r*(100+16))+'px'; tile.style.transform='translate(0,0)'; boardEl.appendChild(tile);
        // subtle pop on new/merged tiles
        tile.classList.add('pop'); setTimeout(()=>tile.classList.remove('pop'), 220);
      } else {
        // update value text
        tile.textContent = v;
      }
    }
  }

  // pointer swipe handling
  let down = null;
  boardEl.addEventListener('pointerdown', (e)=>{ down = {x:e.clientX, y:e.clientY}; boardEl.setPointerCapture(e.pointerId); });
  boardEl.addEventListener('pointerup', (e)=>{
    if(!down) return; const dx = e.clientX - down.x; const dy = e.clientY - down.y; const adx = Math.abs(dx), ady = Math.abs(dy);
    if(Math.max(adx,ady) > 30){ const dir = adx > ady ? (dx>0?'right':'left') : (dy>0?'down':'up'); const ok = window.game && window.game.move(dir); try{ window.render_game_to_text && (document.querySelector('#render').textContent = window.render_game_to_text()); }catch(e){}
      // schedule visual update after a tick to allow spawn via scheduler
      setTimeout(()=>{ renderVisual(); }, 60);
    }
    down = null;
  });

  // play / restart
  playBtn.addEventListener('click', ()=>{ startOverlay.hidden = true; startOverlay.classList.remove('visible'); renderVisual(); });
  function restart(){ if(window.game && typeof window.game.reset === 'function') window.game.reset(); renderVisual(); startOverlay.hidden=false; startOverlay.classList.add('visible'); }
  restartBtn.addEventListener('click', ()=>{ restart(); });
  endRestart.addEventListener('click', ()=>{ restart(); });

  // keyboard is handled by main.ts; ensure visual sync after moves
  window.addEventListener('keydown', ()=>{ setTimeout(()=>renderVisual(), 40); });

  // periodic visual sync (harmless)
  setInterval(()=>renderVisual(), 250);

  // initialize layout
  createGridBackground(); renderVisual();
})();
