// Kunci setiap zona zoom Recordly ke mode MANUAL dengan titik fokus = posisi klik asli (dari <rekaman>.mp4.cursor.json).
// Mode Auto membuat kamera mengikuti kursor ("geser kanan-kiri"); Manual + fokus di klik = kamera diam.
//   node fokus-klik.js <path rekaman .mp4> [cropAtasPersen=9]
// Syarat: editor terbuka dengan rekaman itu, zona sudah dibuat (Suggest Zooms), crop sudah diterapkan.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [mp4, cropArg] = process.argv.slice(2);
  const crop = (+(cropArg ?? 9)) / 100;
  const klikList = JSON.parse(fs.readFileSync(mp4 + '.cursor.json', 'utf8')).samples
    .filter((s) => s.interactionType === 'click').map((s) => ({ t: s.timeMs / 1000, cx: s.cx, cy: s.cy }));
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap((c) => c.pages()).find((x) => x.url().includes('editor'));

  // skala timeline: tombol "Clip 0.0s – 19.0s" membentang 0..durasi
  const clip = await p.evaluate(() => {
    const e = [...document.querySelectorAll('button,div')].filter((x) => x.getBoundingClientRect().width > 300).reverse().find((x) => /^Clip\s*[\d.]+s\s*–\s*[\d.]+s/.test((x.innerText || x.getAttribute('aria-label') || '').trim()));
    const m = /([\d.]+)s\s*–\s*([\d.]+)s/.exec(e.innerText || e.getAttribute('aria-label')); const r = e.getBoundingClientRect();
    return { x: r.x, w: r.width, t0: +m[1], t1: +m[2] };
  });
  const zona = await p.evaluate(() => [...document.querySelectorAll('div,button')]
    .filter((e) => /^\d(\.\d+)?×\s*(Auto|Manual)?$/.test((e.innerText || '').replace(/\s+/g, ' ').trim()) && e.getBoundingClientRect().y > innerHeight * 0.6 && e.getBoundingClientRect().width < 400)  // baris zona di timeline (relatif: layar 150% lebih kecil)
    .map((e) => { const r = e.getBoundingClientRect(); return { x0: r.x, x1: r.x + r.width, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; })
    .filter((v, i, a) => a.findIndex((w) => Math.abs(w.cx - v.cx) < 5) === i));
  const keDetik = (x) => clip.t0 + ((x - clip.x) / clip.w) * (clip.t1 - clip.t0);
  const kotak = () => p.evaluate(() => { const e = document.querySelector('div.absolute.rounded-md[class*="2563EB"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });

  let ok = 0;
  for (const z of zona) {
    const [s, e] = [keDetik(z.x0), keDetik(z.x1)];
    const k = klikList.find((c) => c.t >= s - 0.6 && c.t <= e) || klikList.reduce((a, c) => (Math.abs(c.t - s) < Math.abs(a.t - s) ? c : a), klikList[0]);
    await p.mouse.click(z.cx, z.cy); await p.waitForTimeout(400);
    await p.getByRole('button', { name: 'Manual', exact: true }).first().click(); await p.waitForTimeout(400);
    // ukuran konten = kotak fokus × level zoom; reset dulu ke pojok kiri atas supaya kiri-atas konten diketahui
    let bx = await kotak(); if (!bx) { console.log('kotak fokus tidak muncul untuk zona', s.toFixed(1)); continue; }
    await p.mouse.click(bx.x + 2, bx.y + 2); await p.waitForTimeout(300); bx = await kotak();
    const lvl = +((await p.evaluate(() => (document.body.innerText.match(/ZOOM\s*([\d.]+)×/) || [])[1])) || 1.5);
    const W = bx.w * lvl, H = bx.h * lvl;
    const cyKonten = Math.min(1, Math.max(0, (k.cy - crop) / (1 - crop)));
    const tx = bx.x + k.cx * W, ty = bx.y + cyKonten * H;
    await p.mouse.click(tx, ty); await p.waitForTimeout(400);
    const after = await kotak();
    console.log(`zona ${s.toFixed(1)}-${e.toFixed(1)}s ← klik ${k.t.toFixed(2)}s (${k.cx.toFixed(2)},${k.cy.toFixed(2)}) → kotak ${after.x | 0},${after.y | 0}`);
    ok++;
  }
  console.log(`fokus diatur ${ok}/${zona.length} zona`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
