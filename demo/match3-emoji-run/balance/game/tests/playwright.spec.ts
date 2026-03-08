import { test, expect } from '@playwright/test';
import fs from 'fs';

const GAME_SRC = fs.readFileSync('game/src/game.ts', 'utf8');

test.describe('Deterministic timed-match3', ()=>{
  test('timer counts down by seconds', async ({ page })=>{
    await page.goto('about:blank');
    await page.addInitScript({ content: GAME_SRC });
    await page.evaluate(() => (window as any).setBoardSeed(1234));
    let t = await page.evaluate(() => {
      const s = (window as any).render_game_to_text();
      const m = s.match(/TIME: (\d+)/);
      return m? Number(m[1]) : -1;
    });
    expect(t).toBe(60);
    await page.evaluate(() => (window as any).advanceTime(1000));
    t = await page.evaluate(() => {
      const s = (window as any).render_game_to_text();
      const m = s.match(/TIME: (\d+)/);
      return m? Number(m[1]) : -1;
    });
    expect(t).toBe(59);
  });

  test('milestones progress at 15/30/45/60 seconds', async ({ page })=>{
    await page.goto('about:blank');
    await page.addInitScript({ content: GAME_SRC });
    await page.evaluate(() => (window as any).setBoardSeed(42));
    // advance to just past 15s
    await page.evaluate(() => (window as any).advanceTime(16000));
    let milestone = await page.evaluate(() => {
      const s = (window as any).render_game_to_text();
      const m = s.match(/MILESTONE: (\d+)/);
      return m? Number(m[1]) : 0;
    });
    expect(milestone).toBeGreaterThanOrEqual(15);

    // advance to just past 30s
    await page.evaluate(() => (window as any).advanceTime(15000));
    milestone = await page.evaluate(() => {
      const s = (window as any).render_game_to_text();
      const m = s.match(/MILESTONE: (\d+)/);
      return m? Number(m[1]) : 0;
    });
    expect(milestone).toBeGreaterThanOrEqual(30);

    // advance to just past 45s
    await page.evaluate(() => (window as any).advanceTime(15000));
    milestone = await page.evaluate(() => {
      const s = (window as any).render_game_to_text();
      const m = s.match(/MILESTONE: (\d+)/);
      return m? Number(m[1]) : 0;
    });
    expect(milestone).toBeGreaterThanOrEqual(45);

    // advance to finish
    await page.evaluate(() => (window as any).advanceTime(20000));
    milestone = await page.evaluate(() => {
      const s = (window as any).render_game_to_text();
      const m = s.match(/MILESTONE: (\d+)/);
      return m? Number(m[1]) : 0;
    });
    expect(milestone).toBeGreaterThanOrEqual(60);
  });
});
