// node kursor.js <ukuran 0.5..10>
const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const n = +process.argv[2];
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  const s = p.locator('[role=slider][aria-label="Cursor Size"]'); await s.focus();
  const v = async () => +(await s.getAttribute('aria-valuenow'));
  for (let i = 0; i < 300 && (await v()) > n + 0.001; i++) await p.keyboard.press('ArrowLeft');
  for (let i = 0; i < 300 && (await v()) < n - 0.001; i++) await p.keyboard.press('ArrowRight');
  console.log('Cursor Size =', await v()); process.exit(0); })();
