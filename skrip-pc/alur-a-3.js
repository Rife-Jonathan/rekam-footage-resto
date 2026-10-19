// Alur FASE A bagian 3 (a12-a16) — klip baca-saja. Aksi pengubah data: tidak ada (hanya filter/navigasi).
// Filter tanggal (a14): "30 hari terakhir" = 30 hari berakhir di tanggal akhir bawaan halaman (hari ini), diisi lewat input date
// (bisa diganti rentang lain setelah reseed). Durasi alur ≈ target − 1 dtk.
module.exports = (h) => {
  const { P, hover, tekan, geser, kirim, langkah } = h;
  const roda = async (n, ms = 700) => { await kirim('roda ' + n); await geser(ms); };
  const baris = (teks) => P().locator('tbody tr', { hasText: teks }).first();
  // isi rentang 30 hari terakhir (akhir = nilai bawaan end_date halaman)
  const rentang30 = async () => {
    const akhir = await P().locator('input[name=end_date]').inputValue();
    const d = new Date(akhir + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 29);
    const awal = d.toISOString().slice(0, 10);
    await tekan('input[name=start_date]', 700, 0.9);
    await P().locator('input[name=start_date]').fill(awal);
    await P().waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  };
  const pilih = async (sel, label) => { await P().locator(sel).first().selectOption({ label }); await P().waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {}); };

  return {
    // ---------- A12 Meja (Pelayan) ----------
    a12: { akun: 'pelayan', awal: '/tables', async jalan() { // target 14
      await langkah('area', () => hover(P().getByText('Ruang Utama', { exact: true }).first(), 1600));
      await langkah('teras', () => hover(P().getByText('Teras', { exact: true }).first(), 1000));
      await langkah('vip', () => hover(P().getByText('VIP', { exact: true }).first(), 1400));
      const lihat = P().locator('a:has-text("Lihat Pesanan"), button:has-text("Lihat Pesanan")').first();
      await langkah('tengahkan', async () => { await lihat.evaluate((e) => e.scrollIntoView({ block: 'center' })); await h.sleep(400); }); // tombol tidak boleh di bawah header sticky
      await langkah('meja terisi', () => hover(lihat, 1500, 0.9, -60));
      await langkah('lihat pesanan', () => tekan(lihat, 2500, 0.9)); // navigasi saja
    } },

    // ---------- A13 Pembayaran ----------
    a13: { awal: '/payments/transactions', async jalan() { // target 14
      await langkah('judul', () => hover(P().getByText('Transaksi (', { exact: false }).first(), 1000, 0.9));
      await langkah('filter qris', async () => { await hover('select', 700, 0.9); await pilih('select', 'QRIS'); });
      await langkah('daftar', () => hover(baris('QRIS').locator('td').nth(2), 1600, 0.8));
      await langkah('refund', () => hover(baris('Refund').locator('td').nth(2), 2200, 0.9));
      await langkah('jumlah refund', () => hover(baris('Refund').locator('td').last(), 2800, 0.9));
    } },

    // ---------- A14 Laporan (penjualan -> menu) ----------
    a14: { awal: '/reports/sales', async jalan() { // target 18
      await langkah('rentang', rentang30);
      await langkah('ringkasan', () => hover(P().getByText('Ringkasan Penjualan').first(), 1500, 0.9));
      await langkah('total', () => hover(baris('Total'), 1500, 0.9));
      await langkah('kartu total', () => hover(P().getByText('Total tagihan', { exact: true }).first(), 1200, 0.9));
      // /reports/menu tidak punya tautan di sidebar/halaman → pindah lewat URL langsung
      await langkah('buka menu', async () => { await P().goto(h.BASE + '/reports/menu', { waitUntil: 'load' }); await P().waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {}); });
      await langkah('rentang menu', rentang30);
      await langkah('terlaris', () => hover(baris('Ayam Bakar Madu').locator('td').nth(0), 2200, 0.9));
      await langkah('omzet', () => hover(baris('Nasi Goreng Spesial').locator('td').last(), 1800, 0.9));
    } },

    // ---------- A15 Biaya ----------
    a15: { awal: '/expenses', async jalan() { // target 12
      await langkah('total', () => hover(P().getByText('Biaya periode ini', { exact: false }).first(), 1000, 0.9));
      await langkah('kategori terbesar', () => hover(P().getByText('Kategori terbesar', { exact: false }).first(), 1000, 0.9));
      await langkah('ledger', () => hover(baris('Tercatat').locator('td').nth(1), 1800, 0.9, 0));
      await langkah('gulir', async () => { await roda(-3, 900); });
      await langkah('baris', () => hover(P().locator('tbody tr').nth(6).locator('td').nth(1), 2500, 0.9));
    } },

    // ---------- A16 Absensi ----------
    a16: { awal: '/people/rekap', async jalan() { // target 14
      await langkah('rekap', () => hover(baris('Hadir').locator('td').nth(1), 1900, 0.9));
      await langkah('terlambat', () => hover(baris('Terlambat').locator('td').nth(4), 1800, 0.9));
      await langkah('menu shift', () => tekan(P().locator('aside a, nav a', { hasText: /^Jadwal Shift$/ }).first(), 1500, 0.9));
      await langkah('template', () => hover(P().getByText('Template Shift').first(), 1500, 0.9));
      await langkah('shift pagi', () => hover(baris('Pagi').locator('td').nth(1), 1500, 0.9));
    } },
  };
};
