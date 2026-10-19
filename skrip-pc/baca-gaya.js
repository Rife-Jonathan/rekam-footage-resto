const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  const r = await p.evaluate(() => {
    const s = [...document.querySelectorAll('[role=slider]')].map(e => (e.getAttribute('aria-label') || '?') + '=' + e.getAttribute('aria-valuenow'));
    const btns = [...document.querySelectorAll('button:has(img), [role=button]:has(img)')];
    const sel = btns.map((b, i) => ({ i, cls: b.className, pressed: b.getAttribute('aria-pressed') || b.getAttribute('data-state') || '', src: b.querySelector('img')?.src.split('/').pop() }));
    return { s, sel };
  });
  console.log(r.s.join(' | '));
  const cand = r.sel.filter(x => /ring|border-blue|selected|active|on|true/i.test(x.cls + ' ' + x.pressed));
  console.log('terpilih:', JSON.stringify(cand.map(x => [x.i, x.src])));
  process.exit(0); })();
