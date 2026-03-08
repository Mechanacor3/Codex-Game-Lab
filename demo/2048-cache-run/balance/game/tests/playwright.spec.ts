import { test, expect } from '@playwright/test';
import path from 'path';

const fileUrl = (p: string) => 'file://' + p;
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');

test('merge produces expected tile and score', async ({ page }) => {
  await page.goto(fileUrl(indexPath));
  // set deterministic seed and board with two adjacent 2s in first row
  await page.evaluate(() => {
    (window as any).setSeed(42);
    (window as any).setBoard([
      [2,2,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ]);
  });
  // press left
  await page.keyboard.press('ArrowLeft');
  // advance time to flush spawn
  await page.evaluate(() => (window as any).advanceTime(10));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  // expect first row merged to 4 ... and score 4, moves 1
  expect(txt).toContain('4 0 0 0');
  expect(txt).toContain('Score: 4');
  expect(txt).toContain('Moves: 1');
});

test('score increases by merged values', async ({ page }) => {
  await page.goto(fileUrl(indexPath));
  await page.evaluate(() => {
    (window as any).setSeed(100);
    (window as any).setBoard([
      [4,4,4,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ]);
  });
  await page.keyboard.press('ArrowLeft');
  await page.evaluate(() => (window as any).advanceTime(10));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  // merging [4,4,4,0] left => [8,4,0,0] gained 8
  expect(txt).toContain('8 4 0 0');
  expect(txt).toContain('Score: 8');
  expect(txt).toContain('Moves: 1');
});

test('detects loss state when no moves available', async ({ page }) => {
  await page.goto(fileUrl(indexPath));
  // fill board with no adjacent equals
  await page.evaluate(() => {
    (window as any).setSeed(7);
    (window as any).setBoard([
      [2,4,2,4],
      [4,2,4,2],
      [2,4,2,4],
      [4,2,4,2]
    ]);
  });
  const txtBefore = await page.evaluate(() => (window as any).render_game_to_text());
  expect(txtBefore).toContain('State: lost');
});
