import { Game } from './game'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!
const game = new Game()

function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height)
  // ground
  ctx.fillStyle = '#eee'
  ctx.fillRect(0, canvas.height-10, canvas.width, 10)
  // player
  ctx.fillStyle = '#333'
  ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h)
  // obstacles
  ctx.fillStyle = '#0b0'
  for (const o of game.obstacles) ctx.fillRect(o.x, o.y, o.w, o.h)
  // hud
  ctx.fillStyle = '#000'
  ctx.fillText('Score: ' + Math.floor(game.distance), 10, 20)
  if (game.game_over) ctx.fillText('GAME OVER', 350, 80)
}

// main loop uses requestAnimationFrame if no external stepping
let last = performance.now()
function loop(now = performance.now()) {
  const dt = (now - last) / 1000
  last = now
  game.update(dt)
  render()
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

// hooks
;(window as any).game = game
;(window as any).advanceTime = (ms:number) => {
  game.advanceTime(ms)
  render()
}
;(window as any).render_game_to_text = () => JSON.stringify(game.render_to_text())

// keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'ArrowUp') game.jump()
})

