// TypeScript source (mirror of the runtime JS embedded in index.html)
export type Piece = { x:number, y:number, w:number, h:number, weight:number };

export interface GameState {
  score:number;
  timerMs:number;
  state:string;
  plateX:number;
  pieces:Piece[];
}

// (source-only; runtime uses embedded JS in index.html)
