# SHOTLIST — pustaka footage "Resto Nusantara" (https://resto.nusawebsite.com)

Sumber: peta fitur 19 Okt 2026 (`bahan/peta/PETA.md` + screenshot acuan `bahan/peta/*.png`). Pustaka PER MODUL, bukan per video:
klip dipakai ulang banyak video. Durasi target 12-20 dtk per klip (boleh lebih 1-2 dtk).

## Login demo (publik)
Halaman `/login` punya tombol "Masuk cepat untuk demo" (Manajer / Kasir / Pelayan / Dapur). Tombol hanya MENGISI form → klik **Masuk**.
Sandi semua akun `demo12345`. Manajer `demo.manager@resto.test`, Kasir `demo.cashier@resto.test`, Pelayan `demo.waiter@resto.test`,
Dapur `demo.kitchen@resto.test`. Viewport 1920x1040; klip HP = 390x844 (jendela browser kecil, tetap rekam JENDELA saja).

## FASE A — klip baca-saja (BOLEH direkam sekarang, tidak mengubah data)
Data demo berhenti di 30 Sep 2026 → semua filter tanggal pakai **"Bulan lalu" / 1–30 Sep 2026** supaya angka terisi.
JANGAN rekam layar yang menampilkan Rp0 "hari ini", papan Dapur (timer basi), atau Dashboard Operasional Hari Ini di fase ini.

| Klip | Nama file | Login | Rute | Langkah | Target |
|---|---|---|---|---|---|
| A1 Login | a1-login.mp4 | – | /login | tampil halaman login 1,5 dtk → klik tombol Manajer → klik Masuk → dashboard muncul | 10 dtk |
| A2 Ringkasan Manajer | a2-manajer.mp4 | Manajer | /manager | pilih periode "Bulan lalu" → sorot KPI kotor/bersih/rata-rata order → buka pembanding | 16 dtk |
| A3 Menu + HPP | a3-menu-hpp.mp4 | Manajer | /menu/items | gulir daftar menu berfoto → sorot kolom HPP & margin (Sehat/Rendah) → buka edit 1 menu (lihat saja, JANGAN simpan) | 18 dtk |
| A4 Kategori & Addon | a4-kategori-addon.mp4 | Manajer | /menu/categories → /menu/addons | pindah 2 halaman, sorot daftar | 12 dtk |
| A5 Inventori | a5-inventori.mp4 | Manajer | /inventory/ingredients | sorot nilai persediaan + stok menipis → buka riwayat pergerakan 1 bahan | 16 dtk |
| A6 Bahan Terbuang | a6-waste.mp4 | Manajer | /inventory/waste | sorot ringkasan nilai limbah per alasan | 12 dtk |
| A7 Stok Opname | a7-opname.mp4 | Manajer | /inventory/counts | buka SO-260930-002 (draf): fisik vs sistem, selisih (JANGAN ajukan) | 15 dtk |
| A8 Pemasok + PO | a8-po.mp4 | Manajer | /purchasing/suppliers → /purchasing/orders | lihat pemasok → buka PO-20260930-0002 (status, item, cetak = hover saja) | 18 dtk |
| A9 Tren Harga Beli | a9-harga-beli.mp4 | Manajer | /analytics/purchase-prices (URL langsung) | pilih 1 bahan → grafik harga | 12 dtk |
| A10 Pelanggan CRM | a10-pelanggan.mp4 | Manajer | /customers | daftar → buka Budi Santoso (kunjungan, total belanja, riwayat) | 16 dtk |
| A11 Pesanan | a11-pesanan.mp4 | Manajer | /orders | filter tanggal Sep → buka 1 detail pesanan Lunas (item, status dapur, pembayaran) | 16 dtk |
| A12 Meja | a12-meja.mp4 | Pelayan | /tables | denah 3 area, warna status → klik meja terisi → Lihat Pesanan | 14 dtk |
| A13 Pembayaran | a13-pembayaran.mp4 | Manajer | /payments/transactions | filter metode QRIS → sorot baris refund | 14 dtk |
| A14 Laporan | a14-laporan.mp4 | Manajer | /reports/sales → /reports/menu | set rentang 1–30 Sep → grafik penjualan → menu terlaris | 18 dtk |
| A15 Biaya | a15-biaya.mp4 | Manajer | /expenses | ledger per kategori (JANGAN sorot kartu "Segera hadir") | 12 dtk |
| A16 Karyawan & Absensi | a16-absensi.mp4 | Manajer | /people/rekap → /people/shifts | rekap hadir/terlambat → template shift | 14 dtk |
| A17 Penggajian | a17-gaji.mp4 | Manajer | /people/payroll | buka periode Agu 2026 → slip gaji 1 karyawan | 15 dtk |
| A18 Log Audit | a18-audit.mp4 | Manajer | /audit | filter aksi → sorot nilai lama → baru | 12 dtk |
| A19 Website CMS | a19-cms.mp4 | Manajer | /website/home | sorot hero + menu unggulan → klik "Lihat Situs" (tab baru publik) | 14 dtk |
| A20 Web publik HP | a20-web-hp.mp4 | – (HP 390x844) | / → /menu | gulir beranda → menu → bottom-nav (JANGAN buka /kontak: data "-") | 14 dtk |
| A21 Pengaturan | a21-pengaturan.mp4 | Manajer | /settings/restaurant | pindah tab: jam buka, kasir & struk, target SLA, batas margin (lihat saja) | 14 dtk |
| A22 Akses per role | a22-role.mp4 | Kasir lalu Dapur | /dashboard, /kitchen | tunjukkan sidebar Kasir (menu terbatas) → logout → login Dapur (hanya Dapur) — cukup sidebar, jangan sorot isi kanban | 16 dtk |

## FASE B — alur end-to-end (TUNGGU owner/agent PC bilang "data demo sudah di-reseed")
Setelah reseed, angka "hari ini" terisi dan papan Dapur segar. Rekam BERURUTAN dalam satu sesi (B1 → B7), aksi pengubah data hanya di take final.

| Klip | Nama file | Login | Langkah | Target |
|---|---|---|---|---|
| B1 Dashboard hari ini | b1-dashboard.mp4 | Manajer | /dashboard: penjualan hari ini, menu teratas, stok rendah, status meja | 16 dtk |
| B2 POS dine-in | b2-pos.mp4 | Kasir | /pos: kategori → tambah 3 menu → Makan di Tempat → pilih meja kosong → Simpan (kirim ke dapur) | 20 dtk |
| B3 Pesanan online HP | b3-pesan-online.mp4 | – (HP) | / → Menu → tambah 2 menu → /keranjang → /checkout (tamu, Bawa Pulang, nama+telepon contoh) → Buat Pesanan → selesai | 20 dtk |
| B4 Dapur KDS | b4-dapur.mp4 | Dapur | /kitchen: pesanan B2/B3 di kolom Baru → Terima → Tandai Siap → Siap diambil | 18 dtk |
| B5 Pelayan antar | b5-pelayan.mp4 | Pelayan | /orders → pesanan B2 "Diambil pelayan" → Diantar; /tables warna meja berubah | 15 dtk |
| B6 Bayar + struk | b6-bayar.mp4 | Kasir | detail pesanan B2 → Bayar QRIS/Tunai → Lunas → cetak invoice (pratinjau) | 18 dtk |
| B7 Reservasi | b7-reservasi.mp4 | – (HP) lalu Pelayan | /reservasi: isi tanggal/jam/tamu → kirim → login Pelayan → /reservations muncul | 18 dtk |
| B8 Angka naik | b8-manajer-naik.mp4 | Manajer | /dashboard & /manager periode Hari ini: angka dari B2-B6 masuk | 14 dtk |

## Unggah
Directus `Nusawebsite/Video/Restoran/Footage Recordly/<modul>/`, `--varian "resto <klip>"`, tags `resto,recordly,<modul>`.
Klip uji pertama = **A3 Menu + HPP**.

## Jangan ditampilkan / dijanjikan
Menu QR per meja (fitur tidak ada), halaman /kontak (data "-"), kartu "Segera hadir", timer dapur basi, angka Rp0.
