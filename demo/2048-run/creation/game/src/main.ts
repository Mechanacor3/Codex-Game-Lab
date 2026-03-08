// TS entry (mirrors runtime) - included for source completeness
import { Game } from './game';

declare global{ interface Window { __game:any; setSeed:any; setBoard:any; getBoard:any; move:any; moveNoSpawn:any; render_game_to_text:any; advanceTime:any; } }

const g = new Game(1);
window.__game = g;
window.setSeed = (s:number)=> g.setSeed(s);
window.setBoard = (b:number[][])=> { g.setBoard(b); };
window.getBoard = ()=> g.getBoard();
window.move = (d:'left'|'right'|'up'|'down')=> g.move(d);
window.moveNoSpawn = (d:'left'|'right'|'up'|'down')=> g.moveNoSpawn(d);
window.render_game_to_text = ()=> g.renderText();
window.advanceTime = (ms:number)=> { g.time += ms; return g.time; };

window.addEventListener('keydown', (ev)=>{
  const key=ev.key;
  const map:any = {ArrowLeft:'left',ArrowUp:'up',ArrowRight:'right',ArrowDown:'down', a:'left',w:'up',d:'right',s:'down'};
  if(map[key]){
    const moved = window.move(map[key]);
    if(moved) console.log('moved', map[key]);
    window.render_game_to_text();
  }
});

export {};
