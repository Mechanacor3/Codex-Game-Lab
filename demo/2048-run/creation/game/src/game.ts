// TypeScript source for game logic (same core as runtime in index.html)
export class RNG {
  private _seed = 1;
  constructor(seed=1){ this.set(seed); }
  set(seed:number){ this._seed = seed >>> 0; }
  next(): number {
    let t = this._seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export type Board = number[][];

export class Game {
  size = 4;
  board: Board = [];
  score = 0;
  moves = 0;
  state: 'playing'|'lost'|'won' = 'playing';
  rng: RNG;
  time = 0;
  constructor(seed=1){ this.rng = new RNG(seed); this._initBoard(); }
  _initBoard(){ this.board = Array.from({length:this.size},()=>Array(this.size).fill(0)); }
  setSeed(s:number){ this.rng.set(s); }
  setBoard(b:Board){ this.board = b.map(row=>row.slice()); this._updateState(); }
  getBoard(){ return this.board.map(r=>r.slice()); }
  _updateState(){ if(this._hasTile(2048)) this.state='won'; else if(this._checkLoss()) this.state='lost'; else this.state='playing'; }
  _hasTile(v:number){ for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++) if(this.board[r][c]===v) return true; return false; }
  _checkLoss():boolean{ for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++) if(this.board[r][c]===0) return false; for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++){ const v=this.board[r][c]; if(r+1<this.size && this.board[r+1][c]===v) return false; if(c+1<this.size && this.board[r][c+1]===v) return false; } return true; }
  _hasChanged(oldB:Board,newB:Board){ for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++) if(oldB[r][c]!==newB[r][c]) return true; return false; }
  _moveLineLeft(line:number[]){ const out = line.filter(x=>x!==0); const merged:boolean[] = []; let scoreGain=0; for(let i=0;i<out.length-1;i++){ if(out[i]===out[i+1] && !merged[i]){ out[i] = out[i]*2; scoreGain += out[i]; out[i+1] = 0; merged[i]=true; } } const compact = out.filter(x=>x!==0); while(compact.length<line.length) compact.push(0); return {line:compact, scoreGain}; }
  _transpose(b:Board){ const s=this.size; const t = Array.from({length:s},()=>Array(s).fill(0)); for(let r=0;r<s;r++) for(let c=0;c<s;c++) t[c][r]=b[r][c]; return t; }
  _reverseRows(b:Board){ return b.map(row=>row.slice().reverse()); }
  _spawnRandom(){ const empties:number[][]=[]; for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++) if(this.board[r][c]===0) empties.push([r,c]); if(empties.length===0) return; const idx = Math.floor(this.rng.next()*empties.length); const [r,c] = empties[idx]; const tile = this.rng.next() < 0.9 ? 2 : 4; this.board[r][c] = tile; }
  move(dir:'up'|'down'|'left'|'right'){ return this._move(dir,true); }
  moveNoSpawn(dir:'up'|'down'|'left'|'right'){ return this._move(dir,false); }
  _move(dir:'up'|'down'|'left'|'right', doSpawn:boolean){ if(this.state==='lost' || this.state==='won') return false; let working = this.board.map(r=>r.slice()); let rotated=false, reversed=false; if(dir==='up'){ working = this._transpose(working); rotated=true; } else if(dir==='down'){ working = this._transpose(working); working = this._reverseRows(working); rotated=true; reversed=true; } else if(dir==='right'){ working = this._reverseRows(working); reversed=true; } let totalGain=0; const before = working.map(r=>r.slice()); for(let r=0;r<this.size;r++){ const {line, scoreGain} = this._moveLineLeft(working[r]); working[r]=line; totalGain += scoreGain; } let after = working; if(reversed) after = this._reverseRows(after); if(rotated) after = this._transpose(after); const changed = this._hasChanged(this.board, after); if(!changed) return false; this.board = after.map(r=>r.slice()); this.score += totalGain; this.moves += 1; if(doSpawn) this._spawnRandom(); this._updateState(); return true; }
  renderText(){ const rows = this.board.map(r=>r.map(v=>v===0?'.':String(v)).join(' ')).join('\n'); const meta = `\nScore: ${this.score}  Moves: ${this.moves}  State: ${this.state}`; return rows + meta; }
}
