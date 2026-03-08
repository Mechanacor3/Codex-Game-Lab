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
  preset: 'casual'|'spicy';
  undos_left: number;
  max_undos: number;
  rng: RNG;
  lastSpawned: number | null;

  constructor(seed = 1) {
    this.rng = new RNG(seed);
    this.board = new Array(16).fill(0);
    this.score = 0;
    this.moves = 0;
    this.preset = 'casual';
    this.max_undos = 3;
    this.undos_left = this.max_undos;
    this.state = 'playing';
    this.lastSpawned = null;
    // start with two tiles
    this.spawnRandom();
    this.spawnRandom();
  }

  setSeed(n: number) { this.rng = new RNG(n); }

  setPreset(p: 'casual'|'spicy') {
    this.preset = p;
    // spicy lowers undos and increases 4 spawn rate via spawnRandom
    this.max_undos = (p === 'spicy') ? 1 : 3;
    this.undos_left = Math.min(this.undos_left, this.max_undos);
  }

  resetUndos() { this.undos_left = this.max_undos; }

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
    // preset affects 4 spawn probability
    const fourProb = (this.preset === 'spicy') ? 0.25 : 0.1;
    const v = (this.rng.next() < (1 - fourProb)) ? 2 : 4;
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
    this.resetUndos();
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
    let moved = false;
    // for undo state we capture pre-move board+score
    const preBoard = this.cloneBoard();
    const preScore = this.score;

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
    }

    // if moved, store undo snapshot (we allow undo until used up)
    if (moved) {
      (this as any)._lastUndo = { board: preBoard, score: preScore };
    }
    // check for win (tile 2048) or loss
    if (this.board.some(v => v === 2048)) this.state = 'won';
    else if (!this.canMove()) this.state = 'lost';
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

  undo() {
    if (!(this as any)._lastUndo) return false;
    if (this.undos_left <= 0) return false;
    const s = (this as any)._lastUndo as {board:number[], score:number};
    this.board = s.board.slice();
    this.score = s.score;
    this.undos_left -= 1;
    this.state = 'playing';
    return true;
  }

  advanceTime(ms:number) {
    // deterministic no-op time advancement hook for tests
    // Game has no time-based behavior, but expose this so tests can call it without affecting RNG/state.
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
  const best = Math.max(...g.board);
  return `
${rows.join('
')}
score: ${g.score}
moves: ${g.moves}
state: ${g.state}
preset: ${g.preset}
undos_left: ${g.undos_left}
best: ${best}
`;
}
