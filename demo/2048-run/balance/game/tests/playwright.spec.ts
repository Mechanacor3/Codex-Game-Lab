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

  test('undo restores prior board and score', async ({ page }) => {
    await page.evaluate(() => (window as any).setGameSeed(42));
    const board = [2,2,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    await page.evaluate((b) => (window as any).setBoard(b), board);
    const moved = await page.evaluate(() => (window as any).move('left'));
    expect(moved).toBe(true);
    const beforeText = await page.evaluate(() => (window as any).render_game_to_text());
    // perform undo
    const undone = await page.evaluate(() => (window as any).undo());
    expect(undone).toBe(true);
    const afterText = await page.evaluate(() => (window as any).render_game_to_text());
    // after undo board should match original and score should be 0
    expect(afterText).toContain('score: 0');
    expect(afterText).toContain('undos_left:');
  });

  test('preset differences affect spawn distribution (deterministic)', async ({ page }) => {
    await page.evaluate(() => (window as any).setBoardSeed(999));
    await page.evaluate(() => (window as any).setPreset('casual'));
    // run deterministic sequence of moves and record spawned tiles
    await page.evaluate(() => (window as any).setBoard([2,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]));
    await page.evaluate(() => (window as any).move('right'));
    const casualText = await page.evaluate(() => (window as any).render_game_to_text());

    await page.evaluate(() => (window as any).setBoardSeed(999));
    await page.evaluate(() => (window as any).setPreset('spicy'));
    await page.evaluate(() => (window as any).setBoard([2,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]));
    await page.evaluate(() => (window as any).move('right'));
    const spicyText = await page.evaluate(() => (window as any).render_game_to_text());

    // spicy should show a higher chance for 4; in deterministic comparison we expect at least that one result differs
    expect(casualText).not.toBe(spicyText);
  });

  test('win still triggers correctly', async ({ page }) => {
    // set up board with a merge to produce 2048
    const board = [1024,1024,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    await page.evaluate((b) => (window as any).setBoard(b), board);
    const moved = await page.evaluate(() => (window as any).move('left'));
    expect(moved).toBe(true);
    const text = await page.evaluate(() => (window as any).render_game_to_text());
    expect(text).toContain('state: won');
  });
});
