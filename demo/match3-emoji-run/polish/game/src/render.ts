import Board from './game';
import {EMOJIS,ROWS,COLS} from './types';

export function drawBoard(canvas: HTMLCanvasElement, board: Board){
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cellW = canvas.width / COLS;
  const cellH = canvas.height / ROWS;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.min(cellW,cellH)*0.6}px sans-serif`;
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const t = board.at(r,c);
      const x = c*cellW + cellW/2;
      const y = r*cellH + cellH/2;
      ctx.fillText(EMOJIS[t], x, y);
    }
  }
}
