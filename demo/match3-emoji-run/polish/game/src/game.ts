// Minimal deterministic match-3 engine (plain JS in a .ts file)
(function(){
  const W = 6, H = 6, TYPES = 5, TOTAL_MS = 60000;
  function makeRng(seed){
    let s = seed >>> 0 || 1;
    return {
      next(){ s = (s * 1103515245 + 12345) >>> 0; return s; },
      nextInt(n){ return (this.next() >>> 0) % n; }
    };
  }

  function fmtTime(ms){
    const s = Math.max(0, (TOTAL_MS - ms)/1000);
    return s.toFixed(3);
  }

  function createEmpty(){
    const b = new Array(H);
    for(let y=0;y<H;y++){ b[y]=new Array(W).fill(0); }
    return b;
  }

  function cloneBoard(b){ return b.map(r=>r.slice()); }

  // simple scan for any match in a board
  function hasMatch(b){
    for(let y=0;y<H;y++){
      for(let x=0;x<W-2;x++){
        const v=b[y][x]; if(v===b[y][x+1] && v===b[y][x+2]) return true;
      }
    }
    for(let x=0;x<W;x++){
      for(let y=0;y<H-2;y++){
        const v=b[y][x]; if(v===b[y+1][x] && v===b[y+2][x]) return true;
      }
    }
    return false;
  }

  // check if swapping any adjacent tiles would create a match
  function hasAnyMove(b){
    const trySwap = (x1,y1,x2,y2)=>{
      const c = cloneBoard(b);
      const t = c[y1][x1]; c[y1][x1]=c[y2][x2]; c[y2][x2]=t;
      return hasMatch(c);
    };
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(x+1<W && trySwap(x,y,x+1,y)) return true;
        if(y+1<H && trySwap(x,y,x,y+1)) return true;
      }
    }
    return false;
  }

  // flatten/shuffle utilities
  function toFlat(b){ return b.flat(); }
  function fromFlat(arr){ const b=createEmpty(); for(let i=0;i<arr.length;i++){ b[Math.floor(i/W)][i%W]=arr[i]; } return b; }

  // global game state
  window.GAME = window.GAME || {};
  const g = window.GAME;
  g.W = W; g.H = H; g.TYPES = TYPES;
  g.score = 0; g.combo = 0; g.elapsed = 0; g.milestonesReached = [];
  g.DEAD = false; g.finished = false; g._seed = 1; g._rng = makeRng(1);
  g.board = createEmpty();

  function generateBoard(){
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        g.board[y][x] = g._rng.nextInt(TYPES);
      }
    }
    // if the generated board already has matches, that's okay; ensure at least one move exists
    if(!hasAnyMove(g.board)){
      // if dead, perform deterministic reshuffle
      reshuffleDeterministic(50);
    }
  }

  function setBoardSeed(seed){
    g._seed = seed >>> 0; g._rng = makeRng(g._seed);
    g.score = 0; g.combo = 0; g.elapsed = 0; g.milestonesReached = [];
    g.finished = false; g.DEAD = false;
    g.board = createEmpty();
    generateBoard();
    return g.board;
  }
  window.setBoardSeed = setBoardSeed;

  function render_game_to_text(){
    const rows = g.board.map(r=>r.map(v=>'🔴🔵🟢🟡🟣'.slice(v*2,v*2+2) || v).join(' '));
    const milestone = g.milestonesReached.length? g.milestonesReached.join(',') : 'none';
    const dead = g.DEAD ? 'true' : 'false';
    const time = fmtTime(g.elapsed);
    return [
      `SCORE: ${g.score}`,
      `COMBO: ${g.combo}`,
      `TIME: ${time}`,
      `MILESTONE: ${milestone}`,
      `DEAD: ${dead}`,
      'BOARD:',
      ...rows
    ].join('\n');
  }
  window.render_game_to_text = render_game_to_text;

  // advance time by ms (deterministic)
  const MILESTONES = [15000,30000,45000,60000];
  function advanceTime(ms){
    if(g.finished) return;
    const prev = g.elapsed;
    g.elapsed = Math.min(TOTAL_MS, g.elapsed + ms);
    for(const m of MILESTONES){
      if(prev < m && g.elapsed >= m && !g.milestonesReached.includes(m/1000)){
        g.milestonesReached.push(m/1000);
      }
    }
    if(g.elapsed >= TOTAL_MS) g.finished = true;
    return g.elapsed;
  }
  window.advanceTime = advanceTime;

  // dead detection
  function checkDead(){ g.DEAD = !hasAnyMove(g.board); return g.DEAD; }
  window.checkDead = checkDead;

  // deterministic reshuffle using current RNG
  function reshuffleDeterministic(maxAttempts=100){
    let flat = toFlat(g.board);
    const n = flat.length;
    for(let attempt=0; attempt<maxAttempts; attempt++){
      // Fisher-Yates using g._rng
      for(let i=n-1;i>0;i--){
        const j = g._rng.nextInt(i+1);
        const t = flat[i]; flat[i]=flat[j]; flat[j]=t;
      }
      const candidate = fromFlat(flat);
      if(hasAnyMove(candidate)){
        g.board = candidate; g.DEAD = false; return true;
      }
      // otherwise perturb by re-seeding a little (but still deterministic)
      // advance rng once
      g._rng.next();
    }
    // failed to find good board
    g.DEAD = true; return false;
  }
  window.reshuffleDeterministic = reshuffleDeterministic;

  // minimal expose for tests
  window._GAME = g;
})();
