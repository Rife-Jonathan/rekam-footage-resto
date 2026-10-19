// Intip struktur halaman untuk menulis alur rekam (HANYA BACA: semua request non-GET diblokir, headless, tanpa kursor OS).
//   node intip-v2.js /doctors /nurses ...   → out/intip/<rute>.png + daftar tombol/input/judul/baris tabel
const { chromium } = require('playwright');
const fs = require('fs');
const { BASE, login, buka } = require('./resto'); // AKUN=manajer|kasir|pelayan|dapur|publik
const OUT = __dirname + '/../out/intip/';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: process.env.HP ? { width: 390, height: 844 } : { width: 1920, height: 1008 } });
  if ((process.env.AKUN || 'manajer') !== 'publik') await login(p, process.env.AKUN || 'manajer');
  await p.route('**/*', (r) => (r.request().method() === 'GET' ? r.continue() : r.abort()));
  for (const rute of process.argv.slice(2)) {
    await buka(p, rute).catch(() => {}); await p.waitForTimeout(1200);
    const info = await p.evaluate(() => {
      const t = (e) => (e.getAttribute('aria-label') || e.getAttribute('title') || e.innerText || e.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      const uniq = (a) => [...new Set(a.filter(Boolean))];
      return {
        judul: uniq([...document.querySelectorAll('h1,h2,h3')].map(t)),
        tombol: uniq([...document.querySelectorAll('button,a[href]')].map((e) => t(e) + (e.querySelector('svg[class*=lucide]') ? ' {' + [...e.querySelector('svg[class*=lucide]').classList].find((c) => c.startsWith('lucide-') && c !== 'lucide') + '}' : ''))).slice(0, 80),
        input: uniq([...document.querySelectorAll('input,textarea,select,[role=combobox]')].map((e) => (e.tagName + ':' + (e.getAttribute('placeholder') || e.name || e.id || t(e))))),
        tab: uniq([...document.querySelectorAll('[role=tab]')].map(t)),
        baris: [...document.querySelectorAll('tbody tr')].slice(0, 8).map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 110)),
      };
    });
    const nama = rute.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root';
    await p.screenshot({ path: OUT + nama + '.png' });
    console.log('##### ' + rute + ' → ' + p.url().replace(BASE, '') + '  [title: ' + (await p.title()) + ']');
    for (const [k, v] of Object.entries(info)) if (v.length) console.log(k + ': ' + v.join(' | '));
  }
  await b.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
