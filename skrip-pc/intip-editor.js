const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  const r = await p.evaluate(() => [...document.querySelectorAll('input,[role=slider],[role=switch]')].map(e => [e.tagName, e.type||'', e.getAttribute('role')||'', e.getAttribute('aria-label')||'', e.value||e.getAttribute('aria-valuenow')||'', (e.closest('div')?.parentElement?.innerText||'').slice(0,40).replace(/\s+/g,' ')].join(' | ')));
  console.log(r.join('\n')); process.exit(0); })();
