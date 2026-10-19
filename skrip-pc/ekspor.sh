#!/usr/bin/env bash
# bash ekspor.sh <nama-file.mp4>  → ekspor proyek editor Recordly yang terbuka ke E:\Rakazo\ref\recordly-uji\
cd "$(dirname "$0")"
timeout 20 node kendali.js klik "Done" >/dev/null 2>&1; sleep 1
# popover Export bisa sudah terbuka/tertutup → coba sampai tombol "Export Video" ada
for i in 1 2 3; do
  timeout 30 node kendali.js jsklik "Export Video" && break
  timeout 30 node kendali.js jsklik "Export"; sleep 2
done
D='E:\Rakazo\ref\recordly-uji\'
powershell -ExecutionPolicy Bypass -File simpan-dialog.ps1 -Tujuan "$D$1"
F="/e/Rakazo/ref/recordly-uji/$1"
for i in $(seq 1 150); do [ -s "$F" ] && break; sleep 4; done
sleep 4; ls -la "$F"
