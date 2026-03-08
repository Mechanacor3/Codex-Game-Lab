import { test, expect } from '@playwright/test';
import path from 'path';

const fileUrl = (p: string) => 'file://' + p;
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');

test('undo restores prior board and score', async ({ page }) => {
  await page.goto(fileUrl(indexPath));
  await page.evaluate(() => {
    (window as any).setSeed(42);
    (window as any).setBoard([
      [2,2,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ]);
  });
  const before = await page.evaluate(() => (window as any).render_game_to_text());
  await page.keyboard.press('ArrowLeft');
  await page.evaluate(() => (window as any).advanceTime(10));
  // undo via exposed API
  await page.evaluate(() => (window as any).undo());
  const afterUndo = await page.evaluate(() => (window as any).render_game_to_text());
  expect(afterUndo).toBe(before);
});

test('preset differences affect spawn distribution (deterministic)', async ({ page }) => {
  await page.goto(fileUrl(indexPath));
  const counts = await page.evaluate(() => {
    const N = 200;
    const runFor = (preset: 'casual' | 'spicy') => {
      const g = (window as any).game as any;
      g.setPreset(preset);
      // reset seed to a known value
      g.setSeed(12345);
      let fours = 0;
      for (let i=0;i<N;i++) {
        // clear board
        g.setBoard([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
        // spawn one tile using underlying RNG stream
        // call spawnRandomTile directly (method is accessible at runtime)
        g.spawnRandomTile();
        // count if 4
        for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (g.board[r][c] === 4) fours++;
      }
      return fours;
    };
    const casual = runFor('casual');
    const spicy = runFor('spicy');
    return { casual, spicy };
  });
  // spicy should produce more 4s than casual
  expect(counts.spicy).toBeGreaterThan(counts.casual);
});

test('win state still triggers correctly', async ({ page }) => {
  await page.goto(fileUrl(indexPath));
  await page.evaluate(() => {
    (window as any).setSeed(99);
    (window as any).setBoard([
      [1024,1024,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ]);
  });
  await page.keyboard.press('ArrowLeft');
  await page.evaluate(() => (window as any).advanceTime(10));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  expect(txt).toContain('State: won');
});
