// Compiled JS (handwritten from TS) - deterministic Dino
class Game {
  constructor() {
    this.playerX = 80;
    this.playerY = 0;
    this.playerVy = 0;
    this.gravity = -0.0015;
    this.groundY = 0;
    this.obstacles = [];
    this.time = 0;
    this.speed = 0.12;
    this.spawnTimer = 0;
    this.spawnInterval = 1500;
    this.game_over = false;
  }
  get phase(){ if (this.time<20000) return 'easy'; if (this.time<45000) return 'medium'; return 'hard'; }
  update(ms) {
    if (this.game_over) return;
    this.time += ms;
    // difficulty multipliers
    const p = this.phase;
    let speedMul = 1;
    let spawnMul = 1;
    if (p === 'easy') { speedMul = 1; spawnMul = 1; }
    else if (p === 'medium') { speedMul = 1.4; spawnMul = 1.3; }
    else if (p === 'hard') { speedMul = 1.9; spawnMul = 1.6; }
    this.playerVy += this.gravity * ms;
    this.playerY += this.playerVy * ms;
    if (this.playerY < this.groundY) {
      this.playerY = this.groundY;
      this.playerVy = 0;
    }
    for (const o of this.obstacles) {
      o.x -= this.speed * speedMul * ms;
    }
    this.spawnTimer += ms;
    const curSpawnInterval = Math.max(300, this.spawnInterval / spawnMul);
    if (this.spawnTimer >= curSpawnInterval) {
      this.spawnTimer -= curSpawnInterval;
      var w = 20 + (Math.floor(this.time / 1000) % 3) * 4;
      this.obstacles.push({ x: 700, w: w, h: 40 });
    }
    this.obstacles = this.obstacles.filter(o => o.x + o.w > -50);
    for (const o of this.obstacles) {
      const px = this.playerX;
      const py = this.playerY;
      const pw = 40;
      const ph = 40;
      const ox = o.x;
      const oy = 0;
      const ow = o.w;
      const oh = o.h;
      const overlapX = px < ox + ow && px + pw > ox;
      const overlapY = py < oy + oh && py + ph > oy;
      if (overlapX && overlapY) {
        this.game_over = true;
      }
    }
  }
  get score() { return Math.floor(this.time * this.speed); }
  render_text() {
    const obs = this.obstacles.map(o => `${Math.round(o.x)}:${o.w}x${o.h}`).join(',');
    return `phase=${this.phase} | P@${Math.round(this.playerX)},${Math.round(this.playerY)} | obstacles=${this.obstacles.length}:${obs} | score=${this.score} | game_over=${this.game_over}`;
  }
}
window.__GAME = new Game();
window.advanceTime = function(ms) { window.__GAME.update(ms); };
window.render_game_to_text = function() { return window.__GAME.render_text(); };
let last = performance.now();
function rafTick(t) {
  const dt = t - last; last = t; window.__GAME.update(dt); requestAnimationFrame(rafTick);
}
requestAnimationFrame(rafTick);
// --- Lightweight visual & UI polish (appended, keeps deterministic hooks) ---
;(function(){
  // Skip visual layer when no DOM (node tests)
  if (typeof document === "undefined" || typeof window.document === "undefined") { return; }
  const g = window.__GAME;
  // create a simple canvas for visuals
  const cvs = document.createElement('canvas'); cvs.width = 800; cvs.height = 200;
  cvs.style.width='800px'; cvs.style.height='200px'; cvs.style.display='block'; cvs.style.margin='8px auto';
  document.body.insertBefore(cvs, document.body.firstChild);
  const ctx = cvs.getContext('2d');

  // overlays
  const startOverlay = document.createElement('div');
  startOverlay.id = 'startOverlay';
  startOverlay.style.position='absolute'; startOverlay.style.left='0'; startOverlay.style.right='0';
  startOverlay.style.top='40px'; startOverlay.style.textAlign='center'; startOverlay.style.fontFamily='sans-serif';
  startOverlay.innerHTML = '<div style="display:inline-block;padding:18px 28px;background:rgba(0,0,0,0.8);color:#fff;border-radius:8px">Press Space or Tap to Start</div>';
  document.body.appendChild(startOverlay);

  const gameOverOverlay = document.createElement('div');
  gameOverOverlay.id = 'gameOverOverlay';
  gameOverOverlay.style.position='absolute'; gameOverOverlay.style.left='0'; gameOverOverlay.style.right='0';
  gameOverOverlay.style.top='40px'; gameOverOverlay.style.textAlign='center'; gameOverOverlay.style.fontFamily='sans-serif';
  gameOverOverlay.style.display='none';
  gameOverOverlay.innerHTML = '<div style="display:inline-block;padding:18px 28px;background:rgba(0,0,0,0.85);color:#fff;border-radius:8px">Game Over<br/><button id="restartBtn" style="margin-top:8px;padding:6px 10px">Restart</button></div>';
  document.body.appendChild(gameOverOverlay);

  // visual state
  let squash = 1;
  let dusts = [];
  function spawnDust(x,y){ dusts.push({x,y,life:300}) }

  // Input: keyboard + touch to trigger jump (non-invasive)
  function doJump(){ const G = window.__GAME; if (G.game_over) return; if (G.playerY === G.groundY){ G.playerVy = 0.45; squash = 0.8 } }
  window.addEventListener('keydown', (e)=>{ if (e.code === 'Space' || e.code === 'ArrowUp'){ e.preventDefault(); if (startOverlay.style.display !== 'none'){ startOverlay.style.display = 'none'; } doJump(); } });
  window.addEventListener('touchstart', (e)=>{ e.preventDefault(); if (startOverlay.style.display !== 'none'){ startOverlay.style.display = 'none'; } doJump(); }, {passive:false});

  // restart behavior: reset fields on the existing game object (keep hooks intact)
  document.addEventListener('click', (ev)=>{ const t = ev.target; if (t && t.id === 'restartBtn'){ const G = window.__GAME; G.time = 0; G.obstacles = []; G.playerY = 0; G.playerVy = 0; G.spawnTimer = 0; G.game_over = false; startOverlay.style.display='none'; gameOverOverlay.style.display='none'; } });

  // drawing loop
  function draw(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    ctx.fillStyle = '#f3f3f3'; ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.fillStyle = '#ddd'; ctx.fillRect(0,150,cvs.width,50);
    const G = window.__GAME;
    // obstacles
    ctx.fillStyle = '#6b8e23'; for(const o of G.obstacles){ ctx.fillRect(Math.round(o.x), 110 - o.h, o.w, o.h); }
    // player with squash/stretch
    squash += (G.playerY === G.groundY ? (1 - squash) : (0.95 - squash)) * 0.18;
    const sw = 40 * (1/squash); const sh = 40 * squash;
    const py = 110 - G.playerY - 40;
    ctx.fillStyle = '#333'; ctx.fillRect(G.playerX, Math.round(py), sw, Math.round(sh));
    // dusts
    for(let i=dusts.length-1;i>=0;i--){ const d = dusts[i]; d.life -= 16; if (d.life<=0) dusts.splice(i,1); else { ctx.fillStyle = 'rgba(120,120,120,'+(d.life/300)+')'; ctx.beginPath(); ctx.arc(d.x, d.y, 4*(d.life/300),0,Math.PI*2); ctx.fill(); }}
    // overlays
    if (G.game_over){ gameOverOverlay.style.display = 'block'; }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // landing detection via advanceTime wrapper (deterministic)
  const origAdvance = window.advanceTime;
  let prevY = window.__GAME.playerY;
  window.advanceTime = function(ms){ origAdvance(ms); const G = window.__GAME; if (prevY > G.playerY && G.playerY === G.groundY){ spawnDust(G.playerX + 20, 150); } prevY = G.playerY; };
})();
