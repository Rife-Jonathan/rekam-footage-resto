#!/usr/bin/env bash
# Rekam beberapa klip BERURUTAN (satu layar): bash rekam-batch.sh <folder> a1 a2 ...  → out/<folder>/<id>.mp4 + kontak + ringkasan
set -u; cd "$(dirname "$0")"; DIR="$1"; shift
for id in "$@"; do
  echo "######## $id $(date +%H:%M:%S)"
  timeout 700 bash rekam-klip.sh "$id" "$DIR" 2>&1 | grep -vE "^REKAMAN"
done
echo "######## BATCH SELESAI $(date +%H:%M:%S)"
