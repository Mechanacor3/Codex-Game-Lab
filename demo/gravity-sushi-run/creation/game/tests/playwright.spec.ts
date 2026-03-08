import { test, expect } from '@playwright/test';
import path from 'path';

const indexPath = `file://${path.resolve(__dirname, '..', 'index.html')}`;

test('stable drop increases score', async ({ page }) => {
  await page.goto(indexPath);
  const before = await page.evaluate(() => {
    return window.render_game_to_text();
  });
  // force deterministic light piece
  await page.evaluate(() => { window.setDropSeed(42); window.setStateForTest({ plateX:200, score:0, timerMs:60000, state:'running' }); });
  await page.evaluate(() => { window.drop(); window.advanceTime(3000); });
  const after = await page.evaluate(() => window.render_game_to_text());
  // parse
  const parse = s => Object.fromEntries(s.split(',').map(p=>p.split(':')));
  const a = parse(after);
  expect(Number(a.score)).toBeGreaterThan(0);
});

test('unstable stack can topple', async ({ page }) => {
  await page.goto(indexPath);
  await page.evaluate(() => { window.setDropSeed(9999); window.setStateForTest({ plateX:40, score:0, timerMs:60000, state:'running' }); });
  // drop heavy off-center to provoke instability
  await page.evaluate(() => { window.drop(); window.advanceTime(3000); });
  const out = await page.evaluate(() => window.render_game_to_text());
  expect(out).toContain('stability:unstable');
});

test('timer reaches game_over', async ({ page }) => {
  await page.goto(indexPath);
  await page.evaluate(() => { window.setStateForTest({ timerMs:60000, state:'running' }); window.advanceTime(60000); });
  const out = await page.evaluate(() => window.render_game_to_text());
  expect(out).toContain('state:game_over');
});
