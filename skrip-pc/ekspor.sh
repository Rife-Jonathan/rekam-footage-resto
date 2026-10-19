#!/usr/bin/env bash
# bash ekspor.sh <nama-file.mp4>  → ekspor proyek editor Recordly yang terbuka ke out
cd "$(dirname "$0")"
MULAI=$(mktemp)   # penanda waktu: Recordly merender ke %TEMP%\recordly-export-*.mp4 dulu, baru dipindah ke tujuan
timeout 20 node kendali.js klik "Done" >/dev/null 2>&1; sleep 1
# popover Export bisa sudah terbuka/tertutup → coba sampai tombol "Export Video" ada
for i in 1 2 3; do
  timeout 30 node kendali.js jsklik "Export Video" && break
  timeout 30 node kendali.js jsklik "Export"; sleep 2
done
D='C:\Users\M.S.I\Downloads\sc\rekam-footage-resto\out\'
powershell -ExecutionPolicy Bypass -File simpan-dialog.ps1 -Tujuan "$D$1"
F="/c/Users/M.S.I/Downloads/sc/rekam-footage-resto/out/$1"
TMPX="$(cygpath -u "$LOCALAPPDATA")/Temp"
for i in $(seq 1 150); do
  [ -s "$F" ] && break
  # dialog simpan kadang gagal memindahkan hasil → ambil render terbaru dari %TEMP% setelah ukurannya stabil
  X=$(find "$TMPX" -maxdepth 1 -name 'recordly-export-*.mp4' -newer "$MULAI" 2>/dev/null | head -1)
  if [ -n "$X" ] && [ "$i" -gt 10 ]; then
    s1=$(stat -c %s "$X"); sleep 5
    [ "$s1" -gt 0 ] && [ "$s1" = "$(stat -c %s "$X")" ] && { cp "$X" "$F"; echo "(cadangan) diambil dari $X"; break; }
  fi
  sleep 4
done
sleep 4; ls -la "$F"
