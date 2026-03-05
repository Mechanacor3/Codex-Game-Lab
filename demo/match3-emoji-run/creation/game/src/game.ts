import {ROWS,COLS,TILE_TYPES,EMOJIS,Tile} from './types';

function seededRandom(seed:number){
  return function(){
    seed = (seed * 48271) % 0x7fffffff;
    return (seed & 0xffff) / 0x10000;
  }
}

export class Board {
  grid: Tile[]; // row-major, 0..ROWS*COLS-1
  score = 0;
  combo = 1;
  rng: () => number;

  constructor(seed = 12345){
    this.grid = new Array(ROWS*COLS).fill(0);
    this.rng = seededRandom(seed);
    this.fillRandom();
  }

  index(r:number,c:number){ return r*COLS + c }

  at(r:number,c:number){ return this.grid[this.index(r,c)] }
  set(r:number,c:number,v:Tile){ this.grid[this.index(r,c)] = v }

  fillRandom(){
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        this.set(r,c, Math.floor(this.rng()*TILE_TYPES));
      }
    }
    // avoid starting matches
    while(this.findMatches().length) this.resolveMatchesImmediate();
  }

  setGrid(arr:number[]){
    if(arr.length !== ROWS*COLS) throw new Error('bad length');
    this.grid = arr.slice();
  }

  swap(r1:number,c1:number,r2:number,c2:number){
    const i1=this.index(r1,c1), i2=this.index(r2,c2);
    const tmp=this.grid[i1]; this.grid[i1]=this.grid[i2]; this.grid[i2]=tmp;
    const matches = this.findMatches();
    if(matches.length===0){ // revert
      const tmp2=this.grid[i1]; this.grid[i1]=this.grid[i2]; this.grid[i2]=tmp2;
      return false;
    }
    // otherwise resolve until stable
    let chain = 0;
    while(true){
      const sets = this.findMatches();
      if(sets.length===0) break;
      chain++;
      const cleared = this.clearMatches(sets);
      this.score += cleared * 100 * this.combo;
      this.applyGravity();
      this.refillTop();
      this.combo++;
      // safety
      if(chain>20) break;
    }
    // after resolution reset combo back to 1 for next move
    this.combo = 1;
    return true;
  }

  findMatches(){
    const res: Set<number>[] = [];
    const seen = new Set<number>();
    // horizontal
    for(let r=0;r<ROWS;r++){
      let runStart=0;
      for(let c=1;c<=COLS;c++){
        if(c<COLS && this.at(r,c)===this.at(r,runStart)) continue;
        const runLen = c-runStart;
        if(runLen>=3){
          const s = new Set<number>();
          for(let k=runStart;k<c;k++) s.add(this.index(r,k));
          res.push(s);
        }
        runStart=c;
      }
    }
    // vertical
    for(let c=0;c<COLS;c++){
      let runStart=0;
      for(let r=1;r<=ROWS;r++){
        if(r<ROWS && this.at(r,c)===this.at(runStart,c)) continue;
        const runLen = r-runStart;
        if(runLen>=3){
          const s = new Set<number>();
          for(let k=runStart;k<r;k++) s.add(this.index(k,c));
          res.push(s);
        }
        runStart=r;
      }
    }
    // merge overlapping sets
    const merged: Set<number>[] = [];
    for(const s of res){
      let mergedInto: Set<number> | null = null;
      for(const m of merged){
        for(const v of s) if(m.has(v)){ mergedInto = m; break }
        if(mergedInto) break;
      }
      if(mergedInto){ for(const v of s) mergedInto.add(v) }
      else merged.push(new Set(s));
    }
    return merged;
  }

  clearMatches(sets:Set<number>[]) {
    let cleared=0;
    for(const s of sets){
      for(const idx of s){
        if(this.grid[idx] !== -1){
          this.grid[idx] = -1; cleared++;
        }
      }
    }
    return cleared;
  }

  resolveMatchesImmediate(){
    const sets=this.findMatches();
    if(sets.length===0) return 0;
    const c = this.clearMatches(sets);
    this.applyGravity();
    this.refillTop();
    return c;
  }

  applyGravity(){
    for(let c=0;c<COLS;c++){
      let write = ROWS-1;
      for(let r=ROWS-1;r>=0;r--){
        const v = this.at(r,c);
        if(v!==-1){ this.set(write,c,v); write--; }
      }
      for(let r=write;r>=0;r--) this.set(r,c,-1);
    }
  }

  refillTop(){
    for(let c=0;c<COLS;c++){
      for(let r=0;r<ROWS;r++){
        if(this.at(r,c)===-1) this.set(r,c, Math.floor(this.rng()*TILE_TYPES));
      }
    }
    // avoid immediate matches from refill
    // we'll allow cascades; but ensure there is no pre-existing match after full refill
  }

  toEmojiRows(){
    const lines:string[] = [];
    for(let r=0;r<ROWS;r++){
      const row: string[] = [];
      for(let c=0;c<COLS;c++) row.push(EMOJIS[this.at(r,c)]);
      lines.push(row.join(' '));
    }
    return lines;
  }
}

export default Board;
