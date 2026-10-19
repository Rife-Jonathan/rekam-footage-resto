const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  console.log(await p.evaluate(() => [...document.querySelectorAll('[role=slider]')].map(e => `${e.getAttribute('aria-label')}: ${e.getAttribute('aria-valuemin')}..${e.getAttribute('aria-valuemax')} = ${e.getAttribute('aria-valuenow')}`).join('\n')));
  process.exit(0); })();
