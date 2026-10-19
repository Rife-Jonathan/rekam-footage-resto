// Alur FASE B (bahan/SHOTLIST-RESTO.md) — alur end-to-end b1..b8. Nama alur = id klip.
// Durasi alur ≈ target − 1 dtk. SEMUA klik yang mengirim data lewat ubah() (DRY/UJI → hover saja).
// URUTAN WAJIB satu sesi: b1 → b2 → b3 → b4 → b5 → b6 → b7 → b8 (b2..b6 saling bergantung).
//
// ENV untuk take final (semua opsional; tanpa env alur memilih pesanan TERBARU secara dinamis):
//   PESANAN=ORD-20261019-0025   nomor pesanan B2 (dipakai b4/b5/b6). Kosong → kartu TERBAWAH kolom Baru (b4),
//                               baris TERBAWAH tab "Siap" (b5) / tab "Disajikan" (b6). Daftar pesanan urut naik → terbaru di bawah.
//                               Catatan: b3 (online) membuat pesanan kedua; kalau PESANAN kosong b4 mengambil yang terbawah (= b3).
//                               Kalau b4 ingin mengurus pesanan B2 (dine-in), isi PESANAN dengan nomor dari b2 (lihat /orders atau kartu Dapur).
//   MEJA_ORDER=Meja 08          meja yang dipakai b2 (satu-satunya meja kosong setelah reseed) → b5 menyorot kartu meja ini.
//   TGL_RESERVASI=2026-10-25    tanggal b7 (yyyy-mm-dd). Kosong → hari ini + 2.
//   NAMA_RESERVASI="Dewi Anggraini"   nama tamu b7 (dipakai lagi untuk mencari baris di /reservations).
// Catatan umum: b2 butuh meja KOSONG (reseed: hanya Meja 08). Ulangi take b2 = meja habis → reseed ulang.
module.exports = (h) => {
  const { P, hover, tekan, ubah, ketik, geser, kirim, langkah, keAtas, buka, BASE, sleep, DRY } = h;
  const roda = async (n, ms = 700) => { await kirim('roda ' + n); await geser(ms); };
  const PESANAN = process.env.PESANAN || '';
  const MEJA = process.env.MEJA_ORDER || 'Meja 08';
  const NAMA_RSV = process.env.NAMA_RESERVASI || 'Dewi Anggraini';
  const tglRsv = () => {
    if (process.env.TGL_RESERVASI) return process.env.TGL_RESERVASI;
    const d = new Date(Date.now() + 2 * 86400000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  // ---- locator bersama ----
  const btnTeks = (t) => P().locator('button', { hasText: new RegExp('^\\s*' + t + '\\s*$') }); // tombol dgn teks persis
  const kolom = (nama) => P().locator('section.card').filter({ has: P().locator('h2', { hasText: new RegExp('^\\s*' + nama) }) }).first(); // kolom papan Dapur
  const kartuDapur = (nama) => { // PESANAN → kartu itu; kosong → kartu TERBAWAH di kolom
    const k = kolom(nama).locator('article');
    return PESANAN ? k.filter({ hasText: PESANAN }).first() : k.last();
  };
  const barisPesanan = () => (PESANAN ? P().locator('tbody tr', { hasText: PESANAN }).first() : P().locator('tbody tr').last());
  const noInv = async () => { // "Invoice #2718" di kepala detail pesanan (muncul setelah lunas)
    const t = await P().locator('main').innerText().catch(() => '');
    const m = t.match(/Invoice\s*#(\d+)/i); return m ? m[1] : null;
  };
  const nonaktifCetak = () => P().context().addInitScript(() => { window.print = () => {}; }); // cegah dialog cetak OS di pratinjau invoice

  return {
    // ---------- B1 Dashboard hari ini (target 16) ----------
    // JANGAN sorot baris "Turun xx% dari kemarin": hover diarahkan ke angka (label + dy), bukan ke tengah kartu.
    b1: { akun: 'manajer', awal: '/dashboard', async jalan() {
      await langkah('penjualan', () => hover(P().getByText('Penjualan Hari Ini', { exact: true }).first(), 1300, 0.9, 30));
      await langkah('pesanan', () => hover(P().getByText('Pesanan Hari Ini', { exact: true }).first(), 900, 0.9, 30));
      await langkah('menu teratas', () => hover(P().locator('tbody tr').first(), 1300, 0.9));
      await langkah('stok rendah', () => hover(P().getByText('Stok Rendah', { exact: true }).first(), 1300, 0.9, 80));
      await langkah('status meja terisi', () => tekan(P().getByText(/^Terisi\s*\d/).first(), 1300, 0.9));
      await langkah('status meja dipesan', () => tekan(P().getByText(/^Dipesan\s*\d/).first(), 1000, 0.8));
      await langkah('pesanan terbaru', () => hover(P().getByText('Pesanan Terbaru', { exact: true }).first(), 1500, 0.9, 80));
    } },

    // ---------- B2 POS dine-in (target 20) — MENGUBAH DATA: buat pesanan + kirim ke dapur ----------
    // Tiap "Tambah" membuka dialog "Pilih Varian & Tambahan" → klik "Tambahkan ke Keranjang" (hanya state browser → tekan).
    // Meja = <select> native → hover + selectOption (popup native tidak terekam). Hanya meja kosong yang terdaftar di pilihan.
    b2: { akun: 'kasir', awal: '/pos', async jalan() {
      const tambah = async (i, ms = 600) => {
        await tekan(btnTeks('Tambah').nth(i), 600, 0.8);
        // TEMUAN uji kering: konfirmasi dialog ini LANGSUNG mengirim POST /api/v1/orders (membuat/menambah pesanan di server) → wajib ubah().
        await ubah(P().getByRole('button', { name: 'Tambahkan ke Keranjang' }), ms, 0.7);
        if (DRY) await P().keyboard.press('Escape').catch(() => {}); // uji kering: keranjang tidak terisi (POST diblokir) → tutup dialog agar langkah berikut bisa jalan
      };
      await langkah('kategori', () => tekan(P().getByRole('button', { name: /^Makanan Utama/ }), 900, 0.9));
      await langkah('menu 1', () => tambah(0));
      await langkah('menu 2', () => tambah(1));
      await langkah('menu 3', () => tambah(2, 900));
      await langkah('tipe dine-in', () => tekan(P().getByRole('button', { name: /^Makan di\s*Tempat/ }), 600, 0.8));
      await langkah('meja', async () => {
        const sel = P().locator('select').filter({ hasText: 'Pilih meja' }).first();
        await hover(sel, 500, 0.8);
        await sel.selectOption({ index: 1 }); // satu-satunya meja kosong (Meja 08)
        await geser(600);
      });
      await langkah('simpan', () => ubah(P().getByRole('button', { name: 'Simpan', exact: true }), 2200, 0.9));
      await langkah('hasil', () => geser(1500));
    } },

    // ---------- B3 Pesanan online HP (target 20) — MENGUBAH DATA: pesanan tamu ----------
    // Item pilihan tanpa varian ("Sate Ayam", "Es Jeruk") → tombol + menambah langsung (tanpa dialog). Checkout bawaan = "Antar" → klik "Bawa Pulang".
    // BELUM TERUJI: tautan lanjut di /keranjang (halaman kosong saat diintip → fallback goto /checkout), halaman /pesanan/selesai.
    b3: { akun: 'publik', hp: true, awal: '/', async jalan() {
      const plus = (nama) => P().locator(`button[aria-label="Tambah ${nama} ke keranjang"]:visible`).first();
      await langkah('menu', () => tekan(P().locator('nav a:visible', { hasText: /^Menu$/ }).last(), 900, 0.9));
      const tengah = async (l) => { await l.evaluate((e) => e.scrollIntoView({ block: 'center' })); await sleep(250); }; // tengah layar (hindari header/bottom-nav yang menutupi)
      await langkah('tambah 1', async () => { await tengah(plus('Sate Ayam')); await tekan(plus('Sate Ayam'), 400, 0.9); });
      await langkah('tambah 2', async () => { await tengah(plus('Es Jeruk')); await tekan(plus('Es Jeruk'), 400, 0.9); });
      await langkah('keranjang', async () => {
        await tekan(P().locator('nav a:visible', { hasText: /Keranjang/ }).last(), 1000, 0.9);
        await P().waitForLoadState('load').catch(() => {});
      });
      await langkah('ke checkout', async () => {
        const lanjut = P().locator('a[href*="/checkout"]:visible, button:visible', { hasText: /checkout|lanjut|pesan/i }).first();
        if (await lanjut.count()) await tekan(lanjut, 800, 0.9);
        if (!/\/checkout/.test(P().url())) await buka(P(), '/checkout'); // fallback
        // halaman publik kadang tampil kosong sesaat setelah navigasi → tunggu form, kalau tak muncul muat ulang sekali
        if (!(await P().locator('input[name=name]').waitFor({ timeout: 6000 }).then(() => true).catch(() => false))) { await P().reload(); await P().locator('input[name=name]').waitFor({ timeout: 10000 }).catch(() => {}); }
        await sleep(300);
      });
      await langkah('nama', async () => { await tekan(P().locator('input[name=name]'), 300, 0.8); await ketik('Rina Wijaya'); });
      await langkah('telepon', async () => { await tekan(P().locator('input[name=phone]'), 300, 0.8); await ketik('0812-0000-1101'); });
      await langkah('bawa pulang', () => tekan(P().locator('label', { hasText: 'Bawa Pulang' }).first(), 700, 0.8));
      await langkah('buat pesanan', () => ubah(P().getByRole('button', { name: 'Buat Pesanan' }), 1500, 0.9));
      await langkah('selesai', async () => { if (!DRY) await P().waitForURL(/selesai/, { timeout: 8000 }).catch(() => {}); await geser(1500); });
    } },

    // ---------- B4 Dapur KDS (target 18) — MENGUBAH DATA: status dapur ----------
    // Kolom = section.card dgn h2; kartu = article. BELUM TERUJI: tombol di kolom "Diterima" (kolom kosong saat diintip,
    // diasumsikan 1 tombol aksi di kartu, mis. "Mulai Masak") dan perpindahan kartu sesudah klik (request diblokir di uji kering).
    // Alur: Terima (Baru) → tombol aksi kartu di Diterima → "Tandai Siap" (Dimasak) → sorot kolom "Siap diambil".
    b4: { akun: 'dapur', awal: '/kitchen', async jalan() {
      await langkah('sorot kolom baru', () => hover(kartuDapur('Baru'), 1800, 0.9));
      await langkah('terima', () => ubah(kartuDapur('Baru').getByRole('button', { name: /Terima/ }), 2400, 0.9));
      await langkah('masak', () => ubah(kartuDapur('Diterima').getByRole('button').first(), 2400, 0.9));
      await langkah('tandai siap', () => ubah(kartuDapur('Dimasak').getByRole('button', { name: /Tandai Siap/ }), 2400, 0.9));
      await langkah('siap diambil', () => hover(kartuDapur('Siap diambil'), 3500, 0.9));
    } },

    // ---------- B5 Pelayan antar (target 15) — MENGUBAH DATA ----------
    // Papan Dapur punya tombol "Diambil pelayan", tapi akun Pelayan tidak punya menu Dapur → di sini pelayan memakai
    // detail pesanan: tombol "Tandai Disajikan" (status Siap → Disajikan). Lalu /tables: warna kartu meja berubah.
    b5: { akun: 'pelayan', awal: '/orders', async jalan() {
      await langkah('tab siap', () => tekan(P().getByRole('button', { name: 'Siap', exact: true }), 1100, 0.9));
      await langkah('buka pesanan', () => tekan(barisPesanan().locator('a').first(), 1700, 0.9));
      await langkah('detail', () => hover(P().getByText('Aksi Pesanan', { exact: true }).first(), 500, 0.8));
      await langkah('disajikan', () => ubah(P().getByRole('button', { name: 'Tandai Disajikan' }), 2000, 0.9));
      await langkah('meja', () => tekan(P().locator('aside a, nav a', { hasText: /^\s*Meja\s*$/ }).first(), 1700, 0.9));
      await langkah('kartu meja', () => hover(P().getByText(MEJA, { exact: true }).first(), 2000, 0.9, 40));
    } },

    // ---------- B6 Bayar + struk (target 18) — MENGUBAH DATA: pembayaran ----------
    // Dialog "Pembayaran Pesanan": pilih QRIS → "Simpan Pembayaran". Lalu invoice: tautan /invoices/ bila ada, selain itu
    // buka /invoices/<nomor di kepala "Invoice #N">/print. BELUM TERUJI: tautan/halaman invoice dan label status setelah lunas.
    b6: { akun: 'kasir', awal: '/orders', async siap() { await nonaktifCetak(); }, async jalan() {
      await langkah('tab disajikan', () => tekan(P().getByRole('button', { name: 'Disajikan', exact: true }), 1000, 0.9));
      await langkah('buka pesanan', () => tekan(barisPesanan().locator('a').first(), 1600, 0.9));
      await langkah('bayar', () => tekan(P().getByRole('button', { name: /^Bayar$/ }).first(), 1300, 0.9));
      await langkah('qris', () => tekan(P().getByRole('button', { name: 'QRIS', exact: true }), 1000, 0.8));
      await langkah('simpan bayar', () => ubah(P().getByRole('button', { name: 'Simpan Pembayaran' }), 1600, 0.9));
      await langkah('lunas', () => hover(P().getByText(/Lunas/).first(), 1300, 0.9));
      await langkah('invoice', async () => {
        const tautan = P().locator('a[href*="/invoices/"]').first();
        if (await tautan.count()) { await tautan.evaluate((e) => e.removeAttribute('target')); await tekan(tautan, 2500, 0.9); return; }
        const n = await noInv();
        if (n) { await buka(P(), `/invoices/${n}/print`); await geser(2500); }
      });
    } },

    // ---------- B7 Reservasi (target 18) — MENGUBAH DATA: reservasi + login di tengah klip ----------
    // Mulai sebagai tamu (HP), kirim, lalu login Pelayan lewat tombol "Masuk cepat untuk demo" → /reservations (jendela tetap HP).
    // Tanggal/jam/tamu = input date & select native → hover + isi programatik. BELUM TERUJI: kirim (response/halaman sukses),
    // login di tengah klip, baris reservasi baru muncul di /reservations (dicari lewat nama).
    b7: { akun: 'publik', hp: true, awal: '/reservasi', async jalan() {
      await langkah('nama', async () => { await tekan(P().locator('input[name=name]'), 300, 0.8); await ketik(NAMA_RSV); });
      await langkah('telepon', async () => { await tekan(P().locator('input[name=phone]'), 300, 0.8); await ketik('0812-0000-2202'); });
      await langkah('tanggal', async () => { await hover(P().locator('input[name=date]'), 250, 0.8); await P().locator('input[name=date]').fill(tglRsv()); await geser(300); });
      await langkah('jam', async () => { await hover(P().locator('select[name=time]'), 200, 0.8); await P().locator('select[name=time]').selectOption({ index: 6 }); await geser(250); });
      await langkah('tamu', async () => { await hover(P().locator('select[name=guest_count]'), 200, 0.8); await P().locator('select[name=guest_count]').selectOption('2'); await geser(250); });
      await langkah('kirim', async () => { const k = P().getByRole('button', { name: 'Kirim Reservasi' }); await k.evaluate((e) => e.scrollIntoView({ block: 'center' })); await sleep(250); await ubah(k, 1200, 0.9); }); // tengah layar: bottom-nav HP menutupi tombol di bawah
      await langkah('ke login', async () => { await buka(P(), '/login'); await sleep(200); });
      await langkah('pilih pelayan', () => tekan(P().getByRole('button', { name: /Pelayan/ }).first(), 500, 0.9));
      await langkah('masuk', () => ubah(P().locator('button[type=submit]').first(), 1000, 0.9));
      await langkah('daftar reservasi', async () => {
        await P().waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 8000 }).catch(() => {});
        await buka(P(), '/reservations'); await sleep(500);
        await hover(P().locator('tbody tr, article, li', { hasText: NAMA_RSV }).first(), 1500, 0.9);
      });
    } },

    // ---------- B8 Angka naik (target 14) — baca saja ----------
    // /dashboard (Operasional Hari Ini) → tautan "Ringkasan Manajer" → /manager periode "Hari ini". JANGAN sorot baris "Turun xx%".
    b8: { akun: 'manajer', awal: '/dashboard', async jalan() {
      await langkah('penjualan', () => hover(P().getByText('Penjualan Hari Ini', { exact: true }).first(), 1000, 0.9, 30));
      await langkah('pesanan', () => hover(P().getByText('Pesanan Hari Ini', { exact: true }).first(), 800, 0.9, 30));
      await langkah('ringkasan manajer', () => tekan(P().locator('a', { hasText: 'Ringkasan Manajer' }).first(), 1300, 0.9));
      await langkah('periode hari ini', () => tekan(P().getByRole('button', { name: 'Hari ini', exact: true }), 1100, 0.9));
      await langkah('kotor', () => hover(P().getByText('Penjualan Kotor', { exact: true }).first(), 1000, 0.9, 30));
      await langkah('order selesai', () => hover(P().getByText('Order Selesai', { exact: true }).first(), 1000, 0.9, 30));
      await langkah('rata-rata', () => hover(P().getByText('Rata-rata Order', { exact: true }).first(), 1000, 0.9, 30));
    } },
  };
};
