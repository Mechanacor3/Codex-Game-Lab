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
  update(ms) {
    if (this.game_over) return;
    this.time += ms;
    this.playerVy += this.gravity * ms;
    this.playerY += this.playerVy * ms;
    if (this.playerY < this.groundY) {
      this.playerY = this.groundY;
      this.playerVy = 0;
    }
    for (const o of this.obstacles) {
      o.x -= this.speed * ms;
    }
    this.spawnTimer += ms;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.obstacles.push({ x: 700, w: 20, h: 40 });
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
    return `P@${Math.round(this.playerX)},${Math.round(this.playerY)} | obstacles=${obs} | score=${this.score} | game_over=${this.game_over}`;
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
