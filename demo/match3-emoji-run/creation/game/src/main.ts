import Board from './game';
import {drawBoard} from './render';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const board = new Board(12345);

drawBoard(canvas, board);

let selected: [number,number] | null = null;

function posToCell(x:number,y:number){
  const rect = canvas.getBoundingClientRect();
  const cx = x - rect.left; const cy = y - rect.top;
  const c = Math.floor(cx / (canvas.width / 8));
  const r = Math.floor(cy / (canvas.height / 8));
  return [r,c] as [number,number];
}

canvas.addEventListener('pointerdown', (e)=>{
  const [r,c] = posToCell(e.clientX,e.clientY);
  if(!selected) selected = [r,c];
  else{
    const [r0,c0] = selected;
    const dr = Math.abs(r-r0), dc=Math.abs(c-c0);
    if((dr===1 && dc===0) || (dr===0 && dc===1)){
      const ok = board.swap(r0,c0,r,c);
      drawBoard(canvas, board);
    }
    selected = null;
  }
});

// deterministic hooks for testing
// advanceTime(ms) will be a no-op here because resolution is immediate
(window as any).advanceTime = function(ms:number){
  // placeholder for animation stepping; resolution happens synchronously in this simple impl
  return;
}

(window as any).render_game_to_text = function(){
  const rows = board.toEmojiRows().join('\n');
  return `SCORE:${board.score}\nCOMBO:${board.combo}\n${rows}`;
}

// test API
(window as any).test_api = {
  set_board(arr:number[]){ board.setGrid(arr); drawBoard(canvas, board); },
  get_board(){ return board.grid.slice(); },
  swap(r1:number,c1:number,r2:number,c2:number){ return board.swap(r1,c1,r2,c2); },
  score(){ return board.score },
  reset(seed?:number){ const s = seed ?? 12345; (window as any).test_api = (window as any).test_api; }
}

export { board };
