# Peta fitur — Resto Nusantara (demo NusaWebsite)

Dipetakan 19 Okt 2026 (baca-saja, tidak ada data yang diubah) dari https://resto.nusawebsite.com + kode sumber `E:\resto\resto-app` (Laravel + Inertia/React, Spatie roles).
Screenshot: folder ini (`NN-modul.png`; publik `7x-pub-*-d.png` desktop / `-m.png` HP 390x844; `8x-role-*.png`).

## Identitas
- Nama produk di UI: **Resto Nusantara** — tagline "Cita Rasa Indonesia, Layanan Berkelas". Logo bulat "R" hijau.
- Warna utama: `--color-primary-token: oklch(0.56 0.17 145)` ≈ **#118d29** (hijau). Mode gelap: oklch(0.72 0.16 145). Latar oklch(0.945 0.006 145) (abu kehijauan), sidebar putih, teks oklch(0.21 0 0). Aksen kedua di papan dapur: cokelat tua (tombol "Tandai Siap").
- Login: halaman split — foto sate/grill gelap di kiri, kartu login di kanan; ada tombol Passkey.

## Kredensial demo (publik, tampil sebagai tombol "Masuk cepat untuk demo")
Tombol hanya MENGISI email+sandi; harus klik **Masuk** sesudahnya. Sandi semua akun: `demo12345` (default `config/demo.php`, terverifikasi sama di live).

| Tombol | Email | Role | Halaman awal | Menu sidebar |
|---|---|---|---|---|
| Manajer | demo.manager@resto.test | manager (semua kecuali users.manage) | /dashboard | 26 menu (lihat bawah) |
| Kasir | demo.cashier@resto.test | cashier | /dashboard | Dashboard, POS, Pesanan, Pelanggan, Pembayaran, Absensi Saya |
| Pelayan | demo.waiter@resto.test | waiter | /orders | Pesanan, Meja, Reservasi, Pelanggan, Absensi Saya |
| Dapur | demo.kitchen@resto.test | kitchen | /kitchen | Dapur, Absensi Saya |

Role `admin` (Admin Resto) ada tapi sengaja tidak punya tombol demo → `/users` & `/roles` = 403 untuk manajer.

## Modul (login Manajer, viewport 1920x1080) — semua rute 200, tanpa error konsol

| # | Grup / Menu | Rute | Fungsi | Data | Aksi menarik untuk demo |
|---|---|---|---|---|---|
| 01 | Dashboard (Operasional Hari Ini) | /dashboard | Ringkasan hari ini: penjualan, pesanan, menu teratas, stok rendah, status meja, pesanan terbaru | **Penjualan/pesanan hari ini KOSONG (Rp0)**; stok rendah 3, meja 1/7/4, pesanan terbaru 30 Sep | Tab ke Ringkasan Manajer |
| 02 | Ringkasan Manajer | /manager | KPI per periode (kotor, diskon, bersih, pajak, servis, rata-rata order, tunai/non-tunai) + pembanding | Hari ini 0; pilih "Bulan lalu"/Kustom (Agu–Sep) agar terisi | Pemilih periode + pembanding |
| 03 | POS | /pos | Buat pesanan: kategori, kartu menu berfoto, keranjang, tipe Makan di Tempat/Bawa Pulang/Antar, meja, pelanggan, diskon, Bayar/Tahan/Simpan | 15 menu, 5 kategori, foto bagus | **Inti rekaman**: tambah menu → pilih meja → Bayar |
| 04 | Pesanan | /orders, /orders/{id} (46) | Daftar real-time, filter status/pembayaran/jenis/tanggal/metode; detail: item, status dapur, tambah item, bayar | Banyak (2.6rb+), terakhir 30 Sep; kartu ringkas "hari ini" 0 | Detail pesanan + status terpisah pesanan vs bayar |
| 05 | Dapur (Papan Dapur / KDS) | /kitchen | Kanban Baru → Diterima → Dimasak → Siap diambil → Diantar; auto-refresh "Pesanan baru masuk otomatis" | 5 pesanan aktif (Es Teh) tapi timer **26.8rb menit** (basi) | Terima → Tandai Siap → Diambil pelayan |
| 06 | Meja | /tables | Denah 3 area/12 meja, warna hijau/amber/biru, Lihat Pesanan, tambah area/meja | Terisi | Klik meja → pesanannya |
| 07 | Reservasi | /reservations | Daftar & buat reservasi, filter status/tanggal | **Kosong** | Buat Reservasi (atau dari web publik /reservasi) |
| 08 | Menu (+Kategori, Addon) | /menu/items, /menu/categories (48), /menu/addons (49), /menu/items/{id}/edit (50) | Menu, varian, harga, **HPP & margin** (Sehat/Rendah), foto, Tandai Habis | 15 menu, 5 kategori, 6 addon | Kolom HPP & margin, Tandai Habis |
| 09 | Inventori | /inventory/ingredients | Stok bahan, pergerakan, nilai persediaan Rp152,9 jt, stok menipis | 17 bahan, 3 menipis | Riwayat pergerakan, Catat Pergerakan |
| 10 | Bahan Terbuang | /inventory/waste | Catat limbah + nilai per alasan | 10 kejadian (Agu–Sep) | Ringkasan nilai limbah |
| 11 | Stok Opname | /inventory/counts, /{id} (52) | Hitung fisik vs sistem → ajukan → setujui | 2 (1 disetujui, 1 draf) | Buka draf SO-260930-002 |
| 12 | Pemasok | /purchasing/suppliers | Daftar pemasok | 3 | — |
| 13 | Purchase Order | /purchasing/orders, /{id} (51) | PO draf→disetujui→dipesan→diterima, cetak, penerimaan barang | 10+ PO | PO-20260930-0002 (Disetujui) |
| 45 | (tanpa menu) Tren Harga Beli | /analytics/purchase-prices | Grafik harga beli per bahan | Terisi Agu–Sep | Grafik |
| 14 | Pelanggan | /customers, /customers/{id} (47) | CRM: kunjungan, total belanja, riwayat pesanan & reservasi | 21 pelanggan, Rp110 jt | Profil Budi Santoso (138 kunjungan) |
| 15 | Website (CMS) | /website/home, /about (54), /contact, /media (55) | Atur hero, deskripsi, 3 menu unggulan, Tentang, Kontak, pustaka gambar | Terisi | "Lihat Situs" → web publik |
| 16 | Pembayaran | /payments/transactions | Transaksi per metode (Tunai/QRIS/Kartu/Transfer), refund | 2.681 transaksi | Baris refund QRIS |
| 41 | (tanpa menu) Metode Bayar | /payments/methods | Atur metode & urutan di kasir | 5 metode | — |
| 40 | (tanpa menu) Sesi Kas | /payments/cash-register, /discrepancies (59) | Buka kas, kas masuk/keluar, tutup kas, selisih | Belum ada sesi kas; tidak saya temukan tautannya di sidebar/POS | Buka Kas (mengubah data) |
| 17 | Laporan (+Pesanan, Menu, Inventori) | /reports/sales, /orders (42), /menu (43), /inventory (44) | Laporan penjualan, pesanan, menu terlaris, inventori | **Default hari ini = 0**; set tanggal 1–30 Sep agar terisi | Ganti rentang tanggal |
| 18 | Biaya Operasional | /expenses, /expenses/categories (56) | Ledger biaya per kategori | Rp7,06 jt, 27 transaksi | "Estimasi laba operasional: Segera hadir" |
| 19 | Log Audit | /audit | Siapa mengubah apa, nilai lama→baru | Terisi | Filter aksi |
| 20 | Absensi Saya | /people/attendance | Clock-in karyawan | Manajer: "Akun belum tertaut ke data karyawan" | — |
| 21 | Karyawan | /people/employees | Data karyawan + tautan akun | 5, semua "Tidak ada akun" | — |
| 22 | Jadwal Shift | /people/shifts | Template shift + jadwal mingguan | 2 shift (Pagi/Malam), jadwal minggu ini kosong ("—") | — |
| 23 | Rekap Absensi | /people/rekap | Total jam, hadir/terlambat, koreksi | 273 hadir, 26 terlambat (s.d. 30 Sep) | — |
| 24 | Penggajian | /people/payroll, /{id} (53) | Periode gaji dari absensi, slip gaji, finalisasi | 1 periode Agu 2026 difinalisasi (Rp11,13 jt) | Slip Gaji |
| 25 | Kompensasi | /people/compensation | Gaji pokok/harian/per jam, lembur, tunjangan | Terisi | — |
| 26 | Pengaturan | /settings/restaurant (+profile, security, appearance) | Info restoran, pajak & servis, kasir & struk, jam buka, target SLA, persetujuan manajer, batas margin | Pajak/servis tampil 0% di POS | Tab-tab pengaturan |

## Sisi pelanggan (publik, tanpa login) — 70–76 `*-d.png` / `*-m.png`
`/` beranda (hero foto interior, menu unggulan, tentang), `/menu`, `/tentang`, `/kontak`, `/keranjang`, `/checkout` (tamu: Bawa Pulang / Antar + alamat), `/pesanan/selesai`, `/reservasi` (form tanggal/jam/jumlah tamu). Di HP ada bottom-nav (Beranda, Menu, Keranjang, Pesanan, Akun).
**Menu QR per meja: belum saya temukan** (tidak ada rute/halaman QR di `routes/*.php` maupun `resources/js/pages`). Pesan online publik hanya Bawa Pulang/Antar; makan di tempat lewat POS/pelayan.
Struk publik bertanda tangan: `/receipts/{order}` (link dari WA/email).

## Alur end-to-end untuk rekaman
1. **Pelanggan (HP 390x844)**: `/` → Lihat Menu → tambah ke keranjang → `/checkout` (nama, telepon, Bawa Pulang) → Buat Pesanan → `/pesanan/selesai`. *(Atau dine-in: Pelayan/Kasir buat pesanan di POS dengan pilih meja.)*
2. **Kasir/Pelayan**: `/orders` → pesanan baru muncul status Menunggu → konfirmasi (Diterima).
3. **Dapur** (login Dapur → `/kitchen`): kartu masuk otomatis di kolom Baru → Terima → (Dimasak) Tandai Siap → Siap diambil.
4. **Pelayan**: "Diambil pelayan" → Diantar/Disajikan; `/tables` warna meja berubah.
5. **Kasir**: `/pos` atau detail pesanan → Bayar (Tunai/QRIS/Kartu/Transfer) → struk/invoice cetak (`/invoices/{id}/print`) → status Lunas/Selesai.
6. **Manajer**: `/dashboard` & `/manager` angka hari ini naik; `/reports/sales`; stok bahan berkurang otomatis di `/inventory/ingredients` (resep/HPP).

Saran urutan rekam: Login (tombol demo) → Dashboard → POS (buat pesanan meja) → Dapur → Meja → Pesanan detail + Bayar → Website publik di HP (pesan online + reservasi) → Menu (HPP/margin) → Inventori/Stok Opname/PO → Pelanggan → Laporan & Ringkasan Manajer (rentang bulan lalu) → Biaya → Karyawan/Absensi/Penggajian → Log Audit → Pengaturan.

## Masalah yang perlu dibereskan sebelum rekam
1. **Data demo beku di 30 Sep 2026** (DEBT D59 di repo): semua angka "hari ini" Rp0/0, laporan default kosong, papan dapur menampilkan timer ~26.859 menit dan 5 pesanan "aktif" basi. → Reseed demo (resep di `E:\resto\resto-app\HANDOFF.md`, ±6 menit) atau buat perintah geser tanggal, sesaat sebelum rekam.
2. **Tidak ada banner "MODE DEMO"** yang terlihat (tidak ditemukan di dashboard/halaman publik); demo hanya ditandai tombol masuk cepat.
3. Reservasi kosong; jadwal shift minggu ini kosong; karyawan tak tertaut akun (Absensi Saya manajer menampilkan peringatan).
4. `/kontak` menampilkan Alamat/Telepon/Email "-", padahal footer beranda menampilkan Jl. Merdeka No. 10 & +62 21 555 0101 (Pengaturan → Informasi Restoran belum diisi).
5. Pajak & biaya layanan 0% di POS (cek tab Pajak & Biaya Layanan bila ingin demo pajak), padahal riwayat pesanan memakai pajak (Rp8.000 → Rp9.280).
6. Sesi Kas & Metode Bayar & Tren Harga Beli tidak punya menu sidebar (akses via URL langsung).
7. Biaya Operasional: kartu "Estimasi laba operasional — Segera hadir" (fitur belum ada; hindari disorot).
8. Menu QR meja tidak ada → jangan janjikan di naskah.
