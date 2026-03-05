import { test, expect } from '@playwright/test';
import path from 'path';

const INDEX = 'file://' + path.join(process.cwd(), 'game', 'index.html');

test('stable drop increases score', async ({ page }) => {
  await page.goto(INDEX);
  // seed for a light piece
  await page.evaluate(() => (window as any).setDropSeed(12345));
  const before = await page.evaluate(() => (window as any).render_game_to_text());
  await page.evaluate(() => (window as any).drop());
  // advance to allow settling
  await page.evaluate(() => (window as any).advanceTime(1000));
  const after = await page.evaluate(() => (window as any).render_game_to_text());
  const beforeScore = Number(before.split(',')[0]);
  const afterScore = Number(after.split(',')[0]);
  expect(afterScore).toBeGreaterThan(beforeScore);
});

test('unstable stack can topple', async ({ page }) => {
  await page.goto(INDEX);
  // Create a precarious stack off-center
  const baseX = 600 / 2;
  const far = baseX + 60; // far to the right
  const pieces = [ { x: far, weight: 3 }, { x: far, weight: 3 } ];
  await page.evaluate((p) => (window as any).setStateForTest({ pieces: p, timeRemaining: 60000, score: 0 }), pieces);
  // Now drop a moderately heavy piece at same offset
  await page.evaluate(() => (window as any).setDropSeed(99999));
  await page.evaluate(() => (window as any).drop());
  // advance to settle
  await page.evaluate(() => (window as any).advanceTime(1000));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  const parts = txt.split(',');
  const stability = parts[3];
  const state = parts[4];
  expect(stability).toBe('unstable');
  expect(state).toBe('game_over');
});

test('timer reaches game_over', async ({ page }) => {
  await page.goto(INDEX);
  // set timer low
  await page.evaluate(() => (window as any).setStateForTest({ timeRemaining: 50, score: 0 }));
  await page.evaluate(() => (window as any).advanceTime(200));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  const state = txt.split(',')[4];
  expect(state).toBe('game_over');
});
