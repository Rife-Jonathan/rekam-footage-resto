// Uji Recordly: Chrome kiosk di layar utama, klik dilakukan KURSOR OS ASLI (pyautogui) supaya
// Recordly bisa membaca gerak/klik kursor untuk auto-zoom. Playwright hanya mencari posisi elemen.
//   node growth/video/recordly/uji.js
const { chromium } = require('E:/Content-Machine/node_modules/playwright');
const { execFileSync } = require('child_process');
const PY = 'C:/Users/RIFE/AppData/Local/Programs/Python/Python310/python.exe';
const BASE = 'https://demo-dokter-gigi.nusawebsite.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function osClick(x, y, dur = 0.7) {
  execFileSync(PY, ['-c', `import pyautogui as p;p.FAILSAFE=False;p.moveTo(${Math.round(x)},${Math.round(y)},duration=${dur},tween=p.easeInOutQuad);p.click()`]);
}
function osMove(x, y, dur = 0.6) {
  execFileSync(PY, ['-c', `import pyautogui as p;p.FAILSAFE=False;p.moveTo(${Math.round(x)},${Math.round(y)},duration=${dur},tween=p.easeInOutQuad)`]);
}
// viewport → koordinat layar (tepi jendela + tinggi toolbar Chrome)
async function offset(page) {
  return page.evaluate(() => ({
    x: window.screenX + (window.outerWidth - window.innerWidth) / 2,
    y: window.screenY + (window.outerHeight - window.innerHeight) - (window.outerWidth - window.innerWidth) / 2,
  }));
}
async function klik(page, sel, after = 1500) {
  const loc = page.locator(sel).first();
  await loc.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
  const b = await loc.boundingBox();
  if (!b) throw new Error('tidak ketemu: ' + sel);
  const o = await offset(page);
  osClick(o.x + b.x + b.width / 2, o.y + b.y + b.height / 2);
  await sleep(after);
}

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--window-position=0,0', '--window-size=1920,1040', '--force-device-scale-factor=1'] });
  const ctx = await browser.newContext({ viewport: null });
  const page = await ctx.newPage();
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email], input[name=email], #email', 'admin@klinik.com');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 60000 });
  await page.waitForLoadState('networkidle');
  await sleep(1500);
  console.log('SIAP'); // tanda untuk mulai rekam
  // tunggu operator (Claude) menyalakan rekaman: buat file flag ini
  const fs = require('fs');
  const FLAG = 'E:/Rakazo/ref/recordly-uji/mulai.flag';
  for (let i = 0; i < 300 && !fs.existsSync(FLAG); i++) await sleep(1000);
  try { fs.unlinkSync(FLAG); } catch {}
  await sleep(+process.env.TUNGGU_MS || 4000);
  osMove(960, 540, 0.4);
  await sleep(1500);
  await klik(page, 'button:has-text("30H")', 3000);
  await klik(page, 'button:has-text("14H")', 3000);
  await klik(page, 'a:has-text("Antrean"), nav >> text=Antrean', 3500);
  osMove(900, 500, 0.8);
  await sleep(2000);
  console.log('SELESAI');
  await sleep(3000);
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
