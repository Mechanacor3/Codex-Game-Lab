// tiny harness to interact with the deterministic engine
(function(){
  const g = window._GAME;
  function swap(x1,y1,x2,y2){
    const b = g.board; const t=b[y1][x1]; b[y1][x1]=b[y2][x2]; b[y2][x2]=t;
    // if this produced a match, award points and combo
    if(hasMatchLocal(b)){
      g.combo += 1; g.score += 100 * g.combo;
      // remove matches (simple), drop tiles, fill
      resolveMatches(b);
    } else {
      // revert
      const t2=b[y1][x1]; b[y1][x1]=b[y2][x2]; b[y2][x2]=t2;
      g.combo = 0;
    }
    // check dead and possibly reshuffle
    if(!hasAnyMoveLocal(b)) reshuffleLocal();
  }

  // local copies to avoid relying on scope across files
  function clone(b){ return b.map(r=>r.slice()); }
  function hasMatchLocal(b){
    const W=window.GAME.W, H=window.GAME.H;
    for(let y=0;y<H;y++) for(let x=0;x<W-2;x++){ const v=b[y][x]; if(v===b[y][x+1] && v===b[y][x+2]) return true; }
    for(let x=0;x<W;x++) for(let y=0;y<H-2;y++){ const v=b[y][x]; if(v===b[y+1][x] && v===b[y+2][x]) return true; }
    return false;
  }
  function hasAnyMoveLocal(b){
    const W=window.GAME.W, H=window.GAME.H;
    const trySwap=(x1,y1,x2,y2)=>{ const c=clone(b); const t=c[y1][x1]; c[y1][x1]=c[y2][x2]; c[y2][x2]=t; return hasMatchLocal(c); };
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(x+1<W && trySwap(x,y,x+1,y)) return true; if(y+1<H && trySwap(x,y,x,y+1)) return true; }
    return false;
  }
  function resolveMatches(b){
    const W=window.GAME.W, H=window.GAME.H; let removed=false;
    // mark
    const mark = create2D(H,W,false);
    for(let y=0;y<H;y++){
      for(let x=0;x<W-2;x++){
        const v=b[y][x]; if(v===b[y][x+1] && v===b[y][x+2]){ mark[y][x]=mark[y][x+1]=mark[y][x+2]=true; }
      }
    }
    for(let x=0;x<W;x++){
      for(let y=0;y<H-2;y++){
        const v=b[y][x]; if(v===b[y+1][x] && v===b[y+2][x]){ mark[y][x]=mark[y+1][x]=mark[y+2][x]=true; }
      }
    }
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(mark[y][x]){ b[y][x] = null; removed=true; }
    if(!removed) return;
    // drop
    for(let x=0;x<W;x++){
      let ptr = H-1;
      for(let y=H-1;y>=0;y--){ if(b[y][x]!==null){ b[ptr][x]=b[y][x]; ptr--; } }
      for(let y=ptr;y>=0;y--){ b[y][x] = window.GAME._rng.nextInt(window.GAME.TYPES); }
    }
  }
  function create2D(r,c,v){ const a=new Array(r); for(let i=0;i<r;i++){ a[i]=new Array(c).fill(v);} return a; }
  function reshuffleLocal(){ window.reshuffleDeterministic(); }

  window.swap = swap;
})();
