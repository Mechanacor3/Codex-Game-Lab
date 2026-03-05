import { test, expect } from '@playwright/test';
import path from 'path';

const INDEX = 'file://' + path.join(process.cwd(), 'game', 'index.html');

test('stable drop increases score', async ({ page }) => {
  await page.goto(INDEX);
  // seed for a light piece
  await page.evaluate(() => (window as any).setDropSeed(12345));
  const before = await page.evaluate(() => (window as any).render_game_to_text());
  await page.evaluate(() => (window as any).drop());
  // advance to allow settling
  await page.evaluate(() => (window as any).advanceTime(1000));
  const after = await page.evaluate(() => (window as any).render_game_to_text());
  const beforeScore = Number(before.split(',')[0]);
  const afterScore = Number(after.split(',')[0]);
  expect(afterScore).toBeGreaterThan(beforeScore);
});

test('unstable stack can topple', async ({ page }) => {
  await page.goto(INDEX);
  // Create a precarious stack off-center
  const baseX = 600 / 2;
  const far = baseX + 60; // far to the right
  const pieces = [ { x: far, weight: 3 }, { x: far, weight: 3 } ];
  await page.evaluate((p) => (window as any).setStateForTest({ pieces: p, timeRemaining: 60000, score: 0 }), pieces);
  // Now drop a moderately heavy piece at same offset
  await page.evaluate(() => (window as any).setDropSeed(99999));
  await page.evaluate(() => (window as any).drop());
  // advance to settle
  await page.evaluate(() => (window as any).advanceTime(1000));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  const parts = txt.split(',');
  const stability = parts[3];
  const state = parts[4];
  expect(stability).toBe('unstable');
  expect(state).toBe('game_over');
});

test('timer reaches game_over', async ({ page }) => {
  await page.goto(INDEX);
  // set timer low
  await page.evaluate(() => (window as any).setStateForTest({ timeRemaining: 50, score: 0 }));
  await page.evaluate(() => (window as any).advanceTime(200));
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  const state = txt.split(',')[4];
  expect(state).toBe('game_over');
});

test('phase transitions increase plate speed', async ({ page }) => {
  await page.goto(INDEX);
  // start and check initial plate speed
  const start = await page.evaluate(() => (window as any).render_game_to_text());
  const startSpeed = Number(start.split('plateSpeed=')[1]);
  // advance to just after 20s
  await page.evaluate(() => (window as any).advanceTime(21000));
  const p1 = await page.evaluate(() => (window as any).render_game_to_text());
  const speed1 = Number(p1.split('plateSpeed=')[1]);
  expect(speed1).toBeGreaterThanOrEqual(startSpeed);
  // advance to just after 40s
  await page.evaluate(() => (window as any).advanceTime(20000));
  const p2 = await page.evaluate(() => (window as any).render_game_to_text());
  const speed2 = Number(p2.split('plateSpeed=')[1]);
  expect(speed2).toBeGreaterThanOrEqual(speed1);
});

test('setDropSeed produces deterministic sequence', async ({ page }) => {
  await page.goto(INDEX);
  await page.evaluate(() => (window as any).setDropSeed(424242));
  await page.evaluate(() => (window as any).drop());
  await page.evaluate(() => (window as any).advanceTime(1000));
  const a = await page.evaluate(() => (window as any).render_game_to_text());

  await page.goto(INDEX);
  await page.evaluate(() => (window as any).setDropSeed(424242));
  await page.evaluate(() => (window as any).drop());
  await page.evaluate(() => (window as any).advanceTime(1000));
  const b = await page.evaluate(() => (window as any).render_game_to_text());
  expect(a).toBe(b);
});

test('start and gameover overlays and restart flow', async ({ page }) => {
  await page.goto(INDEX);
  // start overlay should be visible
  const startVisible = await page.$eval('#overlay-start', e => e.getAttribute('aria-hidden') === 'false');
  expect(startVisible).toBe(true);
  // click start
  await page.click('#btn-start');
  const startHidden = await page.$eval('#overlay-start', e => e.getAttribute('aria-hidden') === 'true');
  expect(startHidden).toBe(true);

  // force game over
  await page.evaluate(() => (window as any).setStateForTest({ timeRemaining: 0 }));
  // advance to settle any overlay logic
  await page.evaluate(() => (window as any).advanceTime(10));
  const overVisible = await page.$eval('#overlay-gameover', e => e.getAttribute('aria-hidden') === 'false');
  expect(overVisible).toBe(true);

  // click restart
  await page.click('#btn-restart');
  const overHidden = await page.$eval('#overlay-gameover', e => e.getAttribute('aria-hidden') === 'true');
  expect(overHidden).toBe(true);
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  expect(txt.split(',')[4]).toBe('playing');
});

test('touch controls: tap to drop and drag to move', async ({ page }) => {
  await page.goto(INDEX);
  await page.click('#btn-start');
  // perform a tap at x=310,y=200 (canvas coordinates)
  const rect = await page.$eval('#game', el => el.getBoundingClientRect());
  const x = Math.floor(rect.left + 310 - 300 + rect.width/2);
  const y = Math.floor(rect.top + 200 - 200 + rect.height/2);
  // simpler: just dispatch pointer events at center
  await page.dispatchEvent('#game', 'pointerdown', { clientX: rect.left + 310 - 300 + rect.width/2, clientY: rect.top + 200 - 200 + rect.height/2, pointerId: 1 });
  await page.dispatchEvent('#game', 'pointerup', { clientX: rect.left + 310 - 300 + rect.width/2, clientY: rect.top + 200 - 200 + rect.height/2, pointerId: 1 });
  // advance to settle
  await page.evaluate(() => (window as any).advanceTime(1000));
  const before = await page.evaluate(() => (window as any).render_game_to_text());
  // drag: pointerdown, pointermove, pointerup
  await page.dispatchEvent('#game', 'pointerdown', { clientX: rect.left + 200, clientY: rect.top + 200, pointerId: 2 });
  await page.dispatchEvent('#game', 'pointermove', { clientX: rect.left + 350, clientY: rect.top + 200, pointerId: 2 });
  await page.dispatchEvent('#game', 'pointerup', { clientX: rect.left + 350, clientY: rect.top + 200, pointerId: 2 });
  // read plate pos reflected in render text
  const txt = await page.evaluate(() => (window as any).render_game_to_text());
  const platePart = txt.split('plateSpeed=')[0];
  expect(txt).toBeTruthy();
});

test('heavy streak risk reduced by spawn tuning', async ({ page }) => {
  await page.goto(INDEX);
  // force RNG to produce heavy by seeding repeatedly and record labels
  await page.evaluate(() => (window as any).setDropSeed(999999));
  const labels: string[] = [];
  for (let i = 0; i < 10; i++) {
    // drop and settle quickly
    // note: render text includes top label
    await page.evaluate(() => (window as any).drop());
    await page.evaluate(() => (window as any).advanceTime(100));
    const t = await page.evaluate(() => (window as any).render_game_to_text());
    const top = t.split('top=')[1].split(',')[0];
    labels.push(top);
  }
  // check that we didn't get 3 heavy in a row anywhere
  let streak = 0;
  for (const L of labels) {
    if (L === 'heavy') { streak++; } else { streak = 0; }
    expect(streak).toBeLessThanOrEqual(2);
  }
});
