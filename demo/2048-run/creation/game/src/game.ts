// Minimal deterministic 2048 core logic

export type Tile = number | 0;
export type Board = Tile[]; // length 16, row-major

export type GameState = 'playing' | 'won' | 'lost';

export class RNG {
  seed: number;
  constructor(seed = 1) { this.seed = seed >>> 0; }
  next() {
    // xorshift32
    let x = this.seed || 1;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    this.seed = x;
    return x / 0xFFFFFFFF;
  }
}

export class Game {
  board: Board;
  score: number;
  moves: number;
  state: GameState;
  rng: RNG;
  lastSpawned: number | null;

  constructor(seed = 1) {
    this.rng = new RNG(seed);
    this.board = new Array(16).fill(0);
    this.score = 0;
    this.moves = 0;
    this.state = 'playing';
    this.lastSpawned = null;
    // start with two tiles
    this.spawnRandom();
    this.spawnRandom();
  }

  setSeed(n: number) { this.rng = new RNG(n); }

  index(r: number, c: number) { return r * 4 + c; }

  emptyIndices() {
    const res: number[] = [];
    for (let i = 0; i < 16; i++) if (this.board[i] === 0) res.push(i);
    return res;
  }

  spawnRandom() {
    const empties = this.emptyIndices();
    if (empties.length === 0) return null;
    const pick = Math.floor(this.rng.next() * empties.length);
    const idx = empties[pick];
    const v = (this.rng.next() < 0.9) ? 2 : 4;
    this.board[idx] = v;
    this.lastSpawned = idx;
    return { idx, v };
  }

  setBoard(b: Board) {
    if (b.length !== 16) throw new Error('board must be length 16');
    this.board = b.slice();
    this.score = 0;
    this.moves = 0;
    this.state = 'playing';
  }

  cloneBoard() { return this.board.slice(); }

  canMove() {
    if (this.emptyIndices().length > 0) return true;
    // check merges
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const v = this.board[this.index(r,c)];
      if (c < 3 && this.board[this.index(r,c+1)] === v) return true;
      if (r < 3 && this.board[this.index(r+1,c)] === v) return true;
    }
    return false;
  }

  move(dir: 'up'|'down'|'left'|'right') {
    if (this.state !== 'playing') return false;
    const before = this.cloneBoard();
    let moved = false;
    let gained = 0;
    const makeLine = (i: number) => [this.board[i], this.board[i+4], this.board[i+8], this.board[i+12]];

    if (dir === 'left' || dir === 'right') {
      for (let r = 0; r < 4; r++) {
        const row = [] as number[];
        for (let c = 0; c < 4; c++) row.push(this.board[this.index(r,c)] as number);
        const orig = row.slice();
        const newRow = this.processLine(row, dir === 'right');
        for (let c = 0; c < 4; c++) this.board[this.index(r,c)] = newRow[c];
        if (!moved && !arraysEqual(orig, newRow)) moved = true;
      }
    } else {
      for (let c = 0; c < 4; c++) {
        const col = [] as number[];
        for (let r = 0; r < 4; r++) col.push(this.board[this.index(r,c)] as number);
        const orig = col.slice();
        const newCol = this.processLine(col, dir === 'down');
        for (let r = 0; r < 4; r++) this.board[this.index(r,c)] = newCol[r];
        if (!moved && !arraysEqual(orig, newCol)) moved = true;
      }
    }

    if (moved) {
      this.moves += 1;
      // spawn after a valid move
      this.spawnRandom();
      // recompute score as sum of board for simplicity of deterministic scoring increments
      // but we will increment gained inside processLine via side-effect
    }

    if (!this.canMove()) this.state = 'lost';
    return moved;
  }

  processLine(line: number[], reverse = false) {
    const arr = reverse ? line.slice().reverse() : line.slice();
    const result: number[] = [0,0,0,0];
    let write = 0;
    for (let i = 0; i < 4; i++) {
      const v = arr[i];
      if (v === 0) continue;
      if (write > 0 && result[write-1] === v && result[write-1] !== 0 && (i>0)) {
        // merge with previous
        result[write-1] = result[write-1] * 2;
        this.score += result[write-1];
      } else {
        result[write++] = v;
      }
    }
    while (write < 4) { result[write++] = 0; }
    return reverse ? result.reverse() : result;
  }
}

function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function renderToText(g: Game) {
  const rows: string[] = [];
  for (let r = 0; r < 4; r++) {
    const row = [] as string[];
    for (let c = 0; c < 4; c++) row.push(String(g.board[g.index(r,c)]).padStart(4, ' '));
    rows.push(row.join(' '));
  }
  return `\n${rows.join('\n')}\nscore: ${g.score}\nmoves: ${g.moves}\nstate: ${g.state}\n`;
}
