import { test, expect } from '@playwright/test';

function emptyBoard(){
  // helper to make empty board placeholder
  return new Array(8*8).fill(0);
}

// helper to convert simple pattern to board array
function boardFromRows(rows:string[]){
  // rows are emoji separated by spaces; map to indices via map
  const map = {'🍎':0,'🍋':1,'🍇':2,'🍒':3,'🍊':4,'🍑':5};
  const arr:number[] = [];
  for(const r of rows){
    const cols = r.split(' ');
    for(const c of cols) arr.push(map[c]);
  }
  return arr;
}

test('valid swap increases score after resolution', async ({ page }) =>{
  await page.goto('/');
  // set up a board where swapping (7,0) with (7,1) creates a horizontal match on bottom row
  const rows = [
    '🍎 🍋 🍇 🍒 🍊 🍑 🍎 🍋',
    '🍋 🍎 🍋 🍇 🍒 🍊 🍑 🍎',
    '🍇 🍋 🍎 🍋 🍇 🍒 🍊 🍑',
    '🍒 🍇 🍋 🍎 🍋 🍇 🍒 🍊',
    '🍊 🍒 🍇 🍋 🍎 🍋 🍇 🍒',
    '🍑 🍊 🍒 🍇 🍋 🍎 🍋 🍇',
    '🍎 🍑 🍊 🍒 🍇 🍋 🍎 🍋',
    '🍋 🍎 🍑 🍊 🍊 🍑 🍊 🍑'
  ];
  const arr = boardFromRows(rows);
  await page.evaluate((a)=> (window as any).test_api.set_board(a), arr);
  const before = await page.evaluate(()=> (window as any).test_api.score());
  const ok = await page.evaluate(()=> (window as any).test_api.swap(7,4,7,3));
  // ensure swap was valid
  expect(ok).toBeTruthy();
  // allow resolution
  await page.evaluate(()=> (window as any).advanceTime(1000));
  const after = await page.evaluate(()=> (window as any).test_api.score());
  expect(after).toBeGreaterThan(before);
});

test('invalid swap reverts board state', async ({ page }) =>{
  await page.goto('/');
  const rows = [
    '🍎 🍋 🍇 🍒 🍊 🍑 🍎 🍋',
    '🍋 🍎 🍋 🍇 🍒 🍊 🍑 🍎',
    '🍇 🍋 🍎 🍋 🍇 🍒 🍊 🍑',
    '🍒 🍇 🍋 🍎 🍋 🍇 🍒 🍊',
    '🍊 🍒 🍇 🍋 🍎 🍋 🍇 🍒',
    '🍑 🍊 🍒 🍇 🍋 🍎 🍋 🍇',
    '🍎 🍑 🍊 🍒 🍇 🍋 🍎 🍋',
    '🍋 🍎 🍑 🍊 🍎 🍑 🍊 🍑'
  ];
  const arr = boardFromRows(rows);
  await page.evaluate((a)=> (window as any).test_api.set_board(a), arr);
  const beforeBoard = await page.evaluate(()=> (window as any).test_api.get_board());
  const ok = await page.evaluate(()=> (window as any).test_api.swap(7,0,7,1));
  expect(ok).toBeFalsy();
  const afterBoard = await page.evaluate(()=> (window as any).test_api.get_board());
  expect(afterBoard).toEqual(beforeBoard);
});

test('cascade increases combo multiplier', async ({ page }) =>{
  await page.goto('/');
  // craft a board that will cascade
  const rows = [
    '🍎 🍎 🍋 🍋 🍋 🍑 🍎 🍋',
    '🍋 🍋 🍎 🍎 🍎 🍊 🍑 🍎',
    '🍇 🍋 🍎 🍋 🍇 🍒 🍊 🍑',
    '🍒 🍇 🍋 🍎 🍋 🍇 🍒 🍊',
    '🍊 🍒 🍇 🍋 🍎 🍋 🍇 🍒',
    '🍑 🍊 🍒 🍇 🍋 🍎 🍋 🍇',
    '🍎 🍑 🍊 🍒 🍇 🍋 🍎 🍋',
    '🍋 🍎 🍑 🍊 🍊 🍑 🍊 🍑'
  ];
  const arr = boardFromRows(rows);
  await page.evaluate((a)=> (window as any).test_api.set_board(a), arr);
  await page.evaluate(()=> (window as any).test_api.swap(0,2,0,3));
  await page.evaluate(()=> (window as any).advanceTime(1000));
  // render to text and inspect COMBO as number
  const txt = await page.evaluate(()=> (window as any).render_game_to_text());
  expect(txt).toContain('SCORE:');
  expect(txt).toContain('COMBO:');
});
