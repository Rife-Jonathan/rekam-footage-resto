const { chromium } = require('playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  await p.screenshot({ path: process.argv[2] }); process.exit(0); })();
