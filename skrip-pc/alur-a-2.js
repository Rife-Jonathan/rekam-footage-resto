// Alur FASE A bagian 2 — a7..a11 (bahan/SHOTLIST-RESTO.md). Baca-saja; tidak ada Simpan/Ajukan/Setujui.
// Kode SO/PO/pelanggan berubah tiap reseed → selektor memakai status / nama dengan fallback baris pertama.
module.exports = (h) => {
  const { P, hover, tekan, geser, kirim, langkah } = h;
  const roda = async (n, ms = 700) => { await kirim('roda ' + n); await geser(ms); };
  const baris = (teks) => P().locator('tbody tr', { hasText: teks }).first();
  const ada = async (loc) => (await loc.count()) > 0;
  // halaman kadang tampil kosong sesaat (hidrasi gagal) → muat ulang maksimal 3x sebelum mulai
  const siap = async () => { for (let i = 0; i < 3; i++) { if (await P().locator('main h1, main h2, main table').count().catch(() => 0)) return; await P().reload({ waitUntil: 'load' }).catch(() => {}); await P().waitForTimeout(2500); } };
  const iso = (d) => d.toISOString().slice(0, 10);

  return {
    // ---------- A7 Stok Opname ---------- target 15
    // Shotlist: SO draf. Pasca-reseed draf = kolom Stok Fisik kosong (selisih "-"), jadi dipilih yang DISETUJUI (fisik vs sistem + selisih terisi). Fallback: baris pertama.
    a7: { awal: '/inventory/counts', siap, async jalan() {
      await langkah('daftar', () => hover(baris('Disetujui'), 900, 0.9));
      await langkah('buka', async () => { const b = (await ada(baris('Disetujui'))) ? baris('Disetujui') : baris('SO-'); await tekan(b.getByText('Lihat').first(), 1500, 0.9); });
      await langkah('fisik vs sistem', () => hover(baris('Alpukat').locator('td').nth(2), 1600, 0.9));
      await langkah('gulir', async () => { await roda(-4, 900); });
      await langkah('selisih', () => tekan(baris('Keju').locator('td').nth(3), 2000, 0.9));
      await langkah('nilai selisih', () => hover(baris('Kopi Bubuk').locator('td').nth(4), 2200, 0.9));
    } },

    // ---------- A8 Pemasok + PO ---------- target 18
    // Shotlist: PO-...0002; setelah reseed PO berstatus Disetujui (PO-20261019-0002) berisi 3 item. Fallback: baris pertama.
    a8: { awal: '/purchasing/suppliers', siap, async jalan() {
      await langkah('pemasok', () => hover(baris('Sumber Pangan Jaya'), 1200, 0.9));
      await langkah('kontak', () => tekan(baris('Grosir Rempah').locator('td').nth(1), 1500, 0.9));
      await langkah('menu PO', () => tekan(P().locator('a', { hasText: 'Purchase Order' }).first(), 1500, 0.9));
      await langkah('daftar PO', () => P().waitForSelector('tbody tr', { timeout: 15000 }));
      await langkah('buka PO', async () => { const b = (await ada(baris('Disetujui'))) ? baris('Disetujui') : baris('PO-'); await tekan(b.getByText('Lihat').first(), 1500, 0.9); });
      await langkah('status', () => hover(P().getByText('Toko Segar Makmur').first(), 800, 0.9));
      await langkah('item', async () => { await roda(-3, 900); await hover(P().locator('tbody tr').nth(2), 1200, 0.8); });
      await langkah('cetak', () => hover(P().getByText('Cetak', { exact: true }).first(), 2200, 0.9)); // hover saja
    } },

    // ---------- A9 Tren Harga Beli ---------- target 12
    // Rentang bawaan = 90 hari terakhir (terisi). Ayam dipilih karena 10 titik harga (Rp38-39rb); bahan lain umumnya 1 titik. Bahan dipilih lewat selectOption (dropdown native tidak tampil di rekaman).
    a9: { awal: '/analytics/purchase-prices', siap, async jalan() {
      await langkah('pilih bahan', async () => { await hover('select', 800, 0.9); await P().locator('select').first().selectOption({ label: 'Ayam (Kg)' }); await geser(700); });
      await langkah('terapkan', () => tekan(P().getByRole('button', { name: 'Terapkan' }), 1500, 0.9));
      await langkah('kartu harga', () => hover(P().getByText('Harga Tertinggi').first(), 1000, 0.9));
      await langkah('grafik', () => tekan(P().getByText('Grafik Harga per Unit').first(), 2200, 0.9));
      await langkah('tabel', async () => { await roda(-4, 900); await hover(P().locator('tbody tr').nth(1), 1000, 0.8); });
    } },

    // ---------- A10 Pelanggan CRM ---------- target 16
    // Budi Santoso ada di data reseed (142 kunjungan). Fallback: baris pertama.
    a10: { awal: '/customers', siap, async jalan() {
      await langkah('daftar', () => hover(baris('Dimas Prakoso'), 1700, 0.9));
      await langkah('buka Budi', async () => { const b = (await ada(baris('Budi Santoso'))) ? baris('Budi Santoso') : baris('Lihat Profil'); await tekan(b.getByText('Lihat Profil').first(), 1500, 0.9); });
      await langkah('statistik', () => tekan(P().getByText('Total Kunjungan').first(), 2800, 0.9));
      await langkah('gulir', async () => { await roda(-4, 1100); await roda(-2, 800); });
      await langkah('riwayat', () => hover(P().locator('tbody tr, a:has-text("#ORD")').nth(2), 3400, 0.9));
    } },

    // ---------- A11 Pesanan ---------- target 16
    // Filter tanggal = 30 hari terakhir (dihitung dari hari ini, bisa diganti). Isi input date lewat fill (picker native tak dipakai).
    a11: { awal: '/orders', siap, async jalan() {
      const sampai = iso(new Date()), dari = iso(new Date(Date.now() - 30 * 864e5));
      await langkah('dari', async () => { const i = P().getByLabel('Dari tanggal'); await hover(i, 500, 0.9); await i.fill(dari); });
      await langkah('sampai', async () => { const i = P().getByLabel('Sampai tanggal'); await hover(i, 500, 0.7); await i.fill(sampai); });
      await langkah('terapkan', () => tekan(P().getByRole('button', { name: 'Terapkan' }), 1500, 0.8));
      await langkah('lunas', () => hover(baris('Lunas'), 800, 0.8));
      await langkah('buka detail', () => tekan(baris('Lunas').locator('a').first(), 1500, 0.9));
      await langkah('item', () => tekan(P().getByText('Item', { exact: false }).first(), 2200, 0.9));
      await langkah('gulir', async () => { await roda(-2, 1500); await roda(-1, 1700); });
    } },
  };
};
