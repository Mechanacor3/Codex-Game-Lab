// runtime module for Node-based deterministic tests
export class Game {
  constructor() {
    this.width = 800
    this.height = 200
    this.player = { x: 80, y: 0, w: 44, h: 44, vy: 0, grounded: true }
    this.obstacles = []
    this.speed = 160
    this.distance = 0
    this.lastSpawn = 0
    this.spawnInterval = 1500
    this.gravity = 2000
    this.game_over = false
    this.player.y = this.height - this.player.h - 10
  }
  reset(){
    this.obstacles = []
    this.distance = 0
    this.lastSpawn = 0
    this.game_over = false
    this.player.vy = 0
    this.player.grounded = true
    this.player.y = this.height - this.player.h - 10
  }
  update(dt){
    if (this.game_over) return
    this.distance += this.speed * dt
    this.lastSpawn += dt*1000
    if (this.lastSpawn >= this.spawnInterval){
      this.lastSpawn = 0
      this.obstacles.push({ x: this.width + 10, y: this.height - 32 - 10, w: 20, h: 32, type: 'cactus' })
    }
    for (const o of this.obstacles) o.x -= this.speed * dt
    this.obstacles = this.obstacles.filter(o => o.x + o.w > -50)
    this.player.vy += this.gravity * dt
    this.player.y += this.player.vy * dt
    const groundY = this.height - this.player.h - 10
    if (this.player.y >= groundY){ this.player.y = groundY; this.player.vy = 0; this.player.grounded = true }
    for (const o of this.obstacles){ if (!(this.player.x + this.player.w < o.x || this.player.x > o.x + o.w || this.player.y + this.player.h < o.y || this.player.y > o.y + o.h)){ this.game_over = true } }
  }
  jump(){ if (this.player.grounded){ this.player.vy = -650; this.player.grounded = false } }
  advanceTime(ms){ const step=1000/60; let remaining=ms; while(remaining>0){ const dtms=Math.min(step,remaining); this.update(dtms/1000); remaining-=dtms } }
  render_to_text(){ return { score: Math.floor(this.distance), game_over: this.game_over, player:{x:Math.round(this.player.x), y:Math.round(this.player.y)}, obstacles:this.obstacles.map(o=>({x:Math.round(o.x), w:o.w, type:o.type})) } }
}
