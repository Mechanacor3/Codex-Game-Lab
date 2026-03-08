export type Tile = number; // 0..5
export type Board = Tile[][]; // [row][col], row 0 = top

export interface GameState {
  board: Board;
  score: number;
  combo: number;
  resolving: boolean;
}
