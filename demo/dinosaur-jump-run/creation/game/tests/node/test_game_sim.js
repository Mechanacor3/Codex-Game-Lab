import { Game } from '../../dist/game.runtime.mjs'

function assert(cond, msg){ if(!cond){ console.error('FAIL:',msg); process.exit(1) } }

const g = new Game()
// advance 10 seconds
g.advanceTime(10000)
const s = g.render_to_text()
console.log('after 10s ->', s)
assert(s.score > 0, 'score should increase after 10s')
console.log('PASS: score increased')

// force spawn at player's x to collide
g.reset()
const obs = { x: g.player.x + 10, y: g.player.y, w: 20, h: 32, type: 'cactus' }
g.obstacles.push(obs)
// step a tiny amount
g.advanceTime(16)
const s2 = g.render_to_text()
console.log('after collision ->', s2)
assert(s2.game_over === true, 'game_over should be set after forced collision')
console.log('PASS: forced collision sets game_over')

console.log('ALL NODE TESTS PASSED')
process.exit(0)
