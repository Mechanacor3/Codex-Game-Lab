import { test, expect } from '@playwright/test';

test('overlay flow: start -> win -> restart', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');
  // start overlay visible
  await expect(page.locator('#startOverlay')).toBeVisible();
  await page.click('#playBtn');
  await expect(page.locator('#startOverlay')).toBeHidden();

  // set winning board directly and re-render
  await page.evaluate(() => {
    // 2048 in [0][0]
    window.game.setBoard([
      [2048,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ]);
    // call render hooks
    if (window.render_game_to_text) window.render_game_to_text();
  });

  // overlay should show win
  await expect(page.locator('#endOverlay')).toBeVisible();
  await expect(page.locator('#endTitle')).toHaveText('You Win');

  // restart
  await page.click('#endRestart');
  await expect(page.locator('#startOverlay')).toBeVisible();
  // ensure state reset
  const state = await page.evaluate(() => window.game.state);
  expect(state).toBe('running');
});
