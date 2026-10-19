const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const nama = process.argv[2];
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  if (!(await p.getByPlaceholder('Preset name').count())) await p.getByRole('button', { name: 'Open presets' }).click();
  const row = p.locator('div', { hasText: nama }).filter({ has: p.locator('button') }).last();
  const btns = row.locator('button'); const n = await btns.count();
  await btns.nth(n - 1).click(); await p.waitForTimeout(800);   // tombol X hapus preset lama
  await p.getByPlaceholder('Preset name').fill(nama);
  await p.getByRole('button', { name: 'Save', exact: true }).click(); await p.waitForTimeout(1000);
  const ukuran = await p.locator('[role=slider][aria-label="Cursor Size"]').getAttribute('aria-valuenow').catch(() => '?');
  console.log('preset ditimpa, cursor =', ukuran, '| jumlah preset bernama sama:', await p.getByText(nama, { exact: true }).count());
  process.exit(0); })().catch(e => { console.error(e.message); process.exit(1); });
