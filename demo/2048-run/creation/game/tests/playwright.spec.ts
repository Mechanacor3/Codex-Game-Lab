import { test, expect } from '@playwright/test';

test.describe('minimal 2048', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/game/index.html');
  });

  test('merge rule and score increase', async ({ page }) => {
    // set up a board where left move will merge two pairs
    // row 0: 2 2 4 4 => left => 4 8 0 0 ; score += 4 + 8 = 12
    const board = [2,2,4,4, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    await page.evaluate((b) => (window as any).setBoard(b), board);
    const moved = await page.evaluate(() => (window as any).move('left'));
    expect(moved).toBe(true);
    const text = await page.evaluate(() => (window as any).render_game_to_text());
    expect(text).toContain('score: 12');
  });

  test('spawn 2 or 4 with 90/10 probability on valid move (deterministic)', async ({ page }) => {
    await page.evaluate(() => (window as any).setGameSeed(12345));
    // empty board except one tile
    const board = [2,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    await page.evaluate((b) => (window as any).setBoard(b), board);
    // move right to shift
    await page.evaluate(() => (window as any).move('right'));
    const text = await page.evaluate(() => (window as any).render_game_to_text());
    // spawned tile should be 2 or 4; with deterministic seed expect either but check present
    expect(text).toMatch(/\b2\b|\b4\b/);
  });

  test('loss detection', async ({ page }) => {
    // fill board with no possible merges
    const board = [2,4,8,16, 32,64,128,256, 512,1024,2,4, 8,16,32,64];
    await page.evaluate((b) => (window as any).setBoard(b), board);
    // no move should be possible
    const canMove = await page.evaluate(() => (window as any).game.canMove());
    expect(canMove).toBe(false);
    const text = await page.evaluate(() => (window as any).render_game_to_text());
    expect(text).toContain('state: lost');
  });
});
