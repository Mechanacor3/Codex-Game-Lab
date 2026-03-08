const fs = require('fs');
const { JSDOM } = require('jsdom');

function run() {
  const html = fs.readFileSync(__dirname + '/../game/dist/index.html', 'utf8');
  const script = fs.readFileSync(__dirname + '/../game/dist/main.js', 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', resources: 'usable' });
  // evaluate script in window
  dom.window.eval(script);
  const w = dom.window;
  if (!w.advanceTime || !w.render_game_to_text) throw new Error('hooks missing');
  w.advanceTime(10000);
  const txt = w.render_game_to_text();
  if (!/score=\d+/.test(txt)) throw new Error('score missing');
  console.log('score test passed ->', txt.match(/score=(\d+)/)[1]);
  // collision test
  w.__GAME.obstacles.push({ x: w.__GAME.playerX + 10, w:40, h:40 });
  w.advanceTime(10);
  const txt2 = w.render_game_to_text();
  if (!txt2.includes('game_over=true')) throw new Error('collision failed');
  console.log('collision test passed');
}

try { run(); console.log('ALL OK'); process.exit(0);} catch (e) { console.error(e.stack); process.exit(2);} 
