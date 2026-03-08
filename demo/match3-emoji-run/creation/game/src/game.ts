import { Board, GameState } from "./types";

export const WIDTH = 8;
export const HEIGHT = 8;
export const TILE_TYPES = 6;
export const EMOJIS = ["🍎","🍊","🍇","🍋","🍓","🍒"];

export class Match3 {
  state: GameState;
  private rngSeed = 1;

  constructor(){
    this.state = { board: this.createEmpty(), score: 0, combo: 1, resolving: false };
    this.fillRandom();
  }

  createEmpty(): Board{
    return Array.from({length: HEIGHT},()=>Array.from({length: WIDTH},()=>0));
  }

  // deterministic rand for tests
  seed(s:number){ this.rngSeed = s; }
  rnd(){ this.rngSeed = (this.rngSeed * 1664525 + 1013904223) >>> 0; return this.rngSeed / 0x100000000; }
  randInt(n:number){return Math.floor(this.rnd()*n)}

  fillRandom(){
    for(let r=0;r<HEIGHT;r++)for(let c=0;c<WIDTH;c++)this.state.board[r][c]=this.randInt(TILE_TYPES);
  }

  setBoard(board: Board){ this.state.board = board.map(row=>row.slice()); }

  swap(r1:number,c1:number,r2:number,c2:number){
    const b = this.state.board;
    const tmp = b[r1][c1]; b[r1][c1]=b[r2][c2]; b[r2][c2]=tmp;
  }

  isAdjacent(r1:number,c1:number,r2:number,c2:number){
    return Math.abs(r1-r2)+Math.abs(c1-c2)===1;
  }

  findMatches(board:Board){
    const matches: Set<string> = new Set();
    // rows
    for(let r=0;r<HEIGHT;r++){
      let run=1;
      for(let c=1;c<=WIDTH;c++){
        if(c<WIDTH && board[r][c]===board[r][c-1]){ run++; continue; }
        if(run>=3){ for(let k=0;k<run;k++) matches.add(`${r},${c-1-k}`); }
        run=1;
      }
    }
    // cols
    for(let c=0;c<WIDTH;c++){
      let run=1;
      for(let r=1;r<=HEIGHT;r++){
        if(r<HEIGHT && board[r][c]===board[r-1][c]){ run++; continue; }
        if(run>=3){ for(let k=0;k<run;k++) matches.add(`${r-1-k},${c}`); }
        run=1;
      }
    }
    return Array.from(matches).map(s=>s.split(",").map(Number) as [number,number]);
  }

  clearMatches(board:Board, matches:[number,number][]) : number {
    for(const [r,c] of matches) board[r][c] = -1;
    const cleared = matches.length;
    return cleared;
  }

  applyGravity(board:Board){
    for(let c=0;c<WIDTH;c++){
      let write = HEIGHT-1;
      for(let r=HEIGHT-1;r>=0;r--){
        if(board[r][c]!==-1){ board[write][c]=board[r][c]; write--; }
      }
      while(write>=0){ board[write][c]=this.randInt(TILE_TYPES); write--; }
    }
  }

  tryMove(r1:number,c1:number,r2:number,c2:number){
    if(!this.isAdjacent(r1,c1,r2,c2)) return false;
    const board = this.state.board.map(r=>r.slice());
    // swap
    const tmp = board[r1][c1]; board[r1][c1]=board[r2][c2]; board[r2][c2]=tmp;
    const matches = this.findMatches(board);
    if(matches.length===0) return false;
    // valid: commit and resolve
    this.state.board = board;
    this.resolveAll();
    return true;
  }

  resolveAll(){
    this.state.resolving = true;
    let chain = 0;
    while(true){
      const matches = this.findMatches(this.state.board);
      if(matches.length===0) break;
      chain++;
      const cleared = this.clearMatches(this.state.board,matches);
      // scoring: base 10 per tile, times chain multiplier
      this.state.score += cleared * 10 * chain;
      this.applyGravity(this.state.board);
    }
    this.state.combo = chain>1?chain:1;
    this.state.resolving = false;
  }

  // deterministic step hooks for test automation
  advanceTime(ms:number){
    // in this simple game, resolving is instantaneous on move; advanceTime triggers no extra effect
    return;
  }

  renderText(): string{
    const rows = this.state.board.map(r=>r.map(v=> v>=0 ? EMOJIS[v] : 
