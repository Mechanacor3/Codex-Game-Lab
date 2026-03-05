import { test, expect } from '@playwright/test';

// Extended tests to exercise polish overlays and keyboard path
test.describe('Polished UI layer with keyboard and overlays', ()=>{
  test.beforeEach(async ({ page })=>{
    await page.goto('about:blank');
    const gameSrc = await (await import('fs/promises')).readFile(new URL('../src/game.ts', import.meta.url), 'utf8');
    const mainSrc = await (await import('fs/promises')).readFile(new URL('../src/main.ts', import.meta.url), 'utf8');
    await page.addScriptTag({ content: gameSrc });
    await page.addScriptTag({ content: mainSrc });
  });

  test('start overlay, start via Enter, keyboard move and select/swap', async ({ page })=>{
    // initial UI overlay should be start
    let ui = await page.evaluate(() => window.UI.inspect());
    expect(ui.overlay).toBe('start');
    // press Enter to start
    await page.evaluate(()=> window.UI.pressKey('Enter'));
    ui = await page.evaluate(() => window.UI.inspect());
    expect(ui.overlay).toBeNull();
    // move cursor right, down
    await page.evaluate(()=> window.UI.pressKey('ArrowRight'));
    await page.evaluate(()=> window.UI.pressKey('ArrowDown'));
    ui = await page.evaluate(() => window.UI.inspect());
    expect(ui.cursor.x).toBe(1);
    expect(ui.cursor.y).toBe(1);
    // select current and move to adjacent and swap
    await page.evaluate(()=> window.UI.pressKey('Enter'));
    ui = await page.evaluate(() => window.UI.inspect());
    expect(ui.selected).toEqual({x:1,y:1});
    // move right and press enter to attempt swap
    await page.evaluate(()=> window.UI.pressKey('ArrowRight'));
    await page.evaluate(()=> window.UI.pressKey('Enter'));
    // after swap attempt, selected should be cleared
    ui = await page.evaluate(() => window.UI.inspect());
    expect(ui.selected).toBeNull();
    // ensure swapAnim marker exists (was applied then cleared in logic)
    expect(ui.swapAnim).not.toBeUndefined();
  });

  test('match pop marker and score popup for 4+ clears', async ({ page })=>{
    await page.evaluate(()=> window.UI.start(42));
    // craft a board with a 4-in-row horizontal at top to ensure big clear
    await page.evaluate(()=>{
      const b = window._GAME.board;
      // set first row to all zeros to force a 6-wide match (but engine finds 3+)
      for(let x=0;x<window._GAME.W;x++) b[0][x]=0;
    });
    // select (0,0) then (1,0)
    await page.evaluate(()=> window.UI.pressKey('ArrowDown')); // move away
    await page.evaluate(()=> window.UI.pressKey('ArrowUp'));
    await page.evaluate(()=> window.UI.pressKey('Enter'));
    await page.evaluate(()=> window.UI.pressKey('ArrowRight'));
    await page.evaluate(()=> window.UI.pressKey('Enter'));
    // inspect markers
    const ui = await page.evaluate(()=> window.UI.inspect());
    expect(ui.matchPops.length).toBeGreaterThan(0);
    // since many pieces were removed, there should be a score popup for 4+
    expect(ui.scorePopups.length).toBeGreaterThan(0);
  });

  test('game over overlay appears after time and restart returns to start', async ({ page })=>{
    await page.evaluate(()=> window.UI.start(123));
    // advance time to end
    await page.evaluate(()=> window.advanceTime(60000));
    // sync finish check
    await page.evaluate(()=> window.UI.checkFinish());
    let ui = await page.evaluate(()=> window.UI.inspect());
    expect(ui.overlay).toBe('gameover');
    // press Enter to restart -> should return to start overlay
    await page.evaluate(()=> window.UI.pressKey('Enter'));
    ui = await page.evaluate(()=> window.UI.inspect());
    expect(ui.overlay).toBe('start');
  });
});
