import { test, expect } from '@playwright/test';
import path from 'path';
const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');

test('merge produces correct tile and score (no spawn)', async ({ page }) => {
  await page.goto(fileUrl);
  await page.evaluate(()=>{ window.setSeed(1234); window.setBoard([[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); });
  // use no-spawn move to assert the merge deterministically
  await page.evaluate(()=> window.moveNoSpawn('left'));
  const txt = await page.evaluate(()=> window.render_game_to_text());
  expect(txt).toContain('4 0 0 0');
  expect(txt).toContain('Score: 4');
});

test('chain merges and score accumulation', async ({ page }) => {
  await page.goto(fileUrl);
  // row that chains: [2,2,4,4] -> left => [4,8,0,0] score += 4+8 = 12
  await page.evaluate(()=>{ window.setSeed(42); window.setBoard([[2,2,4,4],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); });
  await page.evaluate(()=> window.moveNoSpawn('left'));
  const txt = await page.evaluate(()=> window.render_game_to_text());
  expect(txt).toContain('4 8 0 0');
  expect(txt).toContain('Score: 12');
});

test('loss detection', async ({ page }) => {
  await page.goto(fileUrl);
  // fill board with a pattern that has no merges
  const b = [
    [2,4,2,4],
    [4,2,4,2],
    [2,4,2,4],
    [4,2,4,8]
  ];
  await page.evaluate((board)=>{ window.setSeed(7); window.setBoard(board); }, b);
  const txt = await page.evaluate(()=> window.render_game_to_text());
  expect(txt).toContain('State: lost');
});
