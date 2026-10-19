const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages())[0];
  const k = await p.evaluate(() => Object.keys(window).filter(k => /api|electron|ipc|bridge/i.test(k)).map(k => k + ': ' + Object.keys(window[k] || {}).join(',')));
  console.log(k.join('\n')); process.exit(0); })();
