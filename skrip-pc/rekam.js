// Rekam satu ALUR fitur DentalCare untuk Recordly (kursor OS asli → Recordly mencatat klik → zoom otomatis).
//   node rekam.js <appointment|odontogram|invoice|antrean>
// Cetak SIAP → tunggu mulai.flag → jalankan alur → cetak SELESAI → tunggu berhenti.flag (Chrome baru ditutup setelah rekaman stop).
const { chromium } = require('E:/Content-Machine/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const PY = 'C:/Users/RIFE/AppData/Local/Programs/Python/Python310/python.exe';
const BASE = 'https://demo-dokter-gigi.nusawebsite.com';
const DIR = 'E:/Rakazo/ref/recordly-uji/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mouse = spawn(PY, ['-u', __dirname + '/mouse_server.py'], { stdio: ['pipe', 'pipe', 'inherit'] });
const tunggu = [];
mouse.stdout.on('data', (d) => { for (const _ of String(d).trim().split('\n')) (tunggu.shift() || (() => {}))(); });
const kirim = (s) => new Promise((r) => { tunggu.push(r); mouse.stdin.write(s + '\n'); });

let page;
async function pusat(target, dy = 0) {
  const loc = typeof target === 'string' ? page.locator(target).first() : target;
  await loc.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
  const b = await loc.boundingBox({ timeout: 2500 });
  if (!b) throw new Error('tidak ketemu: ' + target);
  const o = await page.evaluate(() => ({
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
const ubah = (t, ms, dur, dy) => (DRY ? hover(t, ms, dur, dy) : tekan(t, ms, dur, dy)); // aksi yang MENGUBAH DATA
const ketik = async (teks, delay = 45) => { let selesai = false; const p = page.keyboard.type(teks, { delay }).then(() => { selesai = true; }); while (!selesai) await geser(400); await p; };
// gulir roda mouse (kursor di atas area) sampai target masuk layar; hanya saat tidak ada zoom aktif
async function gulirSampai(target, batasY = 760, max = 12, langkahGulir = -2) {
  const loc = typeof target === 'string' ? page.locator(target).first() : target;
  for (let i = 0; i < max; i++) { const b = await loc.boundingBox(); if (b && b.y + b.height < batasY) return; await kirim('roda ' + langkahGulir); await geser(280); }
}
const kartuQ = (n) => page.locator('div').filter({ hasText: n }).filter({ has: page.locator('button:has-text("Batal")') }).last();
const plus = (i) => page.locator('button:has(svg[class*="lucide-plus"])').nth(i);
const opsi = (teks) => page.locator('[role=option]').filter({ hasText: teks }).first();
// persiapan pemeriksaan (TIDAK direkam, klik sintetis Playwright)
const selanjutnya = async () => { await page.locator('button:has-text("Selanjutnya")').click(); await sleep(900); await page.evaluate(() => window.scrollTo({ top: 0 })); await sleep(300); };
async function isiSOAP() {
  await page.fill('textarea[placeholder="Masukkan temuan subjektif..."]', 'Nyeri gigi geraham kanan bawah sejak tiga hari');
  await page.fill('textarea[placeholder="Masukkan temuan objektif..."]', 'Karies dalam gigi 46, perkusi positif');
  await page.fill('textarea[placeholder="Masukkan assessment..."]', 'Pulpitis reversibel gigi 46');
  await page.fill('textarea[placeholder="Masukkan rencana tindakan..."]', 'Tambal komposit gigi 46');
  await page.click('button:has-text("Pilih diagnosis ICD-10")'); await sleep(500); await page.keyboard.type('K02'); await sleep(1200);
  await page.locator('text=/^K02/').first().click(); await sleep(500);
}
async function isiOdonto() {
  for (const [g, k] of [['46', 'Caries'], ['36', 'Filled']]) {
    const b = await page.locator(`button:text-is("${g}")`).first().boundingBox();
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2 + 24); await sleep(700);
    await page.getByText(k, { exact: true }).last().click(); await sleep(600);
  }
}
async function isiTindakanObat() {
  await page.click('button:has-text("Pilih Tindakan")'); await sleep(500);
  await page.fill('input[placeholder="Cari tindakan..."]', 'komposit'); await sleep(500);
  await opsi('Tambal Komposit (Posterior)').click(); await sleep(400); await plus(0).click(); await sleep(600);
  await page.click('button:has-text("Pilih dari Master")'); await sleep(500); await opsi('Amoxicillin 500mg').click(); await sleep(400);
  await page.fill('input[placeholder="E.g. 3x sehari"]', '3x sehari sesudah makan'); await page.fill('input[type=number]', '10'); await plus(1).click(); await sleep(600);
}

const ALUR = {
  antrean: { awal: '/queue', async jalan() {
    const kartu = (n) => page.locator('div').filter({ hasText: n }).filter({ has: page.locator('button:has-text("Batal")') }).last();
    await langkah('hover kartu', () => arahkan(kartu('Eko Prasetyo'), 0.9, 700));
    await langkah('riwayat', async () => { const c = kartu('Siti Rahayu'); await klik(c.locator('button:has-text("Riwayat")'), 1300); await klik(page.locator('button:has(svg.lucide-x)').first(), 600); });
    await langkah('tab riwayat', () => klik('button:has-text("Riwayat Antrian")', 1300));
    await langkah('tab aktif', () => klik('button:has-text("Antrian Aktif")', 900));
  } },
  appointment: { awal: '/appointments', async jalan() {
    await langkah('minggu', () => klik('button:has-text("week")', 1200));
    await langkah('hover jadwal', () => arahkan(page.locator('text=/Ahmad Fauzi/').first(), 0.9, 600));
    await langkah('bulan', () => klik('button:has-text("month")', 1300));
    await langkah('hari', () => klik('button:has-text("day")', 1200));
    await langkah('hover check in', () => arahkan('button:has-text("Check In")', 0.9, 900));
    await langkah('tombol baru', () => arahkan('button:has-text("Baru")', 0.9, 700));
  } },
  odontogram: { awal: '/odontogram/1', async jalan() {
    // tombol Edit ada di bawah: klik dulu (tanpa zoom lain aktif), tunggu zoom keluar, kembali ke atas TANPA zoom aktif
    await langkah('edit', () => klik('button:has-text("Edit Odontogram")', 1000));
    await keAtas();
    await langkah('hover legenda', () => arahkan('text=Caries', 0.9, 600));
    for (const [gigi, kondisi] of [['16', 'Caries'], ['26', 'Filled'], ['36', 'Crown']]) {
      await langkah('gigi ' + gigi, async () => {
        await klik(page.locator(`text="${gigi}"`).first(), 600, 28); // kotak gigi tepat di bawah nomornya
        await klik(page.getByText(kondisi, { exact: true }).last(), 800);
      });
    }
  } },
  invoice: { awal: '/invoices', async jalan() {
    await langkah('hover daftar', () => arahkan('text=INV000007', 0.9, 600));
    await langkah('buka invoice', () => klik('text=INV000001', 1500));
    await langkah('gulir', async () => { await sleep(800); await gulir(-3, 1200); await gulir(3, 900); }); // scroll hanya setelah zoom keluar, pelan
    await langkah('hover cetak', () => arahkan('button:has-text("Cetak")', 0.9, 900)); // jangan klik: dialog print native
    await langkah('kembali', () => klik('text=Semua Invoice', 1200));
  } },

  // ===== YT002 (SHOTLIST-YT002.md). Durasi alur ≈ target − 1 dtk (sesi menambah ±2 dtk). =====
  b1: { awal: '/dashboard', async jalan() { // target 30
    await langkah('pendapatan', () => hover('text=Pendapatan Bulan Ini', 2000));
    await langkah('antrean aktif', () => hover('text=Antrean Aktif', 2000));
    await langkah('grafik', () => hover('.recharts-wrapper', 2500, 1.0));
    await langkah('14H', () => tekan('button:has-text("14H")', 2000));
    await langkah('7H', () => tekan('button:has-text("7H")', 2200, 0.6));
    await langkah('demografi', () => hover('text=Demografi Pasien', 2000, 1.0, 120));
    await langkah('gulir', async () => { await kirim('roda -3'); await geser(1200); });
    await langkah('appointment hari ini', () => hover(page.getByText('Gigi berlubang dan sakit saat makan').first(), 3000, 1.0, -10));
    await langkah('leaderboard', () => hover('text=Leaderboard Dokter', 2500, 1.0, 60));
    await geser(2500);
  } },
  b2: { awal: '/patients', async jalan() { // target 12
    await langkah('ahmad', () => hover(page.locator('tr', { hasText: 'Ahmad Fauzi' }).first(), 2000, 0.9));
    await langkah('dewi', () => hover(page.locator('tr', { hasText: 'Dewi Lestari' }).first(), 2000, 0.8));
    await langkah('gulir', async () => { await kirim('roda -2'); await geser(900); await kirim('roda -1'); await geser(900); });
    await geser(3600);
  } },
  s1: { awal: '/appointments', async jalan() { // target 18,7. Check In butuh dokter dipilih dulu (PATCH doctor) → keduanya aksi pengubah data
    const ci = () => page.locator('button:has-text("Check In")').first();
    const kartuB = () => ci().locator('xpath=ancestor::div[.//button[@role="combobox"]][1]');
    await geser(700);
    await langkah('week', () => tekan('button:text-is("week")', 1300));
    await langkah('hover jadwal', () => hover(page.locator('.fc-event', { hasText: 'Ahmad Fauzi' }).first(), 1000, 0.8));
    await langkah('day', () => tekan('button:text-is("day")', 1500, 0.8));
    await langkah('hover booking', () => hover(page.getByText('Ahmad Fauzi', { exact: true }).first(), 1000, 0.8));
    await langkah('gulir booking', () => gulirSampai(ci(), 760, 8, -3));
    await langkah('pilih dokter', async () => { await tekan(kartuB().locator('button[role=combobox]'), 700, 0.7); await ubah(opsi('Arina Dewi Septiani'), 1000, 0.6); });
    await langkah('check in', () => ubah(ci(), 2300, 0.7));
  } },
  s2: { awal: '/queue', async jalan() { // target 16,1
    await langkah('kehadiran', () => hover(kartuQ('Eko Prasetyo'), 2000));
    await langkah('pemeriksaan', () => hover(kartuQ('Indira Sari'), 2000));
    await langkah('panggil', () => ubah(kartuQ('Eko Prasetyo').locator('button:has-text("Panggil")'), 3000));
    await langkah('buka RM', () => (DRY ? hover : tekan)(kartuQ('Indira Sari').locator('text=Buka Rekam Medis'), 2500));
    await geser(1900);
  } },
  s3: { awal: '/examination/' + EXAM, async jalan() { // target 20,4
    for (const [ph, teks] of [['temuan subjektif', 'Nyeri gigi geraham kanan bawah sejak tiga hari'], ['temuan objektif', 'Karies dalam gigi 46, perkusi positif'],
      ['assessment', 'Pulpitis reversibel gigi 46'], ['rencana tindakan', 'Tambal komposit gigi 46']]) {
      await langkah(ph, async () => { await tekan(`textarea[placeholder="Masukkan ${ph}..."]`, 500, 0.8); await ketik(teks, 35); await geser(300); });
    }
    await langkah('icd', async () => { await tekan('button:has-text("Pilih diagnosis ICD-10")', 500, 0.8); await ketik('K02', 120); await geser(500); await tekan(page.locator('text=/^K02/').first(), 1500, 0.7); });
    await geser(1000);
  } },
  s4: { awal: '/examination/' + EXAM, async siap() { await selanjutnya(); await page.locator('text=Peta Gigi').first().evaluate((e) => window.scrollTo({ top: e.getBoundingClientRect().top + window.scrollY - 90 })); await sleep(400); },
    async jalan() { // target 18,4
    await langkah('hover 46', () => hover('button:text-is("46")', 1500, 0.9, 40));
    await langkah('46 atas', () => tekan('button:text-is("46")', 1000, 0.5, 24));
    await langkah('caries', () => tekan(page.getByText('Caries', { exact: true }).last(), 2000, 0.8));
    await langkah('36 atas', () => tekan('button:text-is("36")', 1000, 0.9, 24));
    await langkah('filled', () => tekan(page.getByText('Filled', { exact: true }).last(), 2000, 0.8));
    await langkah('legenda', () => hover('text=WARNA PERMUKAAN GIGI', 1200, 2.0, 60));
    await geser(2600);
  } },
  s5: { awal: '/examination/' + EXAM, async siap() { await selanjutnya(); await selanjutnya(); }, async jalan() { // target 15,2
    await langkah('pilih tindakan', () => tekan('button:has-text("Pilih Tindakan")', 800, 0.8));
    await langkah('cari', async () => { await tekan('input[placeholder="Cari tindakan..."]', 500, 0.5); await ketik('komp', 60); });
    await langkah('tambal', () => tekan(opsi('Tambal Komposit (Posterior)'), 800, 0.6));
    await langkah('plus', () => tekan(plus(0), 900, 0.6));
    await langkah('master', () => tekan('button:has-text("Pilih dari Master")', 700, 0.8));
    await langkah('amox', () => tekan(opsi('Amoxicillin 500mg'), 700, 0.6));
    await langkah('instruksi', async () => { await tekan('input[placeholder="E.g. 3x sehari"]', 500, 0.6); await ketik('3x sehari sesudah makan', 30); });
    await langkah('qty', async () => { await tekan('input[type=number]', 500, 0.6); await page.keyboard.press('Control+A'); await ketik('10', 120); });
    await langkah('plus obat', () => tekan(plus(1), 1300, 0.6));
  } },
  s6: { awal: '/examination/' + EXAM, async siap() { await isiSOAP(); await selanjutnya(); await isiOdonto(); await selanjutnya(); await isiTindakanObat(); await selanjutnya(); },
    async jalan() { // target 12,9
    await langkah('gulir ringkasan', async () => { await ke(1000, 520, 0.6); await kirim('roda -1'); await geser(800); await kirim('roda -1'); await geser(800); });
    await langkah('perawat', async () => { await tekan('button:has-text("Pilih Perawat")', 0, 0.8); await tekan(page.locator('[role=option]').nth(1), 1000, 0.6); });
    await langkah('front office', async () => { await tekan('button:has-text("Pilih Front Office")', 0, 0.7); await tekan(page.locator('[role=option]').nth(1), 1000, 0.6); });
    await langkah('selesaikan', () => ubah('button:has-text("Selesaikan Kunjungan")', 3000, 0.8));
    await geser(800);
  } },
  s7: { awal: '/invoices', async jalan() { // target 17,8
    const baris = async () => ((await page.locator('tbody tr', { hasText: 'Indira Sari' }).count()) ? page.locator('tbody tr', { hasText: 'Indira Sari' }).first() : page.locator('tbody tr').first());
    await langkah('hover baris', async () => hover(await baris(), 2000));
    await langkah('buka', async () => tekan((await baris()).locator('a[href^="/invoices/"]').first(), 2000, 0.7));
    await langkah('tindakan', () => hover(page.locator('table').nth(0), 2000, 0.9));
    await langkah('resep', () => hover(page.locator('table').nth(1), 2000, 0.8));
    await langkah('cetak', () => hover('button:has-text("Cetak / Simpan PDF")', 2000, 1.0)); // JANGAN klik: dialog print native
    await geser(1300);
  } },
  s8: { awal: '/commissions', async jalan() { // target 14,8
    await langkah('kotor', () => hover('text=Total Kotor', 1500));
    await langkah('komisi', () => hover('text=Total Komisi Dibayar', 1500, 0.8));
    await langkah('filter', async () => { await tekan('button[role=combobox]:has-text("Semua Dokter")', 0, 0.9); await tekan(opsi('Arina Dewi Septiani'), 2500, 0.7); });
    await langkah('baris', () => hover(page.locator('tbody tr').first(), 2000, 0.9));
    await geser(1000);
  } },
};

(async () => {
  const nama = process.argv[2] || 'antrean';
  const alur = ALUR[nama]; if (!alur) throw new Error('alur tak dikenal: ' + nama);
  const browser = await chromium.launch({ headless: false, args: ['--window-position=0,0', '--window-size=1920,1040', '--force-device-scale-factor=1'] });
  page = await (await browser.newContext({ viewport: null })).newPage();
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email], input[name=email], #email', 'admin@klinik.com');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 60000 });
  if (DRY) await page.route('**/*', (r) => (r.request().method() === 'GET' ? r.continue() : (console.log('BLOK', r.request().method(), r.request().url()), r.abort())));
  await page.goto(BASE + alur.awal, { waitUntil: 'networkidle' });
  await sleep(800);
  if (alur.siap) await alur.siap();
  await kirim('move 960 560 0.2');
  console.log('SIAP');
  for (let i = 0; i < 300 && !DRY && !fs.existsSync(DIR + 'mulai.flag'); i++) await sleep(500);
  try { fs.unlinkSync(DIR + 'mulai.flag'); } catch {}
  await sleep(600);
  const t0 = Date.now();
  await alur.jalan();
  console.log('SELESAI', ((Date.now() - t0) / 1000).toFixed(1) + ' dtk alur', page.url());
  if (DRY) await page.screenshot({ path: DIR + 'dry-' + nama + '.png' });
  for (let i = 0; i < 240 && !DRY && !fs.existsSync(DIR + 'berhenti.flag'); i++) await sleep(500);
  try { fs.unlinkSync(DIR + 'berhenti.flag'); } catch {}
  await sleep(1500);
  await browser.close();
  mouse.kill();
})().catch((e) => { console.error(e.message); mouse.kill(); process.exit(1); });
