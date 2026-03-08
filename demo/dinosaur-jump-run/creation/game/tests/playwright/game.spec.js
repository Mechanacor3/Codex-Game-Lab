// Playwright test (included for CI / developer runs)
// This file expects a server to serve the Vite-built app and Playwright to be available.
// It uses the deterministic hooks exposed on window to step the game.

const { test, expect } = require('@playwright/test')

test.describe('dinosaur-jump-playwright', ()=>{
  test('score increases after 10s deterministic', async ({ page })=>{
    await page.goto('http://localhost:5173')
    // ensure hooks exist
    await expect(page.locator('canvas')).toBeVisible()
    await page.evaluate(()=> window.advanceTime(10000))
    const txt = await page.evaluate(()=> window.render_game_to_text())
    const state = JSON.parse(txt)
    expect(state.score).toBeGreaterThan(0)
  })

  test('forced collision sets game_over', async ({ page })=>{
    await page.goto('http://localhost:5173')
    await page.evaluate(()=> {
      // place obstacle at player
      const g = (window as any).game
      g.obstacles.push({ x: g.player.x+10, y: g.player.y, w:20, h:32, type:'cactus'})
      window.advanceTime(16)
    })
    const txt = await page.evaluate(()=> window.render_game_to_text())
    const state = JSON.parse(txt)
    expect(state.game_over).toBe(true)
  })
})

