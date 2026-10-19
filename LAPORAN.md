# LAPORAN — pustaka footage Recordly resto (laptop)

Diperbarui 19/10/2026, 09.39.34 WIB · 11/30 klip terunggah.
Directus: `Nusawebsite/Video/Restoran/Footage Recordly/<modul>/` · URL `https://directus.nusawebsite.com/assets/<id>`.
Gaya: preset "Nusawebsite Demo" (diverifikasi `gaya.js` tiap klip), kursor 1.0, crop atas 9%, zoom Manual di titik klik.

| Modul | Klip | File | Durasi | Id file Directus | Catatan |
|---|---|---|---|---|---|
| - | A1 | - | 11.1 dtk (target 10) | belum | rekam ulang: take 1 memperlihatkan popup Terjemahan Chrome (sudah dimatikan) |
| ringkasan-manajer | A2 | a2-manajer.mp4 | 16.1 dtk (target 16) | `e2178136-bec5-46ce-906a-fed52d1d412d` | periode "Bulan ini" (halaman tidak punya "30 hari terakhir"); kartu KPI berupa tautan → pratinjau URL kecil sempat tampil di pojok kiri bawah |
| menu | A3 | a3-menu-hpp.mp4 | 19.9 dtk (target 18) | `728e0bc0-41a0-4e6d-9959-ac09dac5a77e` | klip uji, disetujui owner |
| menu | A4 | a4-kategori-addon.mp4 | 12.9 dtk (target 12) | `37674501-7274-4538-97dd-d5214805aba7` |  |
| inventori | A5 | a5-inventori.mp4 | 16.2 dtk (target 16) | `753c069b-850f-4260-a2dc-34ed490a017d` |  |
| inventori | A6 | a6-waste.mp4 | 13.9 dtk (target 12) | `87ae53bf-bcbc-45e1-9eb5-470a1797f4c4` | ringkasan limbah hanya 1 alasan (Busuk Rp32.651) di data demo |
| inventori | A7 | a7-opname.mp4 | 15.1 dtk (target 15) | `cfaf44df-f312-4ad7-965d-f77e75f749d8` | SO berstatus Disetujui (SO draf pasca-reseed belum berisi stok fisik) |
| pembelian | A8 | a8-po.mp4 | 19.4 dtk (target 18) | `5bca66b0-1f06-4eb7-b7f0-79e9524847a2` |  |
| pembelian | A9 | a9-harga-beli.mp4 | 14.1 dtk (target 12) | `1648ad31-cd70-4865-bb58-e5e22fff67a7` | bahan Ayam (bahan lain hanya 1 titik harga); rentang bawaan 90 hari; grafik hampir rata (Rp38-39 rb, +0%) |
| pelanggan | A10 | a10-pelanggan.mp4 | 17.3 dtk (target 16) | `9fa42b53-f4d3-4b6e-9c4e-c6d1869c9859` |  |
| - | A11 | - | 17.2 dtk (target 16) | belum | rekam ulang: take 1 menggulir ke area kosong; filter 30 hari terakhir |
| - | A12 | - | 14.2 dtk (target 14) | belum | rekam ulang: take 1 zoom tidak terbentuk |
| - | A13 | - | 14.2 dtk (target 14) | belum | rekam ulang: take 1 tanpa klik (tanpa zoom) |
| laporan | A14 | a14-laporan.mp4 | 18.3 dtk (target 18) | `d2283ed2-8016-4ca7-9fab-a02360e2b7b7` | rentang 30 hari terakhir; /reports/sales hanya tabel+kartu (tanpa grafik); /reports/menu lewat URL langsung (tidak ada di sidebar) |
| - | A15 | - | 13.0 dtk (target 12) | belum | rekam ulang: take 1 tanpa klik (tanpa zoom) |
| karyawan | A16 | a16-absensi.mp4 | 14.0 dtk (target 14) | `da9425f9-84ee-4e08-8773-250aad72133d` |  |
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
