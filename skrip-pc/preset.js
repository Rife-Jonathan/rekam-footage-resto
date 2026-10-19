// simpan / pakai preset Recordly: node preset.js simpan "<nama>" | node preset.js pakai "<nama>"
const { chromium } = require('playwright');
(async () => { const [cmd, nama] = process.argv.slice(2);
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  if (!(await p.getByPlaceholder('Preset name').count())) await p.getByRole('button', { name: 'Open presets' }).click();
  if (cmd === 'simpan') { await p.getByPlaceholder('Preset name').fill(nama); await p.getByRole('button', { name: 'Save', exact: true }).click(); }
  else { await p.getByText(nama, { exact: true }).first().click(); }
  await p.waitForTimeout(1000);
  console.log(cmd, 'OK', await p.locator('text=' + nama).count()); process.exit(0); })().catch(e => { console.error(e.message); process.exit(1); });
