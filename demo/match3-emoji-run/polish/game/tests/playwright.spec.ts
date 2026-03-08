import { test, expect } from '@playwright/test';

test.describe('Overlay & Keyboard Path', ()=>{
  test('start overlay appears then Enter starts game', async ({ page })=>{
    await page.goto('/');
    const start = page.locator('#start-overlay');
    await expect(start).toBeVisible();
    // press Enter to start
    await page.keyboard.press('Enter');
    await expect(start).toBeHidden();
  });

  test('arrow keys move cursor and Enter selects and swaps', async ({ page })=>{
    await page.goto('/');
    // start first
    await page.keyboard.press('Enter');
    // initial cursor at 0,0
    const tile00 = page.locator('#tile-0-0');
    await expect(tile00).toHaveClass(/cursor/);
    // move right
    await page.keyboard.press('ArrowRight');
    const tile10 = page.locator('#tile-1-0');
    await expect(tile10).toHaveClass(/cursor/);
    // select current (1,0)
    await page.keyboard.press('Enter');
    await expect(page.locator('#tile-1-0')).toHaveClass(/selected/);
    // move down to adjacent (1,1)
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#tile-1-1')).toHaveClass(/cursor/);
    // press Enter to swap with selected
    await page.keyboard.press('Enter');
    // after swap, swap animation class should appear briefly
    await expect(page.locator('#tile-1-0')).toHaveClass(/swap-anim/);
    await expect(page.locator('#tile-1-1')).toHaveClass(/swap-anim/);
  });

  test('restart from game-over overlay returns to start overlay', async ({ page })=>{
    await page.goto('/');
    // start then simulate game over by showing overlay via window
    await page.keyboard.press('Enter');
    await page.evaluate(()=>{ (window as any).gameApi && (window as any).gameApi.restart(); });
    // restart shows start overlay per our API
    await expect(page.locator('#start-overlay')).toBeVisible();
    // click start button
    await page.click('#start-btn');
    await expect(page.locator('#start-overlay')).toBeHidden();
  });
});
