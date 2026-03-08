export type Obstacle = { x:number; y:number; w:number; h:number; type: string }

export class Game {
  width = 800
  height = 200
  player = { x: 80, y: 0, w: 44, h: 44, vy: 0, grounded: true }
  obstacles: Obstacle[] = []
  speed = 160 // px per second
  distance = 0
  lastSpawn = 0
  spawnInterval = 1500
  gravity = 2000
  game_over = false

  constructor() {
    this.player.y = this.height - this.player.h - 10
  }

  reset() {
    this.obstacles = []
    this.distance = 0
    this.lastSpawn = 0
    this.game_over = false
    this.player.vy = 0
    this.player.grounded = true
    this.player.y = this.height - this.player.h - 10
  }

  update(dt:number) {
    if (this.game_over) return
    // dt in seconds
    this.distance += this.speed * dt
    this.lastSpawn += dt*1000
    if (this.lastSpawn >= this.spawnInterval) {
      this.lastSpawn = 0
      // spawn cactus at right edge
      this.obstacles.push({ x: this.width + 10, y: this.height - 32 - 10, w: 20, h: 32, type: 'cactus' })
    }

    // move obstacles
    for (const o of this.obstacles) {
      o.x -= this.speed * dt
    }
    // remove offscreen
    this.obstacles = this.obstacles.filter(o => o.x + o.w > -50)

    // simple frictionless vertical
    this.player.vy += this.gravity * dt
    this.player.y += this.player.vy * dt
    const groundY = this.height - this.player.h - 10
    if (this.player.y >= groundY) {
      this.player.y = groundY
      this.player.vy = 0
      this.player.grounded = true
    }

    // collision
    for (const o of this.obstacles) {
      if (this._collide(this.player, o)) {
        this.game_over = true
      }
    }
  }

  _collide(p:any, o:Obstacle) {
    return !(p.x + p.w < o.x || p.x > o.x + o.w || p.y + p.h < o.y || p.y > o.y + o.h)
  }

  // player jump - instant
  jump() {
    if (this.player.grounded) {
      this.player.vy = -650
      this.player.grounded = false
    }
  }

  // deterministic stepping in ms
  advanceTime(ms:number) {
    const step = 1000/60
    let remaining = ms
    while (remaining > 0) {
      const dtms = Math.min(step, remaining)
      this.update(dtms/1000)
      remaining -= dtms
    }
  }

  render_to_text() {
    return {
      score: Math.floor(this.distance),
      game_over: this.game_over,
      player: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      obstacles: this.obstacles.map(o=>({x: Math.round(o.x), w: o.w, type: o.type}))
    }
  }
}

