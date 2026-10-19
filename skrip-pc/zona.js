const { chromium } = require('playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  const z = p.locator('text=/1\.5\s*×?/').first(); console.log('zona', await p.locator('text=/1\.5/').count());
  await z.click(); await p.waitForTimeout(1200);
  const t = await p.evaluate(() => [...document.querySelectorAll('button,[role=slider],[role=switch],[role=radio],label')].map(e => (e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean));
  console.log([...new Set(t)].join(' | '));
  await p.screenshot({ path: process.argv[2] }); process.exit(0); })().catch(e => { console.error(e.message); process.exit(1); });
