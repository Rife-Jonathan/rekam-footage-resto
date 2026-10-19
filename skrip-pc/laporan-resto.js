// Tulis ../LAPORAN.md dari out/unggah.json (id Directus), durasi klip (ffprobe) dan catatan.json.  node laporan-resto.js
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const UNG = fs.existsSync(ROOT + '/out/unggah.json') ? JSON.parse(fs.readFileSync(ROOT + '/out/unggah.json', 'utf8')) : {};
const CAT = JSON.parse(fs.readFileSync(__dirname + '/catatan.json', 'utf8'));
const TARGET = { a1: 10, a2: 16, a3: 18, a4: 12, a5: 16, a6: 12, a7: 15, a8: 18, a9: 12, a10: 16, a11: 16, a12: 14, a13: 14, a14: 18, a15: 12, a16: 14, a17: 15, a18: 12, a19: 14, a20: 14, a21: 14, a22: 16,
  b1: 16, b2: 20, b3: 20, b4: 18, b5: 15, b6: 18, b7: 18, b8: 14 };
const dur = (id) => { for (const d of ['fase-a', 'fase-b']) { const f = `${ROOT}/out/${d}/${id}.mp4`; if (fs.existsSync(f)) return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' })).toFixed(1); } return ''; };
const baris = Object.keys(TARGET).map((id) => { const u = UNG[id]; return `| ${u ? u.modul : '-'} | ${id.toUpperCase()} | ${u ? u.file : '-'} | ${dur(id) ? dur(id) + ' dtk' : '-'} (target ${TARGET[id]}) | ${u ? '`' + u.directus + '`' : 'belum'} | ${CAT[id] || ''} |`; });
const selesai = Object.keys(UNG).length;
fs.writeFileSync(ROOT + '/LAPORAN.md', `# LAPORAN — pustaka footage Recordly resto (laptop)

Diperbarui ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB · ${selesai}/${Object.keys(TARGET).length} klip terunggah.
Directus: \`Nusawebsite/Video/Restoran/Footage Recordly/<modul>/\` · URL \`https://directus.nusawebsite.com/assets/<id>\`.
Gaya: preset "Nusawebsite Demo" (diverifikasi \`gaya.js\` tiap klip), kursor 1.0, crop atas 9%, zoom Manual di titik klik.

| Modul | Klip | File | Durasi | Id file Directus | Catatan |
|---|---|---|---|---|---|
${baris.join('\n')}

## Masalah yang ditemui
- Disk C laptop hampir penuh (±2 GB) → rekaman Recordly & \`out/\` lewat junction ke \`D:/rekam-footage/\`.
- Server demo kadang menampilkan halaman kosong / login timeout sesaat saat banyak sesi login bersamaan → login dimuat ulang otomatis.
- Header admin sticky menutupi elemen hasil scroll → klik kena header (take uji A3 pertama gagal); \`pusat()\` kini menengahkan target dulu.
- Popup Terjemahan Chrome muncul di halaman login (take A1 pertama) → Chrome dijalankan dengan \`--disable-features=Translate\`.
- Banner "MODE DEMO" tidak ada (dicek \`cekdemo.js\`, 4 akun).

## Fase B
Menunggu keputusan owner: reseed ulang sebelum Fase B? (timer dapur makin basi, meja kosong tinggal Meja 08), B5 "Tandai Disajikan" = "Diantar"?
`);
console.log('LAPORAN.md ditulis,', selesai, 'klip');
