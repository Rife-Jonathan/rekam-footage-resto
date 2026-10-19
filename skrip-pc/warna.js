const { chromium } = require('playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  const v = await p.evaluate((hex) => { const i = document.querySelector('input[type=color]');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, hex);
    i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); return i.value; }, process.argv[2]);
  console.log('warna =', v); await p.waitForTimeout(800);
  await p.screenshot({ path: process.argv[3] }); process.exit(0); })();
