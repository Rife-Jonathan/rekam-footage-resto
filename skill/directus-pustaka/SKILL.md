---
name: directus-pustaka
description: Simpan, cari, dan rapikan berkas brand (logo, foto, video, audio, dokumen, aset konten) di pustaka Directus directus.nusawebsite.com (file di Cloudflare R2) dengan struktur folder, nama file, judul, dan tag yang baku. Muat saat user minta "simpan ke directus", "upload logo/foto/aset brand", "rapikan file di directus", "cari aset brand X", atau menambah brand baru ke pustaka.
---

# Pustaka Directus — struktur baku

Server: **https://directus.nusawebsite.com** (Coolify service `um5bcidbiydk8ufsgfxo0meg`). File fisik di **R2**
akun Limatujuh71, bucket `directus-nusa` — Directus DB hanya menyimpan metadata (nama asli, judul, folder, tag).
Token API: env `DIRECTUS_TOKEN` (di laptop: `rahasia/directus-token.txt`, dari owner).

## Aturan struktur (WAJIB)

```
<Brand>/                 1 folder root per brand, nama resmi brand (mis. Nusawebsite)
  Logo/                  logo, ikon, berkas master (.ai/.svg)
  Brand Kit/             palet, font, panduan brand
  Konten/                hasil produksi konten
    Cover/               DIKELOLA service `konten` (produce.mjs) — jangan upload manual ke sini
  Foto/  Video/  Audio/  aset mentah; boleh sub-folder (mis. Foto/Tim, Foto/Portofolio, Video/2026-10)
  Dokumen/               PDF, proposal, company profile
  Template/              template desain/dokumen
```

- **Tidak ada file di root.** Tiap file milik satu brand.
- Nama file: `<brand>-<jenis>-<varian>.<ext>` — huruf kecil, kebab-case. Contoh `nusawebsite-logo-horizontal-navy.png`.
- Judul: `<Jenis> <Brand> · <varian>`. Contoh `Logo Nusawebsite · ikon gradien`.
- Deskripsi: **kapan dipakai** (latar terang/gelap, watermark, avatar, cetak), bukan deskripsi visual saja.
- Tags: slug brand + jenis + kata varian (+ tambahan). Dipakai untuk pencarian.
- Pengecualian: cover konten pakai `K0xx-cover.png` + judul `K0xx · headline / accentLine` (diatur `konten/produce.mjs`).
- Berkas yang jelas milik brand/klien lain → JANGAN masuk folder brand ini; tanya user.

## Alat: `simpan.mjs` (di folder skill ini)

```bash
S=C:/Users/RIFE/.claude/skills/directus-pustaka/simpan.mjs
node $S --pohon                                   # pohon folder + jumlah file + peringatan file di root
node $S --brand Nusawebsite --jenis Logo --file "D:/x/a.png" --varian "horizontal navy" \
        --deskripsi "Untuk latar terang" --tags "monokrom" --dry      # pratinjau nama/judul/tag
node $S ... (tanpa --dry)                         # simpan; folder dibuat otomatis
node $S ... --sub "Tim"                           # Foto/Tim
node $S ... --ganti                               # nama sama sudah ada → ganti isinya (id & URL tetap)
```
`--jenis` hanya: Logo, Brand Kit, Konten, Foto, Video, Audio, Dokumen, Template.

**Video → katalog bergambar otomatis.** Directus tidak membuat thumbnail video (grid File Library hanya ikon MP4).
Maka `--jenis Video` juga: ambil 1 frame (ffmpeg, detik ke-2 / `--detik-poster N`) → poster di
`<Brand>/Video/_Poster` → item koleksi **`video_aset`** (Content → Video Aset, tampilan kartu ber-poster) berisi
judul, produk, kategori, rasio & durasi (ffprobe), ucapan, keterangan. Tambahkan:
`--produk "Klinik Gigi" --kategori iklan|klip-ai|screen-recording|tutorial|lainnya --ucapan "naskah"`.
`--katalog-ulang` = isi katalog untuk semua video yang belum punya item (unduh dari R2, buat poster).
Poster jelek (frame gelap/transisi) → simpan ulang dengan `--ganti --detik-poster 5`.
Halaman detail item punya field **Pemutar** (extension `video-pemutar`, sumber `E:\Rakazo\directus-ext\video-pemutar`)
— video langsung bisa diputar di sana.
Nama sama di folder sama → ditolak (exit 3) kecuali `--ganti`.

## Alur kerja

1. Lihat berkas sumbernya dulu (buka gambar dengan Read) supaya varian & deskripsi benar — jangan menebak dari nama
   file asal (`sds.png`, `Copy` dll).
2. `--dry` untuk semua berkas, tunjukkan daftar ke user bila jumlahnya banyak atau ada yang meragukan.
3. Simpan, lalu `--pohon` untuk verifikasi.
4. URL publik/ber-token: `https://directus.nusawebsite.com/assets/<id>` (butuh token kecuali file dibuat publik).

## Jebakan (terbukti 3 Okt 2026)

- `curl` dari Git Bash merusak karakter non-ASCII (`·` tersimpan jadi U+FFFD). Ubah metadata lewat Node
  (`simpan.mjs` / `fetch`), bukan curl.
- Upload tanpa tipe MIME → Directus menyimpan `application/octet-stream` → video/gambar TIDAK bisa di-preview di UI.
  `simpan.mjs` sudah mengirim MIME per ekstensi (tabel `MIME`; tambah di sana untuk ekstensi baru). Memperbaiki file
  lama cukup `PATCH /files/<id> {"type":"video/mp4"}` — header `Content-Type` di `/assets` ikut berubah.
- Thumbnail grid hanya dibuat untuk gambar; video tampil sebagai ikon di grid, pemutar ada di halaman detail file.
- `curl` membaca `filter[...]` di URL sebagai glob → hasil kosong diam-diam. Kalau terpaksa curl: `curl -g`.

## Brand baru

Cukup `--brand "<Nama Brand>"` — folder root dibuat otomatis. Service `konten` memakai env `BRAND_FOLDER`
(default `Nusawebsite`) untuk folder cover.

## Pindah server / akun R2 (tanpa upload ulang)

- Ganti server: dump Postgres Directus + env sama → file di R2 tidak tersentuh.
- Ganti akun R2: salin bucket antar-R2 (dashboard R2 → Data migration, atau rclone), lalu ganti env
  `STORAGE_R2_KEY/SECRET/BUCKET/ENDPOINT`. Wajib tetap `STORAGE_R2_FORCE_PATH_STYLE=true`.
- Banyak akun R2 sekaligus: `STORAGE_LOCATIONS=r2,r2b` + env `STORAGE_R2B_*`; upload baru masuk lokasi pertama,
  file lama tetap dibaca dari lokasi yang tercatat di kolom `storage`. (Belum diuji.)
- JANGAN hapus DB Directus: di R2 nama objek hanya UUID; nama asli, folder, judul, tag ada di DB.
