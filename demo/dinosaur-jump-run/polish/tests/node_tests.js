const fs = require('fs');
const vm = require('vm');
const { performance } = require('perf_hooks');

function makeContext() {
  const ctx = {
    console,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    performance,
    Math,
    Date,
  };
  // window alias
  ctx.window = {};
  // requestAnimationFrame: call cb async with timestamp
  ctx.requestAnimationFrame = function(cb) { return setTimeout(() => cb(performance.now()), 0); };
  return ctx;
}

function run() {
  const script = fs.readFileSync(__dirname + '/../game/dist/main.js', 'utf8');
  const ctx = makeContext();
  vm.createContext(ctx);
  // run the compiled main.js in the context; it assigns to window
  vm.runInContext(script, ctx);
  const w = ctx.window;
  if (typeof w.advanceTime !== 'function' || typeof w.render_game_to_text !== 'function') {
    throw new Error('hooks missing');
  }
  // advance 10s (enter medium phase expected)
  w.advanceTime(10000);
  const txt = w.render_game_to_text();
  if (!/score=\d+/.test(txt)) throw new Error('score missing');
  console.log('score text:', txt);
  const m = txt.match(/score=(\d+)/);
  const score = parseInt(m[1], 10);
  if (!(score > 0)) throw new Error('score not > 0');
  console.log('score test passed ->', score);
  // collision test
  w.__GAME.obstacles.push({ x: w.__GAME.playerX + 10, w:40, h:40 });
  w.advanceTime(10);
  const txt2 = w.render_game_to_text();
  console.log('post-collision text:', txt2);
  if (!txt2.includes('game_over=true')) throw new Error('collision failed');
  console.log('collision test passed');
  // phase transition checks
  // advance to just before medium
  const g = w.__GAME;
  g.time = 19990; g.obstacles = [];
  // clear game_over so updates proceed
  g.game_over = false; g.playerY = 0; g.playerVy = 0; g.spawnTimer = 0;
  w.advanceTime(5);
  const t1 = w.render_game_to_text();
  if (!t1.startsWith('phase=easy')) throw new Error('phase did not remain easy')
  // advance into medium
  w.advanceTime(10010);
  const t2 = w.render_game_to_text();
  if (!t2.startsWith('phase=medium')) throw new Error('phase did not transition to medium')
  // advance into hard
  w.advanceTime(40000);
  const t3 = w.render_game_to_text();
  if (!t3.startsWith('phase=hard')) throw new Error('phase did not transition to hard')
  console.log('phase tests passed')
}

try { run(); console.log('ALL OK'); process.exit(0);} catch (e) { console.error(e.stack); process.exit(2);} 
