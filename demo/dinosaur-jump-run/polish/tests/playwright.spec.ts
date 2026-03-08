import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';

let server: ChildProcess | null = null;

test.beforeAll(async () => {
  server = spawn('node', ['serve.js'], { stdio: 'inherit' });
  // wait a moment
  await new Promise(r => setTimeout(r, 300));
});

test.afterAll(() => {
  if (server) server.kill();
});

test('score increases after 10s deterministic', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  // ensure the hooks exist
  await page.waitForFunction(() => !!window['advanceTime'] && !!window['render_game_to_text']);
  // advance 10s (enter medium)
  await page.evaluate(() => (window as any).advanceTime(10000));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  expect(txt).toContain('score=');
  // extract score
  const m = txt.match(/score=(\d+)/);
  expect(m).not.toBeNull();
  const score = parseInt(m![1], 10);
  expect(score).toBeGreaterThan(0);
});

test('phase transitions and determinism', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  await page.waitForFunction(() => !!window['advanceTime'] && !!window['render_game_to_text']);
  // quick phase checks
  await page.evaluate(() => { (window as any).__GAME.time = 19990; (window as any).__GAME.obstacles = []; });
  await page.evaluate(() => (window as any).advanceTime(5));
  let t1 = await page.evaluate(() => (window as any).render_game_to_text());
  expect(t1.startsWith('phase=easy')).toBeTruthy();
  await page.evaluate(() => (window as any).advanceTime(10010));
  let t2 = await page.evaluate(() => (window as any).render_game_to_text());
  expect(t2.startsWith('phase=medium')).toBeTruthy();
  await page.evaluate(() => (window as any).advanceTime(40000));
  let t3 = await page.evaluate(() => (window as any).render_game_to_text());
  expect(t3.startsWith('phase=hard')).toBeTruthy();
});

test('forced collision sets game_over', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  await page.waitForFunction(() => !!window['advanceTime'] && !!window['render_game_to_text']);
  // place an obstacle overlapping player by directly mutating __GAME
  await page.evaluate(() => {
    const g = (window as any).__GAME;
    g.obstacles.push({ x: g.playerX + 10, w: 40, h: 40 });
  });
  // advance small
  await page.evaluate(() => (window as any).advanceTime(10));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  expect(txt).toContain('game_over=true');
});


test('start overlay visible and hides on input', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  await page.waitForFunction(() => !!window['advanceTime'] && !!window['render_game_to_text']);
  await page.waitForSelector('#startOverlay');
  expect(await page.isVisible('#startOverlay')).toBeTruthy();
  await page.keyboard.press('Space');
  await page.waitForSelector('#startOverlay', { state: 'hidden' });
});

test('game-over overlay and restart resets', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  await page.waitForFunction(() => !!window['advanceTime'] && !!window['render_game_to_text']);
  // force collision
  await page.evaluate(() => {
    const g = (window as any).__GAME;
    g.obstacles.push({ x: g.playerX + 10, w: 40, h: 40 });
  });
  await page.evaluate(() => (window as any).advanceTime(10));
  await page.waitForSelector('#gameOverOverlay');
  expect(await page.isVisible('#gameOverOverlay')).toBeTruthy();
  await page.click('#restartBtn');
  await page.waitForSelector('#gameOverOverlay', { state: 'hidden' });
  const state = await page.evaluate(() => ({ time: (window as any).__GAME.time, game_over: (window as any).__GAME.game_over, obstacles: (window as any).__GAME.obstacles.length }));
  expect(state.time).toBe(0);
  expect(state.game_over).toBe(false);
  expect(state.obstacles).toBe(0);
});
