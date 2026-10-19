// Alur FASE A (bahan/SHOTLIST-RESTO.md) — klip baca-saja. Nama alur = id klip (a1..a22).
// Durasi alur ≈ target − 1 dtk (sesi menambah ±1-2 dtk). Aksi pengubah data WAJIB lewat ubah() (DRY/UJI → hover saja).
// Pola gerak: tekan/hover = meluncur ±0,9 dtk → klik → geser kecil; gulir (roda) hanya setelah zoom keluar.
module.exports = (h) => {
  const { P, hover, tekan, geser, kirim, langkah } = h;
  const roda = async (n, ms = 700) => { await kirim('roda ' + n); await geser(ms); }; // gulir roda mouse di posisi kursor
  const baris = (teks) => P().locator('tbody tr', { hasText: teks }).first();

  return {
    // ---------- A3 Menu + HPP (klip uji) ----------
    a3: { awal: '/menu/items', async jalan() { // target 18
      await langkah('foto menu', () => hover(baris('Nasi Goreng Spesial').locator('td').nth(0), 1200));
      await langkah('gulir daftar', async () => { await roda(-3, 900); await roda(-2, 900); });
      await langkah('hpp sehat', () => hover(baris('Ayam Bakar Madu').locator('td').nth(4), 1500, 0.9));
      await langkah('hpp rendah', () => hover(baris('Iga Bakar Kecap').locator('td').nth(4), 1400, 0.8));
      await langkah('ubah rawon', () => tekan(baris('Rawon Daging').locator('a:has-text("Ubah")'), 1800, 0.9));
      await langkah('harga', () => hover('#base_price', 1200, 0.9));
      await langkah('gulir ke hpp', async () => { await roda(-5, 900); await roda(-4, 1000); });
      await langkah('rincian hpp', () => tekan(P().getByText('Rincian HPP Resep').first(), 2000, 0.9, 60)); // klik teks kartu (tanpa aksi) → zoom ke rincian; JANGAN simpan
    } },
  };
};
