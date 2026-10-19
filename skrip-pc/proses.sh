#!/usr/bin/env bash
# Olah rekaman Recordly yang SUDAH ADA jadi MP4 standar owner (tanpa merekam ulang):
#   bash proses.sh <path rekaman .mp4> <nama-keluaran.mp4>
# Urutan penting: preset → kursor → crop → Suggest Zooms → fokus-klik (Manual, fokus = titik klik) → ekspor.
set -u; cd "$(dirname "$0")"
REK="$1"; OUT="$2"
powershell -c "Get-Process Recordly -ErrorAction SilentlyContinue | Stop-Process -Force"; sleep 2
powershell -c "Start-Process \"\$env:LOCALAPPDATA\Programs\Recordly\Recordly.exe\" -ArgumentList '--remote-debugging-port=9556'"; sleep 8
timeout 40 node buka.js "$(cygpath -w "$REK")" >/dev/null; sleep 6
timeout 40 node preset.js pakai "Nusawebsite Demo" >/dev/null
timeout 30 node kendali.js jsklik "Cursor" >/dev/null; sleep 1; timeout 40 node kursor.js 1.0
timeout 30 node kendali.js jsklik "Scene" >/dev/null; sleep 1; timeout 60 node varian.js 14 9 keep
timeout 90 node gaya.js || { echo "GAGAL: gaya tidak sesuai preset owner"; exit 3; }
timeout 40 node kendali.js jsklik "Suggest Zooms from Cursor" >/dev/null; sleep 2
timeout 120 node fokus-klik.js "$REK" 9
bash ekspor.sh "$OUT"
