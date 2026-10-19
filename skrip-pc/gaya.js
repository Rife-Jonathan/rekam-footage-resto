// Pasang + VERIFIKASI gaya standar owner di editor Recordly (preset "Nusawebsite Demo" tidak menerapkan setelan kursor).
//   node gaya.js        → atur slider yang meleset, lalu cek semua; exit 3 bila masih ada yang tidak cocok
const { chromium } = require('playwright');
const TARGET = {
  Scene: { Blur: 3.5, Shadow: 0.53, Radius: 2.4, PADDING: 14, Top: 9, Bottom: 0, Left: 0, Right: 0 },
  Cursor: { 'Cursor Size': 1, 'Cursor Click Bounce': 2, 'Cursor Sway': 0.2 },
};
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap((c) => c.pages()).find((x) => x.url().includes('editor'));
  const tab = async (t) => { await p.evaluate((t) => { const x = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || b.title || b.innerText || '').trim() === t); if (x) x.click(); }, t); await p.waitForTimeout(800); };
  // slider tanpa aria-label (PADDING) dikenali dari teks judul di atasnya
  const cari = async (nama) => {
    const byLabel = p.locator(`[role=slider][aria-label="${nama}"]`);
    if (await byLabel.count()) return byLabel.first();
    const i = await p.$$eval('[role=slider]', (ss, n) => ss.findIndex((s) => !s.getAttribute('aria-label') && ((s.closest('div[class]')?.parentElement?.innerText || '').split('\n')[0].trim() === n)), nama);
    return i >= 0 ? p.locator('[role=slider]').nth(i) : null;
  };
  const nilai = async (l) => +(await l.getAttribute('aria-valuenow'));
  const salah = [];
  for (const [t, isi] of Object.entries(TARGET)) {
    await tab(t);
    for (const [nama, mau] of Object.entries(isi)) {
      const l = await cari(nama);
      if (!l) { salah.push(`${nama}: slider tidak ketemu`); continue; }
      const tol = Math.max(Math.abs(mau) * 0.005, 0.001);
      if (Math.abs((await nilai(l)) - mau) > tol) {
        await l.focus();
        for (let i = 0; i < 400 && (await nilai(l)) > mau + tol; i++) await p.keyboard.press('ArrowLeft');
        for (let i = 0; i < 400 && (await nilai(l)) < mau - tol; i++) await p.keyboard.press('ArrowRight');
      }
      const v = await nilai(l);
      const ok = Math.abs(v - mau) <= tol;
      console.log(`${ok ? 'OK ' : 'SALAH'} ${t}/${nama} = ${v} (target ${mau})`);
      if (!ok) salah.push(`${nama}=${v}, target ${mau}`);
    }
  }
  if (salah.length) { console.log('GAYA TIDAK SESUAI:', salah.join('; ')); process.exit(3); }
  console.log('GAYA SESUAI'); process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
