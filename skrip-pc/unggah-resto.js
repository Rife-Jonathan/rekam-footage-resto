// Unggah klip resto ke Directus lewat skill/directus-pustaka/simpan.mjs (folder Nusawebsite/Video/Restoran/Footage Recordly/<modul>).
//   node unggah-resto.js [--dry] a3 a1 ...      file sumber: out/fase-a/<id>.mp4 atau out/fase-b/<id>.mp4
// Token: env DIRECTUS_TOKEN (dibaca dari rahasia/directus-token.txt bila kosong; TIDAK dicetak).
// Hasil per klip ditulis ke out/unggah.json (id file Directus) untuk LAPORAN.md.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const KLIP = {
  a1: ['a1-login', 'login', 'halaman login split foto sate, tombol Masuk cepat untuk demo (Manajer) lalu dashboard'],
  a2: ['a2-manajer', 'ringkasan-manajer', 'Ringkasan Manajer periode Bulan ini: KPI kotor, bersih, rata-rata order dan pembanding periode'],
  a3: ['a3-menu-hpp', 'menu', 'daftar menu berfoto dengan kolom HPP & margin (Sehat/Rendah), edit menu Rawon dan Rincian HPP Resep'],
  a4: ['a4-kategori-addon', 'menu', 'daftar kategori menu lalu daftar addon'],
  a5: ['a5-inventori', 'inventori', 'nilai persediaan, stok menipis dan riwayat pergerakan bahan Ayam'],
  a6: ['a6-waste', 'inventori', 'bahan terbuang: ringkasan nilai limbah per alasan'],
  a7: ['a7-opname', 'inventori', 'stok opname: stok fisik vs sistem dan selisih per bahan'],
  a8: ['a8-po', 'pembelian', 'daftar pemasok lalu detail purchase order berstatus Disetujui (item, status, cetak)'],
  a9: ['a9-harga-beli', 'pembelian', 'tren harga beli bahan Ayam dalam grafik'],
  a10: ['a10-pelanggan', 'pelanggan', 'CRM pelanggan: profil Budi Santoso, kunjungan, total belanja, riwayat pesanan'],
  a11: ['a11-pesanan', 'pesanan', 'daftar pesanan filter 30 hari terakhir dan detail pesanan Lunas (item, status dapur, pembayaran)'],
  a12: ['a12-meja', 'meja', 'denah meja 3 area dengan warna status, buka pesanan meja terisi (akun Pelayan)'],
  a13: ['a13-pembayaran', 'pembayaran', 'transaksi pembayaran filter QRIS dan baris refund'],
  a14: ['a14-laporan', 'laporan', 'laporan penjualan 30 hari terakhir lalu laporan menu terlaris'],
  a15: ['a15-biaya', 'biaya', 'ledger biaya operasional per kategori'],
  a16: ['a16-absensi', 'karyawan', 'rekap absensi hadir/terlambat lalu template jadwal shift'],
  a17: ['a17-gaji', 'karyawan', 'penggajian: periode Sep 2026 difinalisasi dan slip gaji karyawan'],
  a18: ['a18-audit', 'audit', 'log audit dengan filter aksi, nilai lama ke baru'],
  a19: ['a19-cms', 'website', 'CMS website: hero dan menu unggulan, lalu Lihat Situs ke web publik'],
  a20: ['a20-web-hp', 'website', 'web publik di HP: beranda, halaman menu dan bottom-nav'],
  a21: ['a21-pengaturan', 'pengaturan', 'pengaturan restoran: kasir & struk, jam buka, target SLA, batas margin'],
  a22: ['a22-role', 'akses-role', 'akses per role: sidebar Kasir terbatas, logout, login Dapur hanya menu Dapur'],
};
const dry = process.argv.includes('--dry');
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const env = { ...process.env, DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN || fs.readFileSync(path.join(ROOT, 'rahasia/directus-token.txt'), 'utf8').trim() };
const catat = path.join(ROOT, 'out/unggah.json');
const hasil = fs.existsSync(catat) ? JSON.parse(fs.readFileSync(catat, 'utf8')) : {};
for (const id of ids) {
  const [nama, modul, apa] = KLIP[id] || [];
  if (!nama) { console.log(id, 'TIDAK DIKENAL'); continue; }
  const src = ['fase-a', 'fase-b'].map((d) => path.join(ROOT, 'out', d, id + '.mp4')).find((f) => fs.existsSync(f));
  if (!src) { console.log(id, 'FILE TIDAK ADA'); continue; }
  const file = path.join(ROOT, 'out', nama + '.mp4');
  fs.copyFileSync(src, file);
  const args = [path.join(ROOT, 'skill/directus-pustaka/simpan.mjs'), '--brand', 'Nusawebsite', '--jenis', 'Video',
    '--sub', 'Restoran/Footage Recordly/' + modul, '--file', file, '--varian', 'resto ' + nama.replace(/-/g, ' '),
    '--produk', 'Restoran', '--kategori', 'screen-recording', '--deskripsi', `Footage Recordly resto ${modul}: ${apa}. Untuk merakit video review aplikasi restoran.`,
    '--tags', `resto,recordly,${modul}`];
  if (dry) args.push('--dry');
  if (process.argv.includes('--ganti')) args.push('--ganti');
  try {
    const out = execFileSync('node', args, { env, encoding: 'utf8', cwd: ROOT });
    const idDx = (out.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/) || [])[0];
    console.log(`${id} ${dry ? 'DRY' : 'OK'} ${idDx || ''}\n${out.trim().split('\n').slice(-6).join('\n')}`);
    if (!dry && idDx) { hasil[id] = { file: nama + '.mp4', modul, directus: idDx }; fs.writeFileSync(catat, JSON.stringify(hasil, null, 2)); }
  } catch (e) { console.log(id, 'GAGAL', (e.stdout || '') + (e.stderr || e.message).slice(0, 400)); }
}
