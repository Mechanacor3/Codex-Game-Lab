import { test, expect } from '@playwright/test';

test('touch swipe triggers move', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');
  await page.click('#playBtn');
  // ensure initial board has two tiles
  const beforeText = await page.locator('#render').textContent();
  // perform a swipe gesture (simulate pointer drag)
  const box = await page.locator('#board').boundingBox();
  if (!box) throw new Error('no board box');
  const startX = box.x + box.width/2;
  const startY = box.y + box.height/2 + 80; // lower half
  const endX = startX;
  const endY = box.y + 20; // swipe up
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 8 });
  await page.mouse.up();

  // allow UI to update
  await page.waitForTimeout(120);
  const afterText = await page.locator('#render').textContent();
  expect(afterText).not.toBe(beforeText);
});
