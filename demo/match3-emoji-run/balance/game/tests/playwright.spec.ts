import { test, expect } from '@playwright/test';

test.describe('Deterministic timed mode', ()=>{
  test.beforeEach(async ({ page })=>{
    await page.goto('about:blank');
    // inject our engine files
    const gameSrc = await (await import('fs/promises')).readFile(new URL('../src/game.ts', import.meta.url), 'utf8');
    const mainSrc = await (await import('fs/promises')).readFile(new URL('../src/main.ts', import.meta.url), 'utf8');
    await page.addScriptTag({ content: gameSrc });
    await page.addScriptTag({ content: mainSrc });
  });

  test('timer counts down and milestones hit', async ({ page })=>{
    await page.evaluate(()=> window.setBoardSeed(12345));
    // initial render
    let txt = await page.evaluate(()=> window.render_game_to_text());
    expect(txt).toContain('SCORE:');
    // advance to just before first milestone
    await page.evaluate(()=> window.advanceTime(14999));
    txt = await page.evaluate(()=> window.render_game_to_text());
    expect(txt).toContain('MILESTONE: none');
    // cross first milestone
    await page.evaluate(()=> window.advanceTime(2));
    txt = await page.evaluate(()=> window.render_game_to_text());
    expect(txt).toContain('MILESTONE: 15');
    // hit subsequent milestones
    await page.evaluate(()=> window.advanceTime(15000));
    txt = await page.evaluate(()=> window.render_game_to_text());
    expect(txt).toContain('MILESTONE: 15,30');
    await page.evaluate(()=> window.advanceTime(15000));
    txt = await page.evaluate(()=> window.render_game_to_text());
    expect(txt).toContain('MILESTONE: 15,30,45');
    await page.evaluate(()=> window.advanceTime(15000));
    txt = await page.evaluate(()=> window.render_game_to_text());
    expect(txt).toContain('MILESTONE: 15,30,45,60');
  });

  test('dead detection and deterministic reshuffle', async ({ page })=>{
    await page.evaluate(()=> window.setBoardSeed(999));
    // force board to known dead state by writing to board directly (deterministic)
    await page.evaluate(()=>{
      const b = window._GAME.board; // turn into pattern with no moves: alternating two types
      for(let y=0;y<window._GAME.H;y++) for(let x=0;x<window._GAME.W;x++) b[y][x] = (x+y)%2;
    });
    let dead = await page.evaluate(()=> window.checkDead());
    expect(dead).toBe(true);
    // reshuffle deterministically
    const beforeSeed = window._GAME._seed;
    const ok = await page.evaluate(()=> window.reshuffleDeterministic(200));
    const after = await page.evaluate(()=> window.checkDead());
    expect(ok).toBe(true);
    expect(after).toBe(false);
    // ensure seed advanced deterministically (seed same value still, rng progressed)
    const seed = await page.evaluate(()=> window._GAME._seed);
    expect(seed).toBe(beforeSeed);
  });
});
