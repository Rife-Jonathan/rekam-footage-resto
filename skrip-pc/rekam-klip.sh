#!/usr/bin/env bash
# Rekam + olah + periksa SATU klip, hasil ke out/<folder>/<alur>.mp4 (+ kontak-<alur>.png, ringkasan).
#   bash rekam-klip.sh <alur> [folder=v2]        env tambahan diteruskan ke rekam.js (EXAM=, PASIEN=, UJI=1, ...)
# Ringkasan akhir: DURASI, KLIK, GAYA, FOKUS, SELESAI, LEWATI → baca, lalu LIHAT lembar kontaknya.
set -u
cd "$(dirname "$0")"
ALUR="$1"; DIR="../out/${2:-v2}"; mkdir -p "$DIR"
export PATH="$(ls -d "$(cygpath -u "$LOCALAPPDATA")"/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-*/bin 2>/dev/null | head -1):$PATH"
rm -f ../out/mulai.flag ../out/berhenti.flag ../out/fitur-"$ALUR".mp4
LOG="$DIR/sesi-$ALUR.log"
timeout 600 bash sesi.sh "$ALUR" > "$LOG" 2>&1
F="$DIR/$ALUR.mp4"
if [ -s ../out/fitur-"$ALUR".mp4 ]; then mv -f ../out/fitur-"$ALUR".mp4 "$F"; else echo "GAGAL: tidak ada hasil ekspor (lihat $LOG)"; fi
REK=$(ls -t /c/Users/M.S.I/AppData/Roaming/Recordly/recordings/recording-*.mp4 | head -1)
echo "== $ALUR"
echo "REKAMAN $REK"
[ -s "$F" ] && echo "FILE $F" && echo "DURASI $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F") dtk, $(ffprobe -v error -show_entries stream=width,height -of csv=p=0:s=x "$F" | head -1)"
echo "KLIK $(grep -oE '"interactionType": ?"click"' "$REK.cursor.json" 2>/dev/null | wc -l)"
grep -E "GAYA (SESUAI|TIDAK)|fokus diatur|^SELESAI|^lewati|GAGAL|^fokus (ok|gagal)|ENOENT" "$LOG" | sed 's/^/  /'
NK=$(grep -oE '"interactionType": ?"click"' "$REK.cursor.json" 2>/dev/null | wc -l)
NZ=$(grep -oE 'fokus diatur [0-9]+' "$LOG" | grep -oE '[0-9]+$' | tail -1)
[ "$NK" -gt 0 ] && [ "${NZ:-0}" -eq 0 ] && echo "GAGAL: ada $NK klik tapi zona zoom Manual tidak diatur (zoom masih Auto) → jangan dipakai"
if [ -s "$F" ]; then
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F" | cut -d. -f1); N=8; ARGS=(); FIL=""
  for i in $(seq 0 $((N-1))); do t=$(( D * i / (N-1) )); [ $i -eq $((N-1)) ] && t=$((D>0?D-1:0)); ffmpeg -v error -y -ss $t -i "$F" -frames:v 1 -vf scale=960:-1 "$DIR/_k$i.png"; ARGS+=(-i "$DIR/_k$i.png"); done
  ffmpeg -v error -y "${ARGS[@]}" -filter_complex "[0][1][2][3]hstack=4[a];[4][5][6][7]hstack=4[b];[a][b]vstack=2" "$DIR/kontak-$ALUR.png"
  rm -f "$DIR"/_k*.png; echo "KONTAK $DIR/kontak-$ALUR.png (8 frame merata)"
fi
