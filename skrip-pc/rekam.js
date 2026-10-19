// Rekam satu ALUR klip resto (bahan/SHOTLIST-RESTO.md) untuk Recordly (kursor OS asli → Recordly mencatat klik → zoom).
//   node rekam.js <alur>          alur ada di alur-*.js (nama = id klip, mis. a3)
//   DRY=1 node rekam.js <alur>    uji kering: request non-GET diblokir, aksi ubah() hanya hover, flag tidak ditunggu
//   DRY=1 NOMOUSE=1 node rekam.js <alur>   uji kering HEADLESS tanpa kursor OS (aman paralel) — klik = klik Playwright
// Cetak SIAP → tunggu mulai.flag → jalankan alur → cetak SELESAI → tunggu berhenti.flag (Chrome baru ditutup setelah rekaman stop).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const PY = 'C:/Users/M.S.I/AppData/Local/Programs/Python/Python313/python.exe';
const { BASE, AKUN, login, buka } = require('./resto');
const DIR = 'C:/Users/M.S.I/Downloads/sc/rekam-footage-resto/out/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NOMOUSE = process.env.NOMOUSE === '1';
// NOMOUSE: server kursor tiruan — move = tunggu durasinya, click/roda = Playwright (koordinat layar → viewport)
const mouse = NOMOUSE ? null : spawn(PY, ['-u', __dirname + '/mouse_server.py'], { stdio: ['pipe', 'pipe', 'inherit'] });
const tunggu = [];
if (mouse) mouse.stdout.on('data', (d) => { for (const _ of String(d).trim().split('\n')) (tunggu.shift() || (() => {}))(); });
let asal = { x: 0, y: 0 }; // posisi viewport di layar (diisi saat mulai)
async function tiru(s) {
  const [c, a, b, d] = s.split(' ');
  if (c === 'move') return sleep(Number(d) * 1000);
  if (c === 'click') { await sleep(Number(d) * 1000); return page.mouse.click(Number(a) - asal.x, Number(b) - asal.y); }
  if (c === 'roda') return page.mouse.wheel(0, -Number(a) * 100);
  if (c === 'scroll') return page.mouse.wheel(0, -Number(a));
}
const kirim = (s) => (NOMOUSE ? tiru(s) : new Promise((r) => { tunggu.push(r); mouse.stdin.write(s + '\n'); }));

let page;
let kal = null; // HP: asal viewport di layar hasil kalibrasi kursor (viewport emulasi ≠ isi jendela → rumus outer/inner meleset)
async function pusat(target, dy = 0) {
  const loc = typeof target === 'string' ? page.locator(target).first() : target;
  await loc.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
  let b = await loc.boundingBox({ timeout: 2500 });
  if (!b) throw new Error('tidak ketemu: ' + target);
  // header resto sticky (±75 px): elemen "terlihat" di bawahnya tetap tertutup → klik kena header. Tengahkan dulu.
  const ih = await page.evaluate(() => innerHeight);
  if (b.y < 90 || b.y + b.height > ih - 10) {
    await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await sleep(250);
    b = await loc.boundingBox({ timeout: 2500 });
    if (!b) throw new Error('tidak ketemu: ' + target);
  }
  const o = NOMOUSE ? { x: 0, y: 0 } : kal || await page.evaluate(() => ({
    x: window.screenX + (window.outerWidth - window.innerWidth) / 2,
    y: window.screenY + (window.outerHeight - window.innerHeight) - (window.outerWidth - window.innerWidth) / 2,
  }));
  return [Math.round(o.x + b.x + b.width / 2), Math.round(o.y + b.y + b.height / 2 + dy)];
}
const arahkan = async (t, dur = 0.9, after = 700, dy = 0) => { const [x, y] = await pusat(t, dy); await kirim(`move ${x} ${y} ${dur}`); await sleep(after); };
// Setelah klik: kursor hanya bergeser pelan di dekat titik klik selama zoom berlangsung (kamera Recordly mengikuti kursor;
// gerak jauh/scroll saat zoom = kamera goyang). Baru pindah jauh setelah zoom keluar (~1,7 dtk).
const klik = async (t, after = 900, dy = 0) => { const [x, y] = await pusat(t, dy); await kirim(`click ${x} ${y} 0.9`); await kirim(`move ${x + 14} ${y + 8} 1.6`); await sleep(Math.max(after, 400)); };
const keAtas = async () => { await page.evaluate(() => window.scrollTo({ top: 0 })); await sleep(500); };
const gulir = async (n, after = 700) => { await kirim(`scroll ${n}`); await sleep(after); };
const langkah = async (nama, fn) => { const t = Date.now(); try { await fn(); } catch (e) { console.error('lewati', nama, e.message.split('\n')[0]); } if (process.env.DRY === '1') console.log('  ', nama, ((Date.now() - t) / 1000).toFixed(1)); };

// ---- helper YT002 (durasi terukur; kursor tak pernah diam >1,5 dtk) ----
// DRY=1 → uji kering: semua request non-GET diblokir, aksi pengubah data (ubah) hanya hover, flag tidak ditunggu.
const DRY = process.env.DRY === '1';
const EXAM = process.env.EXAM || '45'; // /examination/<id> pasien Indira Sari (dari "Buka Rekam Medis" di antrean)
let cur = [960, 560];
const ke = async (x, y, dur) => { await kirim(`move ${x} ${y} ${dur}`); cur = [x, y]; };
// geser kecil pelan di sekitar posisi sekarang sampai tenggat (berbasis jam → durasi alur tepat; tanpa gerak jauh → aman saat zoom)
const POLA = [[14, 8], [2, 18], [-12, 10], [-4, -6], [10, -10], [0, 0]];
async function geserSampai(dl) {
  const [bx, by] = cur; let i = 0;
  for (;;) {
    const sisa = dl - Date.now(); if (sisa < 150) { if (sisa > 0) await sleep(sisa); return; }
    const t = Math.min(1000, sisa), t0 = Date.now(); const [dx, dy] = POLA[i++ % POLA.length];
    await kirim(`move ${bx + dx} ${by + dy} ${((t * 0.75) / 1000).toFixed(2)}`);
    const pakai = Date.now() - t0; if (pakai < t) await sleep(t - pakai);
  }
}
const geser = (ms) => geserSampai(Date.now() + ms);
const hover = async (t, ms = 1500, dur = 0.9, dy = 0) => { const dl = Date.now() + dur * 1000 + ms; const [x, y] = await pusat(t, dy); await ke(x, y, dur); await geserSampai(dl); };
const tekan = async (t, ms = 1600, dur = 0.9, dy = 0) => { const dl = Date.now() + dur * 1000 + Math.max(ms, 500); const [x, y] = await pusat(t, dy); await kirim(`click ${x} ${y} ${dur}`); cur = [x, y]; await geserSampai(dl); };
// UJI=1 → rekaman uji: direkam seperti biasa, tapi aksi pengubah data hanya hover (bukan take final)
// DRY_KLIK=1 (bersama DRY=1) → aksi pengubah data DIKLIK untuk menguji dialog/selektor; request non-GET tetap diblokir
const ubah = (t, ms, dur, dy) => ((DRY && process.env.DRY_KLIK !== '1') || process.env.UJI === '1' ? hover(t, ms, dur, dy) : tekan(t, ms, dur, dy)); // aksi yang MENGUBAH DATA
const ketik = async (teks, delay = 45) => { let selesai = false; const p = page.keyboard.type(teks, { delay }).then(() => { selesai = true; }); while (!selesai) await geser(400); await p; };
// gulir roda mouse (kursor di atas area) sampai target masuk layar; hanya saat tidak ada zoom aktif
async function gulirSampai(target, batasY = 760, max = 12, langkahGulir = -2) {
  const loc = typeof target === 'string' ? page.locator(target).first() : target;
  for (let i = 0; i < max; i++) { const b = await loc.boundingBox(); if (b && b.y + b.height < batasY) return; await kirim('roda ' + langkahGulir); await geser(280); }
}

// ===== alur resto: tiap berkas alur-*.js mengekspor (h) => ({ <id>: { akun, awal, hp?, siap?, jalan } }) =====
// akun: 'manajer' (bawaan) | 'kasir' | 'pelayan' | 'dapur' | 'publik' (tanpa login). hp: true → jendela HP 390x844.
const H = { P: () => page, BASE, AKUN, login, buka, hover, tekan, ubah, ketik, geser, geserSampai, kirim, ke, gulirSampai, arahkan, klik, keAtas, sleep, langkah, DRY };
const ALUR = {};
for (const f of fs.readdirSync(__dirname).filter((f) => /^alur-.*.js$/.test(f)).sort()) Object.assign(ALUR, require('./' + f)(H));

(async () => {
  const nama = process.argv[2];
  const alur = ALUR[nama]; if (!alur) throw new Error('alur tak dikenal: ' + nama + ' (ada: ' + Object.keys(ALUR).join(', ') + ')');
  const hp = !!alur.hp;
  // jendela = area kerja (1920x1008, taskbar tidak ikut terekam); HP: jendela kecil, viewport 390x844
  const args = ['--disable-features=Translate,TranslateUI', '--lang=id-ID', '--window-position=0,0', hp ? '--window-size=420,980' : '--window-size=1920,1008', '--force-device-scale-factor=1'];
  const browser = await chromium.launch({ headless: NOMOUSE, args });
  const ctx = await browser.newContext(hp ? { viewport: { width: 390, height: 844 }, isMobile: false, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } : (NOMOUSE ? { viewport: { width: 1920, height: 1008 } } : { viewport: null }));
  page = await ctx.newPage();
  if ((alur.akun || 'manajer') !== 'publik') await login(page, alur.akun || 'manajer');
  if (DRY) await page.route('**/*', (r) => (r.request().method() === 'GET' ? r.continue() : (console.log('BLOK', r.request().method(), r.request().url(), (r.request().postData() || '').slice(0, 400)), r.abort())));
  await buka(page, alur.awal);
  await sleep(800);
  if (alur.siap) await alur.siap();
  asal = NOMOUSE ? { x: 0, y: 0 } : await page.evaluate(() => ({ x: window.screenX + (window.outerWidth - window.innerWidth) / 2, y: window.screenY + window.outerHeight - window.innerHeight - (window.outerWidth - window.innerWidth) / 2 }));
  if (hp && !NOMOUSE) { // kalibrasi: gerakkan kursor OS ke titik tebakan, baca clientX/Y dari halaman
    await kirim('fokus Resto Nusantara'); await sleep(400);
    await page.evaluate(() => { window.__m = null; addEventListener('mousemove', (e) => { window.__m = [e.clientX, e.clientY]; }); });
    const gx = Math.round(asal.x + 200), gy = Math.round(asal.y + 300);
    await kirim(`move ${gx} ${gy} 0.2`); await sleep(300); await kirim(`move ${gx + 1} ${gy + 1} 0.1`); await sleep(400);
    const m = await page.evaluate(() => window.__m);
    if (m) { kal = { x: gx + 1 - m[0], y: gy + 1 - m[1] }; asal = kal; console.log('kalibrasi HP', JSON.stringify(kal)); } else console.error('kalibrasi HP gagal');
  }
  if (DRY) console.log('viewport', await page.evaluate(() => innerWidth + 'x' + innerHeight));
  await kirim(hp ? 'move 200 500 0.2' : 'move 960 560 0.2');
  console.log('SIAP');
  for (let i = 0; i < 300 && !DRY && !fs.existsSync(DIR + 'mulai.flag'); i++) await sleep(500);
  try { fs.unlinkSync(DIR + 'mulai.flag'); } catch {}
  if (!NOMOUSE) await kirim('fokus Resto Nusantara'); // Chrome harus foreground, kalau tidak klik pertama tidak sampai ke halaman
  await sleep(600);
  const t0 = Date.now();
  await alur.jalan();
  console.log('SELESAI', ((Date.now() - t0) / 1000).toFixed(1) + ' dtk alur', page.url());
  if (DRY) { fs.mkdirSync(DIR + 'dry', { recursive: true }); await page.screenshot({ path: DIR + 'dry/' + nama + '.png' }); }
  for (let i = 0; i < 240 && !DRY && !fs.existsSync(DIR + 'berhenti.flag'); i++) await sleep(500);
  try { fs.unlinkSync(DIR + 'berhenti.flag'); } catch {}
  await sleep(1500);
  await browser.close();
  if (mouse) mouse.kill();
})().catch((e) => { console.error(e.message); if (mouse) mouse.kill(); process.exit(1); });
