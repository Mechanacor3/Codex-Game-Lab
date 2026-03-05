// UI polish layer for deterministic match-3 engine
(function(){
  const g = window._GAME;
  // helper local game operations (mirror of balance core where needed)
  function clone(b){ return b.map(r=>r.slice()); }
  function create2D(r,c,v){ const a=new Array(r); for(let i=0;i<r;i++){ a[i]=new Array(c).fill(v);} return a; }
  function hasMatchLocal(b){
    const W=g.W, H=g.H;
    for(let y=0;y<H;y++) for(let x=0;x<W-2;x++){ const v=b[y][x]; if(v===b[y][x+1] && v===b[y][x+2]) return true; }
    for(let x=0;x<W;x++) for(let y=0;y<H-2;y++){ const v=b[y][x]; if(v===b[y+1][x] && v===b[y+2][x]) return true; }
    return false;
  }
  function resolveMatchesLocal(b){
    const W=g.W, H=g.H; let removed=false; const mark=create2D(H,W,false);
    for(let y=0;y<H;y++){
      for(let x=0;x<W-2;x++){ const v=b[y][x]; if(v===b[y][x+1] && v===b[y][x+2]){ mark[y][x]=mark[y][x+1]=mark[y][x+2]=true; } }
    }
    for(let x=0;x<W;x++){
      for(let y=0;y<H-2;y++){ const v=b[y][x]; if(v===b[y+1][x] && v===b[y+2][x]){ mark[y][x]=mark[y+1][x]=mark[y+2][x]=true; } }
    }
    const removedPositions=[];
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(mark[y][x]){ b[y][x]=null; removed=true; removedPositions.push({x,y}); }
    if(!removed) return {removed:false};
    // drop
    for(let x=0;x<W;x++){
      let ptr = H-1;
      for(let y=H-1;y>=0;y--){ if(b[y][x]!==null){ b[ptr][x]=b[y][x]; ptr--; } }
      for(let y=ptr;y>=0;y--){ b[y][x] = g._rng.nextInt(g.TYPES); }
    }
    return {removed:true, positions: removedPositions};
  }

  // UI state and markers
  window.UI = window.UI || {};
  const UI = window.UI;
  UI.state = {
    overlay: 'start', // 'start' | null | 'gameover'
    cursor: {x:0,y:0},
    selected: null, // {x,y}
    swapAnim: null, // {from:{x,y},to:{x,y},progress}
    popMarkers: [], // [{x,y,timer}]
    scorePopups: [], // [{x,y,score,timer}]
    matchPops: [], // marker for match pop animation
    lastActionTime: 0,
  };

  UI.start = function(seed=1){ window.setBoardSeed(seed); UI.state.overlay = null; UI.state.cursor={x:0,y:0}; UI.state.selected=null; UI.state.swapAnim=null; UI.state.popMarkers=[]; UI.state.scorePopups=[]; };
  UI.restart = function(){ UI.state.overlay = 'start'; UI.state.selected = null; };

  // expose a simple key-press API for tests and keyboard layer
  UI.pressKey = function(key){
    const s = UI.state;
    if(s.overlay === 'start'){
      if(key === 'Enter') { UI.start(g._seed); }
      return;
    }
    if(s.overlay === 'gameover'){
      if(key === 'Enter') { UI.restart(); }
      return;
    }
    // navigation
    if(key === 'ArrowLeft') { s.cursor.x = Math.max(0, s.cursor.x-1); }
    else if(key === 'ArrowRight') { s.cursor.x = Math.min(g.W-1, s.cursor.x+1); }
    else if(key === 'ArrowUp') { s.cursor.y = Math.max(0, s.cursor.y-1); }
    else if(key === 'ArrowDown') { s.cursor.y = Math.min(g.H-1, s.cursor.y+1); }
    else if(key === 'Enter'){
      // select or attempt swap
      if(!s.selected){ s.selected = {x:s.cursor.x, y:s.cursor.y}; }
      else {
        const dx = Math.abs(s.selected.x - s.cursor.x);
        const dy = Math.abs(s.selected.y - s.cursor.y);
        if((dx===1 && dy===0) || (dx===0 && dy===1)){
          UI.performSwap(s.selected, {x:s.cursor.x,y:s.cursor.y});
        }
        s.selected = null;
      }
    }
  };

  UI.performSwap = function(a,b){
    const s = UI.state;
    s.swapAnim = {from:a, to:b, progress:0};
    // immediate finish animation for deterministic tests but leave marker
    s.swapAnim.progress = 1.0;
    // swap board values
    const board = g.board;
    const t = board[a.y][a.x]; board[a.y][a.x] = board[b.y][b.x]; board[b.y][b.x] = t;
    // after swap, check matches
    const match = hasMatchLocal(board);
    if(match){
      g.combo += 1; g.score += 100 * g.combo;
      const res = resolveMatchesLocal(board);
      if(res.removed){
        // set pop markers
        UI.state.matchPops.push({positions: res.positions.slice(), timer: 500});
        // if 4 or more cleared, show score popup
        if(res.positions.length >= 4){
          UI.state.scorePopups.push({x:res.positions[0].x, y:res.positions[0].y, score: res.positions.length * 50, timer: 1000});
        }
      }
    } else {
      // revert
      const t2 = board[a.y][a.x]; board[a.y][a.x] = board[b.y][b.x]; board[b.y][b.x] = t2;
      g.combo = 0;
    }
    s.lastActionTime = Date.now();
    // check dead/reshuffle
    if(!hasAnyMoveLocal(board)) window.reshuffleDeterministic();
  };

  // small helpers for test inspection
  UI.inspect = function(){ return {
    overlay: UI.state.overlay,
    cursor: UI.state.cursor,
    selected: UI.state.selected,
    swapAnim: UI.state.swapAnim,
    matchPops: UI.state.matchPops,
    scorePopups: UI.state.scorePopups,
    score: g.score,
    combo: g.combo,
    finished: g.finished,
  } };

  // check for game finish and show overlay
  UI.checkFinish = function(){ if(g.finished){ UI.state.overlay = 'gameover'; } };

  // keep deterministic helper wrappers available
  window.setBoardSeed = window.setBoardSeed || function(s){ return window._GAME && window._GAME.board; };
  window.advanceTime = window.advanceTime || function(ms){ return null; };

})();
