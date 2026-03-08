// Minimal Playwright script to check overlay flow and swipe handling.
// This is a simple Node script using Playwright; it is intended as a lightweight check.
const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000/'); // tests expect local static server
  // snapshot start overlay
  const startVisible = await page.$eval('#overlayStart', el => !el.classList.contains('hidden'));
  console.log('startVisible=', startVisible);
  // click start
  await page.click('#startBtn');
  await page.waitForTimeout(100);
  // perform a swipe gesture using dispatch of touch events
  await page.evaluate(()=>{
    function dispatchTouch(el, type, x, y){ const touchObj = new Touch({ identifier: Date.now(), target: el, clientX: x, clientY: y, pageX:x, pageY:y, screenX:x, screenY:y }); const ev = new TouchEvent(type, { cancelable:true, bubbles:true, touches: type==='touchend'? []: [touchObj], targetTouches: [], changedTouches: [touchObj]}); el.dispatchEvent(ev); }
    const el = document.body;
    const w = window.innerWidth, h = window.innerHeight;
    dispatchTouch(el, 'touchstart', w/2, h/2);
    dispatchTouch(el, 'touchend', w/2 + 100, h/2);
  });
  // wait and print text render
  await page.waitForTimeout(150);
  const text = await page.$eval('#render', el => el.textContent);
  console.log('render after swipe:\n', text);
  await browser.close();
})();
