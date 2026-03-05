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
  // advance 10s
  await page.evaluate(() => (window as any).advanceTime(10000));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  expect(txt).toContain('score=');
  // extract score
  const m = txt.match(/score=(\d+)/);
  expect(m).not.toBeNull();
  const score = parseInt(m![1], 10);
  expect(score).toBeGreaterThan(0);
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
