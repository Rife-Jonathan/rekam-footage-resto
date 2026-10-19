// Alur FASE A bagian 1: a1 Login, a2 Ringkasan Manajer, a4 Kategori & Addon, a5 Inventori, a6 Bahan Terbuang.
// Durasi alur ≈ target − 1 dtk. Tiru pola alur-a.js (a3).
module.exports = (h) => {
  const { P, hover, tekan, geser, kirim, langkah } = h;
  const roda = async (n, ms = 700) => { await kirim('roda ' + n); await geser(ms); };
  const teks = (t) => P().getByText(new RegExp('^\\s*' + t + '\\s*$', 'i')).first(); // huruf besar/kecil diabaikan (CSS uppercase)
  const baris = (t) => P().locator('tbody tr', { hasText: t }).first();

  return {
    // ---------- A1 Login (target 10) ----------
    a1: { akun: 'publik', awal: '/login', async jalan() {
      await langkah('halaman login', () => hover('h1', 2000, 0.6));
      await langkah('pilih manajer', () => tekan(P().getByRole('button', { name: 'Manajer', exact: true }), 1200, 0.9));
      await langkah('masuk', () => tekan(P().getByRole('button', { name: 'Masuk', exact: true }), 800, 0.9)); // POST login: di DRY terblokir (tidak masalah)
      await langkah('dashboard', () => geser(2200)); // dashboard tampil sebentar; JANGAN sorot (Rp0 hari ini)
    } },

    // ---------- A2 Ringkasan Manajer (target 16) ----------
    // Periode "Bulan ini" (1-31 Okt 2026, data terisi sampai ±19 Okt setelah reseed; pembanding = Sep) → cek ulang bila reseed lagi.
    // Kartu KPI adalah tautan ke /orders → JANGAN diklik, cukup hover (dy=22 → baris nilai, bukan baris "Turun xx%").
    a2: { awal: '/manager', async jalan() {
      await langkah('bulan ini', () => tekan(P().getByRole('button', { name: 'Bulan ini', exact: true }), 1500, 0.9));
      await langkah('kpi kotor', () => hover(teks('Penjualan Kotor'), 1900, 0.9, 22));
      await langkah('kpi bersih', () => hover(teks('Penjualan Bersih'), 1200, 0.9, 22));
      await langkah('rata-rata order', () => hover(teks('Rata-rata Order'), 2000, 0.9, 22));
      await langkah('gulir', async () => { await roda(-8, 900); await roda(-4, 700); });
      await langkah('pembanding', () => tekan(P().getByRole('heading', { name: 'Tren Pendapatan' }).first(), 2000, 0.9));
    } },

    // ---------- A4 Kategori & Addon (target 12) ----------
    a4: { awal: '/menu/categories', async jalan() {
      await langkah('kategori', () => hover(baris('Makanan Utama').locator('td').nth(0), 1600, 0.9));
      await langkah('kategori bawah', () => hover(baris('Camilan').locator('td').nth(0), 1200, 0.9));
      await langkah('tab addon', () => tekan(P().getByRole('link', { name: 'Addon', exact: true }), 1500, 0.9));
      await langkah('addon', () => hover(baris('Telur Ceplok').locator('td').nth(0), 1500, 0.9));
      await langkah('addon bawah', () => hover(baris('Keju Parut').locator('td').nth(1), 1200, 0.9));
    } },

    // ---------- A5 Inventori (target 16) ----------
    a5: { awal: '/inventory/ingredients', async jalan() {
      await langkah('nilai persediaan', () => tekan(teks('NILAI PERSEDIAAN'), 1800, 0.9));
      await langkah('stok menipis', () => tekan(teks('STOK MENIPIS'), 1800, 0.9));
      await langkah('daftar bahan', () => hover(baris('Ayam').locator('td').nth(1), 1400, 0.9));
      await langkah('riwayat bahan', () => tekan(baris('Ayam').getByText('Riwayat', { exact: true }), 2500, 0.9));
      await langkah('hasil', () => hover(P().getByText(/Menampilkan riwayat Ayam/), 2600, 0.9)); // panel riwayat pergerakan Ayam
    } },

    // ---------- A6 Bahan Terbuang (target 12) ----------
    a6: { awal: '/inventory/waste', async jalan() {
      await langkah('jumlah kejadian', () => hover(teks('JUMLAH KEJADIAN'), 1200, 0.9));
      await langkah('total nilai', () => tekan(teks('TOTAL NILAI LIMBAH'), 1800, 0.9));
      await langkah('nilai per alasan', () => tekan(teks('NILAI PER ALASAN'), 1800, 0.9));
      await langkah('daftar', () => hover(baris('Jeruk').locator('td').nth(1), 1400, 0.9));
      await langkah('daftar bawah', () => hover(baris('Cabai Merah').locator('td').nth(3), 1200, 0.9));
    } },
  };
};
