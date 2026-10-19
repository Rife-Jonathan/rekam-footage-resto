// Alur rekam "Antrean pasien" untuk Recordly. Kursor OS asli (pyautogui) supaya Recordly mencatat klik.
// Jeda dibuat pendek (owner: kursor jangan diam terlalu lama).
//   node rekam-antrean.js   → cetak SIAP, tunggu file flag mulai.flag, jalankan alur, cetak SELESAI
const { chromium } = require('E:/Content-Machine/node_modules/playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const PY = 'C:/Users/RIFE/AppData/Local/Programs/Python/Python310/python.exe';
const BASE = 'https://demo-dokter-gigi.nusawebsite.com';
const FLAG = 'E:/Rakazo/ref/recordly-uji/mulai.flag';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// satu proses Python untuk semua gerak kursor (tanpa jeda start per gerakan)
const { spawn } = require('child_process');
const mouse = spawn(PY, ['-u', __dirname + '/mouse_server.py'], { stdio: ['pipe', 'pipe', 'inherit'] });
let tunggu = [];
mouse.stdout.on('data', (d) => { for (const _ of String(d).trim().split('\n')) (tunggu.shift() || (() => {}))(); });
const kirim = (s) => new Promise((r) => { tunggu.push(r); mouse.stdin.write(s + '\n'); });
const py = (code) => { // kompatibel: hanya pola moveTo(...)[;p.click()]
  const m = /moveTo\((\d+),(\d+),duration=([\d.]+)/.exec(code);
  return kirim(`${/click\(\)/.test(code) ? 'click' : 'move'} ${m[1]} ${m[2]} ${m[3]}`);
};

let page;
async function pusat(target) {
  const loc = typeof target === 'string' ? page.locator(target).first() : target;
  await loc.scrollIntoViewIfNeeded({ timeout: 6000 }).catch(() => {});
  const b = await loc.boundingBox({ timeout: 2500 });
  if (!b) throw new Error('tidak ketemu: ' + target);
  const o = await page.evaluate(() => ({
    x: window.screenX + (window.outerWidth - window.innerWidth) / 2,
    y: window.screenY + (window.outerHeight - window.innerHeight) - (window.outerWidth - window.innerWidth) / 2,
  }));
  return [Math.round(o.x + b.x + b.width / 2), Math.round(o.y + b.y + b.height / 2)];
}
async function arahkan(target, dur = 0.55, after = 500) {
  const [x, y] = await pusat(target);
  await py(`p.moveTo(${x},${y},duration=${dur},tween=p.easeInOutQuad)`);
  await sleep(after);
}
async function klik(target, after = 900) {
  const [x, y] = await pusat(target);
  await py(`p.moveTo(${x},${y},duration=0.5,tween=p.easeInOutQuad);p.click()`);
  await sleep(after);
}
async function langkah(nama, fn) { try { await fn(); } catch (e) { console.error('lewati', nama, e.message); } }

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--window-position=0,0', '--window-size=1920,1040', '--force-device-scale-factor=1'] });
  const ctx = await browser.newContext({ viewport: null });
  page = await ctx.newPage();
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email], input[name=email], #email', 'admin@klinik.com');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 60000 });
  await page.goto(BASE + '/queue', { waitUntil: 'networkidle' });
  await sleep(1000);
  await py("p.moveTo(960,560,duration=0.2)");
  console.log('SIAP');
  for (let i = 0; i < 300 && !fs.existsSync(FLAG); i++) await sleep(500);
  try { fs.unlinkSync(FLAG); } catch {}
  await sleep(600);

  const kartu = (n) => page.locator('div').filter({ hasText: n }).filter({ has: page.locator('button:has-text("Batal")') }).last();
  await langkah('hover kartu', () => arahkan(kartu('Eko Prasetyo'), 0.7, 700));
  await langkah('riwayat', async () => {
    const c = kartu('Siti Rahayu');
    await arahkan(c, 0.5, 300);
    await klik(c.locator('button:has-text("Riwayat")'), 1300);
    await klik(page.locator('button:has(svg.lucide-x)').first(), 600);
  });
  await langkah('tab riwayat', () => klik('button:has-text("Riwayat Antrian")', 1300));
  await langkah('tab aktif', () => klik('button:has-text("Antrian Aktif")', 900));
  await langkah('menu data pasien', () => klik('a:has-text("Data Pasien")', 1500));
  await langkah('hover baris', () => arahkan('table tbody tr:nth-child(2), [role=row]:nth-child(3)', 0.6, 900));
  console.log('SELESAI');
  // JANGAN tutup Chrome sebelum rekaman distop — kalau jendela hilang, Recordly merekam desktop owner (ikon pribadi terlihat)
  const STOP = 'E:/Rakazo/ref/recordly-uji/berhenti.flag';
  for (let i = 0; i < 240 && !fs.existsSync(STOP); i++) await sleep(500);
  try { fs.unlinkSync(STOP); } catch {}
  await sleep(1500);
  await browser.close();
  mouse.kill();
})().catch((e) => { console.error(e.message); process.exit(1); });
