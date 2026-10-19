// Cek login 4 akun demo + banner "MODE DEMO" (HANYA BACA: setelah login semua request non-GET diblokir).
//   node cekdemo.js     → per akun: halaman awal, judul tab, jumlah banner demo, menu sidebar
const { chromium } = require('playwright');
const { AKUN, login, buka } = require('./resto');
(async () => {
  const b = await chromium.launch();
  for (const akun of Object.keys(AKUN)) {
    const ctx = await b.newContext({ viewport: { width: 1920, height: 1008 } }); const p = await ctx.newPage();
    try {
      await login(p, akun); await p.waitForTimeout(1500);
      await p.route('**/*', (r) => (r.request().method() === 'GET' ? r.continue() : r.abort()));
      const banner = await p.locator('text=/mode demo/i').count();
      const menu = await p.$$eval('aside a, nav a', (as) => [...new Set(as.map((a) => a.innerText.trim()).filter(Boolean))]);
      console.log(`${akun}: OK → ${new URL(p.url()).pathname} | title "${await p.title()}" | banner demo ${banner} | menu ${menu.length}: ${menu.join(', ').slice(0, 300)}`);
    } catch (e) { console.log(`${akun}: GAGAL ${e.message.split('\n')[0]}`); }
    await ctx.close();
  }
  const p = await b.newPage(); await buka(p, '/login');
  console.log('login: title "' + (await p.title()) + '" | banner demo', await p.locator('text=/mode demo/i').count(), '| tombol', (await p.$$eval('button', (bs) => bs.map((x) => x.innerText.trim()).filter(Boolean))).join(', '));
  await b.close();
})();
