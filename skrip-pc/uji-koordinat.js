// Ukur selisih koordinat kursor OS vs elemen (latihan, tanpa Record). node uji-koordinat.js
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const { login, buka } = require('./resto');
const PY = 'C:/Users/M.S.I/AppData/Local/Programs/Python/Python313/python.exe';
const m = spawn(PY, ['-u', __dirname + '/mouse_server.py'], { stdio: ['pipe', 'pipe', 'inherit'] }); const w = []; m.stdout.on('data', (d) => String(d).trim().split('\n').forEach(() => (w.shift() || (() => {}))()));
const kirim = (s) => new Promise((r) => { w.push(r); m.stdin.write(s + '\n'); });
(async () => {
  const b = await chromium.launch({ headless: false, args: ['--window-position=0,0', '--window-size=1920,1008', '--force-device-scale-factor=1'] });
  const p = await (await b.newContext({ viewport: null })).newPage(); await login(p);
  await p.route('**/*', (r) => (r.request().method() === 'GET' ? r.continue() : r.abort()));
  await buka(p, '/menu/items'); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__m = []; addEventListener('mousemove', (e) => (window.__m = [e.clientX, e.clientY])); });
  await kirim('fokus Resto Nusantara');
  const info = await p.evaluate(() => ({ sx: screenX, sy: screenY, ow: outerWidth, oh: outerHeight, iw: innerWidth, ih: innerHeight, dpr: devicePixelRatio }));
  console.log(info);
  for (const t of ['h1', 'input[placeholder^="Cari"]', 'a:has-text("Ubah")']) {
    const bb = await p.locator(t).first().boundingBox();
    const ox = info.sx + (info.ow - info.iw) / 2, oy = info.sy + (info.oh - info.ih) - (info.ow - info.iw) / 2;
    const X = Math.round(ox + bb.x + bb.width / 2), Y = Math.round(oy + bb.y + bb.height / 2);
    await kirim(`move ${X} ${Y} 0.5`); await kirim(`move ${X + 1} ${Y} 0.1`); await p.waitForTimeout(300);
    console.log(t, 'target', Math.round(bb.x + bb.width / 2), Math.round(bb.y + bb.height / 2), 'mouse', await p.evaluate(() => window.__m), 'kirim', X, Y);
  }
  await b.close(); m.kill();
})();
