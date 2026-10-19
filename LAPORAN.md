# LAPORAN — pustaka footage Recordly resto (laptop)

Diperbarui 19/10/2026, 09.15.39 WIB · 3/30 klip terunggah.
Directus: `Nusawebsite/Video/Restoran/Footage Recordly/<modul>/` · URL `https://directus.nusawebsite.com/assets/<id>`.
Gaya: preset "Nusawebsite Demo" (diverifikasi `gaya.js` tiap klip), kursor 1.0, crop atas 9%, zoom Manual di titik klik.

| Modul | Klip | File | Durasi | Id file Directus | Catatan |
|---|---|---|---|---|---|
| - | A1 | - | 11.1 dtk (target 10) | belum | rekam ulang: take 1 memperlihatkan popup Terjemahan Chrome (sudah dimatikan) |
| ringkasan-manajer | A2 | a2-manajer.mp4 | 16.1 dtk (target 16) | `e2178136-bec5-46ce-906a-fed52d1d412d` | periode "Bulan ini" (halaman tidak punya "30 hari terakhir"); kartu KPI berupa tautan → pratinjau URL kecil sempat tampil di pojok kiri bawah |
| menu | A3 | a3-menu-hpp.mp4 | 19.9 dtk (target 18) | `728e0bc0-41a0-4e6d-9959-ac09dac5a77e` | klip uji, disetujui owner |
| menu | A4 | a4-kategori-addon.mp4 | 12.9 dtk (target 12) | `37674501-7274-4538-97dd-d5214805aba7` |  |
| - | A5 | - | - (target 16) | belum |  |
| - | A6 | - | - (target 12) | belum | ringkasan limbah hanya 1 alasan (Busuk Rp32.651) di data demo |
| - | A7 | - | - (target 15) | belum | SO berstatus Disetujui (SO draf pasca-reseed belum berisi stok fisik) |
| - | A8 | - | - (target 18) | belum |  |
| - | A9 | - | - (target 12) | belum | bahan Ayam (bahan lain hanya 1 titik harga); rentang bawaan 90 hari |
| - | A10 | - | - (target 16) | belum |  |
| - | A11 | - | - (target 16) | belum | filter 30 hari terakhir |
| - | A12 | - | - (target 14) | belum |  |
| - | A13 | - | - (target 14) | belum |  |
| - | A14 | - | - (target 18) | belum | rentang 30 hari terakhir; /reports/sales hanya tabel+kartu (tanpa grafik); /reports/menu lewat URL langsung (tidak ada di sidebar) |
| - | A15 | - | - (target 12) | belum |  |
| - | A16 | - | - (target 14) | belum |  |
| - | A17 | - | - (target 15) | belum | periode Sep 2026 (periode Agu tidak ada setelah reseed) |
| - | A18 | - | - (target 12) | belum |  |
| - | A19 | - | - (target 14) | belum | "Lihat Situs" membuka di tab yang sama |
| - | A20 | - | - (target 14) | belum |  |
| - | A21 | - | - (target 14) | belum |  |
| - | A22 | - | - (target 16) | belum |  |
| - | B1 | - | - (target 16) | belum |  |
| - | B2 | - | - (target 20) | belum |  |
| - | B3 | - | - (target 20) | belum |  |
| - | B4 | - | - (target 18) | belum |  |
| - | B5 | - | - (target 15) | belum |  |
| - | B6 | - | - (target 18) | belum |  |
| - | B7 | - | - (target 18) | belum |  |
| - | B8 | - | - (target 14) | belum |  |

## Masalah yang ditemui
- Disk C laptop hampir penuh (±2 GB) → rekaman Recordly & `out/` lewat junction ke `D:/rekam-footage/`.
- Server demo kadang menampilkan halaman kosong / login timeout sesaat saat banyak sesi login bersamaan → login dimuat ulang otomatis.
- Header admin sticky menutupi elemen hasil scroll → klik kena header (take uji A3 pertama gagal); `pusat()` kini menengahkan target dulu.
- Popup Terjemahan Chrome muncul di halaman login (take A1 pertama) → Chrome dijalankan dengan `--disable-features=Translate`.
- Banner "MODE DEMO" tidak ada (dicek `cekdemo.js`, 4 akun).

## Fase B
Menunggu keputusan owner: reseed ulang sebelum Fase B? (timer dapur makin basi, meja kosong tinggal Meja 08), B5 "Tandai Disajikan" = "Diantar"?
