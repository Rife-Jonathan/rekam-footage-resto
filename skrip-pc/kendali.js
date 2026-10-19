// Kendali Recordly lewat CDP (Recordly.exe --remote-debugging-port=9556).
//   node kendali.js tombol                → daftar tombol semua jendela Recordly
//   node kendali.js klik "<teks tombol>"  → klik tombol pertama yang aria-label/teksnya memuat teks itu
const { chromium } = require('playwright');
(async () => {
  const [cmd, arg] = process.argv.slice(2);
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556', { timeout: 15000 });
  const pages = b.contexts().flatMap((c) => c.pages());
  if (cmd === 'tombol') {
    for (const p of pages) {
      const names = await p.$$eval('button', (bs) => bs.map((x) => (x.getAttribute('aria-label') || x.getAttribute('title') || x.innerText || '').trim().replace(/\s+/g, ' ')).filter(Boolean));
      console.log('==', p.url().split('?')[1] || p.url(), '\n' + [...new Set(names)].join('\n'));
    }
  } else if (cmd === 'klik') {
    for (const p of pages) {
      const btn = p.locator('button').filter({ hasText: arg }).first();
      const byLabel = p.locator(`button[aria-label*="${arg}"], button[title*="${arg}"]`).first();
      for (const l of [byLabel, btn]) {
        if (await l.count()) { await l.click({ timeout: 5000 }); console.log('OK klik', arg); process.exit(0); }
      }
    }
    console.log('TIDAK KETEMU', arg); process.exit(2);
  } else if (cmd === 'jsklik') {
    // klik lewat DOM (tetap jalan walau HUD disembunyikan)
    for (const p of pages) {
      const ok = await p.evaluate((t) => {
        const label = (x) => (x.getAttribute('aria-label') || x.getAttribute('title') || x.innerText || '').trim();
        const all = [...document.querySelectorAll('button')];
        const b = all.find((x) => label(x) === t) || all.find((x) => label(x).includes(t)); // utamakan nama persis
        if (b) { b.click(); return true; } return false;
      }, arg);
      if (ok) { console.log('OK jsklik', arg); process.exit(0); }
    }
    console.log('TIDAK KETEMU', arg); process.exit(2);
  }
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
