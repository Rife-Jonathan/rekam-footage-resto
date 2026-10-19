// Buka rekaman lama di editor Recordly: node buka.js <path mp4>
const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages())[0];
  const r = await p.evaluate(async (f) => { const a = window.electronAPI;
    const s = await a.setCurrentVideoPath(f); const e = await a.switchToEditor(); return JSON.stringify({ s, e }); }, process.argv[2]);
  console.log(r); process.exit(0); })().catch(e => { console.error(e.message); process.exit(1); });
