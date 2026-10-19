const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages())[0];
  const t = await p.evaluate(() => [...document.querySelectorAll('[role=menuitem],[role=menu] *,li,a')].map(e => e.innerText.trim()).filter(Boolean));
  console.log([...new Set(t)].join(' | ')); process.exit(0); })();
