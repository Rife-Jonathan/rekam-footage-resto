// Ubah SEMUA zona zoom di editor Recordly ke mode "Manual" (kamera terkunci, tidak ikut kursor → tidak goyang kanan-kiri).
//   node zoom-manual.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap((c) => c.pages()).find((x) => x.url().includes('editor'));
  // chip zona di timeline: teks "1.5× Auto" / "1.5× Manual"
  const kotak = async () => p.evaluate(() => [...document.querySelectorAll('div,button')]
    .filter((e) => /^\d(\.\d+)?×\s*(Auto|Manual)$/.test((e.innerText || '').replace(/\s+/g, ' ').trim()) && e.children.length <= 3)
    .map((e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: e.innerText.replace(/\s+/g, ' ') }; })
    .filter((v, i, a) => a.findIndex((w) => Math.abs(w.x - v.x) < 5) === i));
  const zs = await kotak(); const n = zs.length; let diubah = 0;
  for (const z of zs) {
    await p.mouse.click(z.x, z.y); await p.waitForTimeout(500);
    const manual = p.getByRole('button', { name: 'Manual', exact: true });
    if (await manual.count()) { await manual.first().click(); diubah++; await p.waitForTimeout(400); }
  }
  const sisaAuto = (await kotak()).filter((z) => /Auto/.test(z.t)).length;
  console.log(`zona ${n}, diubah ke Manual ${diubah}, sisa Auto ${sisaAuto}`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
