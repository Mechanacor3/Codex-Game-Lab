// Simple deterministic Dino Runner (TypeScript source)
interface Obstacle { x: number; w: number; h: number }
class Game {
  playerX = 80
  playerY = 0
  playerVy = 0
  gravity = -0.0015
  groundY = 0
  obstacles: Obstacle[] = []
  time = 0
  speed = 0.12 // px per ms (base)
  spawnTimer = 0
  spawnInterval = 1500 // base
  game_over = false
  constructor() {}
  // difficulty phases: easy (0-20s), medium (20-45s), hard (45s+)
  get phase() {
    if (this.time < 20000) return 'easy'
    if (this.time < 45000) return 'medium'
    return 'hard'
  }
  update(ms: number) {
    if (this.game_over) return
    this.time += ms
    // adjust difficulty multipliers per phase
    const p = this.phase
    let speedMul = 1
    let spawnMul = 1
    if (p === 'easy') { speedMul = 1; spawnMul = 1 }
    else if (p === 'medium') { speedMul = 1.4; spawnMul = 1.3 }
    else if (p === 'hard') { speedMul = 1.9; spawnMul = 1.6 }

    // player physics (y where 0 is ground)
    this.playerVy += this.gravity * ms
    this.playerY += this.playerVy * ms
    if (this.playerY < this.groundY) {
      this.playerY = this.groundY
      this.playerVy = 0
    }
    // move obstacles
    for (const o of this.obstacles) {
      o.x -= this.speed * speedMul * ms
    }
    // spawn
    this.spawnTimer += ms
    const curSpawnInterval = Math.max(300, this.spawnInterval / spawnMul)
    if (this.spawnTimer >= curSpawnInterval) {
      this.spawnTimer -= curSpawnInterval
      // vary obstacle size slightly deterministically by time
      const w = 20 + (Math.floor(this.time / 1000) % 3) * 4
      this.obstacles.push({ x: 700, w, h: 40 })
    }
    // cull
    this.obstacles = this.obstacles.filter(o => o.x + o.w > -50)
    // collision check (player treated as 40x40 box at playerX, playerY)
    for (const o of this.obstacles) {
      const px = this.playerX
      const py = this.playerY
      const pw = 40
      const ph = 40
      const ox = o.x
      const oy = 0
      const ow = o.w
      const oh = o.h
      const overlapX = px < ox + ow && px + pw > ox
      const overlapY = py < oy + oh && py + ph > oy
      if (overlapX && overlapY) {
        this.game_over = true
      }
    }
  }
  get score() { return Math.floor(this.time * this.speed) }
  render_text() {
    const obs = this.obstacles.map(o => `${Math.round(o.x)}:${o.w}x${o.h}`).join(',')
    return `phase=${this.phase} | P@${Math.round(this.playerX)},${Math.round(this.playerY)} | obstacles=${this.obstacles.length}:${obs} | score=${this.score} | game_over=${this.game_over}`
  }
}

// Expose deterministic hooks
;(window as any).__GAME = new Game()
;(window as any).advanceTime = function(ms: number) { (window as any).__GAME.update(ms) }
;(window as any).render_game_to_text = function() { return (window as any).__GAME.render_text() }

// Also incrementally advance using requestAnimationFrame for normal play if loaded in a browser
let last = performance.now()
function rafTick(t: number) {
  const dt = t - last
  last = t
  (window as any).__GAME.update(dt)
  requestAnimationFrame(rafTick)
}
requestAnimationFrame(rafTick)
