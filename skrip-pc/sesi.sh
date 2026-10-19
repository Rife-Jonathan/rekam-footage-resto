#!/usr/bin/env bash
# Satu sesi rekam Recordly: buka Recordly (CDP 9556) → jalankan alur → pilih jendela → Record → flag → Stop.
#   bash growth/video/recordly/sesi.sh rekam-antrean.js
set -u
cd "$(dirname "$0")"
ALUR=${1:-antrean}
LOG=$(mktemp)
powershell -c "Get-Process Recordly -ErrorAction SilentlyContinue | Stop-Process -Force" ; sleep 2
powershell -c "Start-Process \"\$env:LOCALAPPDATA\\Programs\\Recordly\\Recordly.exe\" -ArgumentList '--remote-debugging-port=9556'"
sleep 8
node rekam.js "$ALUR" > "$LOG" 2> "$LOG.err" &
for i in $(seq 1 90); do grep -q SIAP "$LOG" && break; sleep 1; done
timeout 40 node kendali.js klik "Screen"; sleep 3
timeout 40 node kendali.js klik "Resto Nusantara"; sleep 1
timeout 40 node kendali.js jsklik "Hide HUD"; sleep 1
timeout 40 node kendali.js jsklik "Record"
sleep 4   # hitung mundur Recordly

touch /c/Users/M.S.I/Downloads/sc/rekam-footage-resto/out/mulai.flag
for i in $(seq 1 120); do grep -q SELESAI "$LOG" && break; sleep 1; done
timeout 40 node kendali.js jsklik "Stop"; sleep 3
touch /c/Users/M.S.I/Downloads/sc/rekam-footage-resto/out/berhenti.flag   # baru sekarang Chrome boleh ditutup
sleep 8
sleep 6
timeout 40 node preset.js pakai "Nusawebsite Demo"   # gaya standar owner
timeout 30 node kendali.js jsklik "Cursor" >/dev/null; sleep 1
timeout 40 node kursor.js 1.0   # jaga-jaga; owner: kursor maks 1.0
timeout 30 node kendali.js jsklik "Scene" >/dev/null; sleep 1
timeout 60 node varian.js 14 9 keep   # crop atas 9% (crop tidak ikut preset)
timeout 90 node gaya.js || { echo "GAGAL: gaya tidak sesuai preset owner, ekspor dibatalkan"; exit 3; }   # preset tidak menerapkan setelan kursor → pasang + verifikasi semua
timeout 40 node kendali.js jsklik "Suggest Zooms from Cursor" >/dev/null; sleep 2
REK=$(ls -t /c/Users/M.S.I/AppData/Roaming/Recordly/recordings/recording-*.mp4 | head -1)
timeout 120 node fokus-klik.js "$REK" 9   # zoom Manual, fokus = titik klik (anti geser kanan-kiri)
sleep 2; bash ekspor.sh "fitur-$ALUR.mp4"
echo "--- log alur"; cat "$LOG" "$LOG.err"
