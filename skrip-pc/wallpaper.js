const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  await p.getByRole('button', { name: 'Image', exact: true }).click();
  for (let i = 0; i < 20; i++) { if (await p.locator('img').count() > 3) break; await p.waitForTimeout(500); }
  const imgs = p.locator('button:has(img), [role=button]:has(img)');
  console.log('jumlah wallpaper', await imgs.count());
  await imgs.nth(+(process.argv[2] || 0)).click();
  await p.waitForTimeout(1000); await p.screenshot({ path: process.argv[3] }); process.exit(0); })().catch(e => { console.error(e.message); process.exit(1); });
