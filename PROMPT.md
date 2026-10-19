# PROMPT untuk agent di LAPTOP — rekam pustaka footage aplikasi RESTORAN lalu unggah ke Directus

Clone repo ini di laptop, buka agent di dalam foldernya, lalu kirim: **"Baca PROMPT.md dan kerjakan."**
Token Directus TIDAK ada di repo (repo publik). Owner memberikannya terpisah → simpan sebagai `rahasia/directus-token.txt`
(folder ini di-.gitignore). Belum ada → minta ke owner.

---

## Tugas
Rekam **pustaka footage per modul** aplikasi restoran end-to-end NusaWebsite (https://resto.nusawebsite.com) dengan **Recordly**,
olah dengan gaya standar owner (sama persis dengan footage DentalCare), lalu unggah tiap MP4 ke Directus.
Footage ini dipakai merakit banyak video YouTube review aplikasi restoran (perakitan dikerjakan di PC owner, bukan tugasmu).

Daftar modul, rute, langkah klik, akun demo, dan durasi target: **`bahan/SHOTLIST-RESTO.md`** (sumber kebenaran).
**Bila berkas itu belum ada**: kerjakan bagian 1 (Setup) dulu, lalu `git pull` tiap 5 menit sampai berkas itu muncul (sedang disusun di PC owner).

## 1. Setup (kerjakan sendiri, cek dulu yang sudah terpasang)
1. Node 22+, Python 3.10+ (`pip install pyautogui`), Git Bash bila Windows, ffmpeg + ffprobe di PATH.
2. Playwright: `npm i playwright` di folder ini, lalu `npx playwright install chromium`.
3. **Recordly v1.4.0**: unduh dari rilis resmi https://github.com/webadderallorg/Recordly/releases (Windows: `Recordly-windows-x64.exe`).
   Jalankan dengan `--remote-debugging-port=9556` supaya bisa dikendalikan lewat CDP (lihat `skrip-pc/kendali.js`).
4. Preset gaya: salin `recordly-setting/app-settings.json` ke folder data Recordly (Windows: `%APPDATA%\Recordly\app-settings.json`,
   tutup Recordly dulu, cadangkan file lama). Isinya preset **"Nusawebsite Demo"**. Bila tidak terbaca, buat ulang manual:
   wallpaper putih-biru muda (baris 3 kolom 1), blur 3.5px, shadow 53%, radius 2.4%, padding 14%, crop atas 9%,
   kursor 1.0, click bounce 2, sway 0.2 → simpan sebagai preset "Nusawebsite Demo".
5. `skrip-pc/` = skrip yang SUDAH TERBUKTI untuk DentalCare di PC owner. Path di dalamnya masih path PC
   (`E:/Content-Machine/node_modules/playwright`, `E:/Rakazo/ref/recordly-uji/`, `C:/Users/RIFE/...`, python Python310) dan URL/login
   DentalCare. Ganti ke path laptop + URL/login resto sebelum dipakai.
   Alur utama: `sesi.sh <alur>` (rekam + olah) dan `proses.sh <rekaman.mp4> <keluaran.mp4>` (olah ulang tanpa rekam).
   Tulis alur tiap modul di `rekam.js` dari shotlist dengan gaya yang sama (lihat alur antrean/appointment yang sudah ada).

## 2. Aturan rekam (keputusan owner, WAJIB)
- Rekam **JENDELA browser aplikasi saja**, bukan seluruh layar. Desktop/ikon/notifikasi pribadi tidak boleh terekam.
- Sembunyikan HUD Recordly (Hide HUD) sebelum Record. Tutup browser hanya SETELAH Stop.
- Kursor = kursor OS asli (lewat `mouse_server.py`/pyautogui) supaya Recordly mencatat klik. Ukuran kursor **maks 1.0**.
- Gerak: kursor meluncur ±0,9 dtk ke target, klik, lalu diam/geser kecil ±1,6 dtk. Jeda antar aksi ≤1 dtk, kursor tidak diam lama.
  Scroll hanya setelah zoom keluar. Tanpa jeda lama.
- **ANTI-GOYANG:** zoom mode **Manual** dengan fokus di titik klik asli (`fokus-klik.js` membaca `<rekaman>.mp4.cursor.json`).
  JANGAN mode Auto. Urutan olah: preset → kursor 1.0 → crop 9% → Suggest Zooms → fokus-klik → ekspor.
- Viewport browser 1920x1040. Halaman sisi pelanggan (menu QR / pesan dari HP): viewport HP 390x844 (lihat shotlist).
- **Banner/notice "MODE DEMO" tidak boleh terlihat.** Cek di awal. Kalau ada, BERHENTI dan lapor ke owner (owner yang mengubah server).
- Tidak ada hapus/batal data seed. Aksi yang mengubah data (buat pesanan, ubah status dapur, bayar) hanya di TAKE FINAL, urut sesuai alur
  end-to-end di shotlist. Klip hapus/batal/void dikerjakan paling akhir dengan data buatan sendiri.
- Data habis/berantakan → lapor owner (agent PC yang mengisi ulang data demo).
- Durasi tiap klip = target (boleh lebih 1-2 dtk, jangan kurang).

## 3. Cara kerja
1. Setup, lalu buat **1 rekaman uji** (modul pertama di shotlist). Tunjukkan ke owner dan tunggu "oke" sebelum merekam semua.
2. Rekam **per modul** (satu sesi Recordly bisa dipotong jadi beberapa klip). Latihan tanpa Record dulu, lalu take final.
3. Periksa tiap hasil sebelum diunggah: ambil frame (ffmpeg), pastikan tidak ada banner demo, HUD, desktop, zoom goyang, durasi cukup.
4. Hemat token: pakai subagent (maks 5) untuk menulis alur rekam.js per modul, cek frame/durasi, dan unggah. Perekaman Recordly
   sendiri BERURUTAN (satu layar).

## 4. Unggah ke Directus
Pakai `skill/directus-pustaka/simpan.mjs` (baca `SKILL.md`-nya). Token → env `DIRECTUS_TOKEN` (JANGAN cetak isinya).

```bash
export DIRECTUS_TOKEN="$(cat rahasia/directus-token.txt)"
node skill/directus-pustaka/simpan.mjs --brand Nusawebsite --jenis Video --sub "Restoran/Footage Recordly/<modul>" \
  --file out/<modul>-<aksi>.mp4 --varian "resto <modul> <aksi>" --produk "Restoran" --kategori screen-recording \
  --deskripsi "Footage Recordly resto <modul>: <apa yang terlihat>" --tags "resto,recordly,<modul>"
```
Coba dulu dengan `--dry`. Nama sama ditolak; `--ganti` hanya untuk mengganti take yang jelek.

## 5. Laporan akhir → `LAPORAN.md`, commit + push ke repo ini
Tabel: modul | klip | file | durasi | id file Directus | catatan. Plus klip yang gagal & alasannya, dan masalah yang ditemui.

## Batas
- Hanya rekam + unggah. Jangan ubah server, jangan posting ke mana pun. Ragu soal tampilan → tanya owner, jangan menebak.
