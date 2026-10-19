const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  await p.keyboard.press('Control+s'); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => { const a = window.electronAPI; const d = await a.getProjectsDirectory(); const l = await a.listProjectFiles(); return JSON.stringify({ d, l }).slice(0, 800); });
  console.log(r); process.exit(0); })().catch(e => { console.error(e.message); process.exit(1); });
