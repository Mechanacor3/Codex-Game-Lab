// Minimal deterministic match-3 runtime (compact, self-contained)
(function(){
  const W = 8, H = 8, COLORS = 6;
  let seed = 1;
  function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let rnd = mulberry32(seed);
  let board = new Array(W*H).fill(0);
  let score = 0, combo = 0;
  let totalTime = 60.0; // seconds
  let remaining = totalTime;
  const MILESTONES = [15,30,45,60];
  let achieved = new Set();
  let deadBoard = false;
  let reshuffleCount = 0;

  function idx(x,y){ return y*W + x; }
  function get(x,y){ return board[idx(x,y)]; }
  function set(x,y,v){ board[idx(x,y)]=v; }

  function randInt(){ return Math.floor(rnd()*COLORS)+1; }

  function seedPRNG(s){ seed = (s|0) >>> 0; rnd = mulberry32(seed); }

  function fillBoard(){ for(let i=0;i<board.length;i++) board[i]=randInt(); removeInitialMatches(); }
  function removeInitialMatches(){ // simple pass to avoid immediate 3-in-a-row
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      while(isMatchAt(x,y)) board[idx(x,y)] = randInt();
    }
  }

  function isMatchAt(x,y){ const v = get(x,y); if(!v) return false; // check horiz
    let c=1; for(let i=x+1;i<W && get(i,y)===v;i++) c++; for(let i=x-1;i>=0 && get(i,y)===v;i--) c++; if(c>=3) return true;
    c=1; for(let j=y+1;j<H && get(x,j)===v;j++) c++; for(let j=y-1;j>=0 && get(x,j)===v;j--) c++; if(c>=3) return true;
    return false;
  }

  function findMatches(){ const hits = new Set();
    // horiz
    for(let y=0;y<H;y++){
      let run=1; for(let x=1;x<W;x++){
        if(get(x,y)===get(x-1,y)) run++; else { if(run>=3) for(let k=0;k<run;k++) hits.add(idx(x-1-k,y)); run=1; }
      } if(run>=3) for(let k=0;k<run;k++) hits.add(idx(W-1-k,y));
    }
    // vert
    for(let x=0;x<W;x++){
      let run=1; for(let y=1;y<H;y++){
        if(get(x,y)===get(x,y-1)) run++; else { if(run>=3) for(let k=0;k<run;k++) hits.add(idx(x,y-1-k)); run=1; }
      } if(run>=3) for(let k=0;k<run;k++) hits.add(idx(x,H-1-k));
    }
    return Array.from(hits);
  }

  function collapseAndRefill(){ for(let x=0;x<W;x++){
    let write = H-1;
    for(let y=H-1;y>=0;y--){ const v=get(x,y); if(v){ set(x,write,v); write--; } }
    for(let y=write;y>=0;y--) set(x,y,randInt());
  }}

  function applyMatches(hits){ if(hits.length===0) return 0; const count = hits.length; for(const id of hits) board[id]=0; collapseAndRefill(); combo = combo+1; score += count*10*combo; return count; }

  function performCascades(){ let total=0; let loop=0; while(true){ const hits = findMatches(); if(hits.length===0) break; total += applyMatches(hits); loop++; if(loop>50) break; } if(total===0) combo=0; return total; }

  function hasPossibleMove(){ // try swapping neighbors
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      if(x+1<W){ swapCells(x,y,x+1,y); if(findMatches().length>0){ swapCells(x,y,x+1,y); return true; } swapCells(x,y,x+1,y); }
      if(y+1<H){ swapCells(x,y,x,y+1); if(findMatches().length>0){ swapCells(x,y,x,y+1); return true; } swapCells(x,y,x,y+1); }
    }
    return false;
  }

  function swapCells(x1,y1,x2,y2){ const a=idx(x1,y1), b=idx(x2,y2); const t=board[a]; board[a]=board[b]; board[b]=t; }

  function reshuffleDeterministic(){ reshuffleCount++; // update prng using seed+count to keep determ
    seedPRNG((seed ^ (reshuffleCount*2654435761))>>>0);
    // Fisher-Yates
    for(let i=board.length-1;i>0;i--){ const j = Math.floor(rnd()*(i+1)); const t=board[i]; board[i]=board[j]; board[j]=t; }
    // if still no moves, repeat (bounded)
    let attempts=0; while(!hasPossibleMove() && attempts<10){ for(let i=board.length-1;i>0;i--){ const j = Math.floor(rnd()*(i+1)); const t=board[i]; board[i]=board[j]; board[j]=t; } attempts++; }
    deadBoard = !hasPossibleMove();
  }

  // Public APIs
  function setBoardSeed(s){ seedPRNG(s); fillBoard(); score=0; combo=0; remaining=totalTime; achieved.clear(); deadBoard=false; reshuffleCount=0; }

  function advanceTime(ms){ if(remaining<=0) return; const prevElapsed = totalTime - remaining; remaining = Math.max(0, remaining - ms/1000); const elapsed = totalTime - remaining; // milestones are elapsed thresholds
    for(let i=0;i<MILESTONES.length;i++){ const m=MILESTONES[i]; if(elapsed >= m && !achieved.has(m)){ achieved.add(m); } }
    // do a deterministic cascade tick per advance call to simulate game updates
    performCascades();
    // dead board detection during gameplay: reshuffle deterministically
    if(!hasPossibleMove()){ deadBoard = true; reshuffleDeterministic(); }
    if(remaining<=0) { remaining=0; }
  }

  function render_game_to_text(){ const arr = Array.from(achieved).sort(function(a,b){return a-b}); const highest = arr.length? arr[arr.length-1]: 0; var out = '';
    out += 'SCORE: ' + score + '\n';
    out += 'COMBO: ' + combo + '\n';
    out += 'TIME: ' + Math.floor(remaining) + '\n';
    out += 'MILESTONE: ' + highest + '\n';
    out += 'DEAD: ' + deadBoard;
    return out;
  }

  // expose for tests
  if(typeof window !== 'undefined'){
    window.setBoardSeed = setBoardSeed;
    window.advanceTime = advanceTime;
    window.render_game_to_text = render_game_to_text;
    window.__internal_game = { board: board, W: W, H: H, seed: function(){ return seed; }, _forceNoMoves: function(){ for(var y=0;y<H;y++) for(var x=0;x<W;x++) board[idx(x,y)] = ((x+y)%COLORS)+1; deadBoard = !hasPossibleMove(); } };
  }
})();
