export type Direction = 'left' | 'right' | 'up' | 'down';

class Scheduler {
  private time = 0;
  private tasks: Array<{runAt:number, fn: () => void}> = [];
  schedule(fn: () => void, delay = 0) {
    this.tasks.push({ runAt: this.time + delay, fn });
  }
  advance(ms: number) {
    this.time += ms;
    // run tasks in order whose runAt <= time
    this.tasks.sort((a,b) => a.runAt - b.runAt);
    while (this.tasks.length && this.tasks[0].runAt <= this.time) {
      const t = this.tasks.shift()!;
      try { t.fn(); } catch(e) { console.error(e); }
    }
  }
}

export class Game {
  board: number[][] = [];
  score = 0;
  moves = 0;
  state: 'running' | 'won' | 'lost' = 'running';
  rngState = 1;
  scheduler = new Scheduler();

  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array.from({length:4}, () => Array.from({length:4}, () => 0));
    this.score = 0;
    this.moves = 0;
    this.state = 'running';
    // deterministic default seed
    this.rngState = 123456;
    // spawn two tiles
    this.spawnRandomTile();
    this.spawnRandomTile();
  }

  setSeed(seed: number) { this.rngState = seed; }

  setBoard(arr: number[][]) {
    if (!Array.isArray(arr) || arr.length !== 4) throw new Error('board must be 4x4');
    this.board = arr.map(row => row.slice(0,4).concat(Array(4-row.length).fill(0))).slice(0,4);
    this.updateState();
  }

  getEmptyCells() {
    const res: number[] = [];
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (this.board[r][c] === 0) res.push(r*4+c);
    return res;
  }

  // simple LCG
  private rand() {
    // constants from Numerical Recipes
    this.rngState = (1664525 * (this.rngState >>> 0) + 1013904223) >>> 0;
    return (this.rngState >>> 0) / 4294967296;
  }

  private spawnRandomTile() {
    const empties = this.getEmptyCells();
    if (empties.length === 0) return;
    const idx = Math.floor(this.rand() * empties.length);
    const cell = empties[idx];
    const r = Math.floor(cell / 4), c = cell % 4;
    const value = this.rand() < 0.10 ? 4 : 2; // 90% 2, 10% 4
    this.board[r][c] = value;
  }

  // schedule spawn to allow deterministic advanceTime
  private scheduleSpawn() {
    this.scheduler.schedule(() => { this.spawnRandomTile(); this.updateState(); }, 0);
  }

  // core merge for a single row (moving left) returns {newRow, gainedScore}
  private mergeRowLeft(row: number[]) {
    const tiles = row.filter(v => v !== 0);
    let gained = 0;
    const out: number[] = [];
    for (let i=0;i<tiles.length;i++) {
      if (i+1 < tiles.length && tiles[i] === tiles[i+1]) {
        const merged = tiles[i]*2;
        out.push(merged);
        gained += merged;
        i++; // skip next
      } else {
        out.push(tiles[i]);
      }
    }
    while (out.length < 4) out.push(0);
    return { newRow: out, gained };
  }

  move(dir: Direction) {
    if (this.state !== 'running') return false;
    let changed = false;
    let totalGained = 0;
    if (dir === 'left' || dir === 'right') {
      for (let r=0;r<4;r++) {
        const row = this.board[r].slice();
        let processed;
        if (dir === 'left') {
          processed = this.mergeRowLeft(row);
        } else {
          processed = this.mergeRowLeft(row.slice().reverse());
          processed.newRow = processed.newRow.reverse();
        }
        if (!arraysEqual(processed.newRow, this.board[r])) {
          changed = true;
          this.board[r] = processed.newRow;
        }
        totalGained += processed.gained;
      }
    } else {
      // up/down operate on columns
      for (let c=0;c<4;c++) {
        const col = [this.board[0][c], this.board[1][c], this.board[2][c], this.board[3][c]];
        let processed;
        if (dir === 'up') {
          processed = this.mergeRowLeft(col);
        } else {
          processed = this.mergeRowLeft(col.slice().reverse());
          processed.newRow = processed.newRow.reverse();
        }
        for (let r=0;r<4;r++) {
          if (this.board[r][c] !== processed.newRow[r]) changed = true;
          this.board[r][c] = processed.newRow[r];
        }
        totalGained += processed.gained;
      }
    }

    if (changed) {
      this.score += totalGained;
      this.moves += 1;
      // schedule spawn (deterministic via scheduler)
      this.scheduleSpawn();
      this.updateState();
    }
    return changed;
  }

  updateState() {
    // check win
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (this.board[r][c] === 2048) this.state = 'won';
    // check any moves left
    if (this.state !== 'won') {
      const empties = this.getEmptyCells();
      if (empties.length === 0) {
        // check if any merge possible
        let possible = false;
        for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
          const v = this.board[r][c];
          if (r+1<4 && this.board[r+1][c] === v) possible = true;
          if (c+1<4 && this.board[r][c+1] === v) possible = true;
        }
        if (!possible) this.state = 'lost';
      }
    }
  }

  render_game_to_text() {
    const lines: string[] = [];
    for (let r=0;r<4;r++) lines.push(this.board[r].map(v => v.toString()).join(' '));
    lines.push(`Score: ${this.score}`);
    lines.push(`Moves: ${this.moves}`);
    lines.push(`State: ${this.state}`);
    return lines.join('\n');
  }

  // helper used by tests or page to advance scheduled tasks
  advanceTime(ms: number) { this.scheduler.advance(ms); }
}

function arraysEqual(a:number[], b:number[]) {
  if (a.length !== b.length) return false;
  for (let i=0;i<a.length;i++) if (a[i] !== b[i]) return false;
  return true;
}

// expose in browser
const globalAny: any = (typeof window !== 'undefined') ? window : globalThis;
if (globalAny) {
  globalAny.Game = Game;
}

export default Game;
