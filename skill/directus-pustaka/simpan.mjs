#!/usr/bin/env node
// Simpan berkas ke pustaka Directus (directus.nusawebsite.com) dengan struktur baku.
//   node simpan.mjs --brand Nusawebsite --jenis Logo --file "D:/x/logo.png" --varian "horizontal navy" \
//        --deskripsi "Kapan dipakai" [--tags "a,b"] [--sub "2026-10"] [--ganti] [--dry]
//   node simpan.mjs --pohon            # tampilkan pohon folder + jumlah file
// Folder   : <Brand>/<Jenis>[/<sub>]           (dibuat otomatis bila belum ada)
// Nama file: <brand>-<jenis>-<varian>.<ext>    (huruf kecil, kebab-case)
// Judul    : <Jenis> <Brand> · <varian>
// Tags     : brand, jenis, kata-kata varian, + --tags
// File dengan nama sama di folder yang sama → ditolak, kecuali --ganti (isi diganti, id tetap).
// --jenis Video: otomatis poster (frame video, folder <Brand>/Video/_Poster) + item koleksi `video_aset`
//   (katalog bergambar). Opsi: --produk "Klinik Gigi" --kategori iklan|klip-ai|screen-recording|tutorial|lainnya
//   --ucapan "naskah" --detik-poster 2.   Butuh ffmpeg/ffprobe di PATH.
//   node simpan.mjs --katalog-ulang    # buat poster + item untuk semua video yang belum masuk katalog
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const U = process.env.DIRECTUS_URL || "https://directus.nusawebsite.com";
const TOKEN = process.env.DIRECTUS_TOKEN || fs.readFileSync("E:/Rakazo/.directus-token", "utf8").trim();
// Tanpa tipe MIME, Directus menyimpan application/octet-stream → tidak ada preview/pemutar di UI.
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", json: "application/json",
  pdf: "application/pdf", ai: "application/postscript", zip: "application/zip", txt: "text/plain", md: "text/markdown",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
const JENIS = ["Logo", "Brand Kit", "Konten", "Foto", "Video", "Audio", "Dokumen", "Template"];

const a = {};
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i].replace(/^--/, "");
  const v = process.argv[i + 1];
  if (!v || v.startsWith("--")) a[k] = true; else { a[k] = v; i++; }
}
const kebab = (s) => String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function dx(method, url, body) {
  const isForm = body instanceof FormData;
  const r = await fetch(U + url, { method, headers: { Authorization: `Bearer ${TOKEN}`, ...(body && !isForm ? { "content-type": "application/json" } : {}) }, body: isForm ? body : body && JSON.stringify(body) });
  const t = await r.text();
  if (!r.ok) throw new Error(`directus ${method} ${url} ${r.status}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t).data : null;
}
async function folderPath(names, create) {
  let parent = null;
  for (const name of names) {
    const q = `/folders?filter[name][_eq]=${encodeURIComponent(name)}&filter[parent][${parent ? `_eq]=${parent}` : "_null]=true"}`;
    const hit = (await dx("GET", q))[0];
    if (!hit && !create) return null;
    parent = (hit || (await dx("POST", "/folders", { name, parent }))).id;
  }
  return parent;
}

// ---------- katalog video: Directus tidak membuat thumbnail video, jadi poster dibuat sendiri
function probe(file) {
  const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", file]));
  const { width: w, height: h } = j.streams[0], d = Number(j.format.duration);
  const r = w / h, rasio = [["9:16", 9 / 16], ["4:5", 0.8], ["1:1", 1], ["16:9", 16 / 9]].sort((x, y) => Math.abs(x[1] - r) - Math.abs(y[1] - r))[0][0];
  return { durasi: Math.round(d * 10) / 10, rasio };
}
// judul kartu: tanpa awalan produk (sudah tampil di subjudul), huruf pertama kapital
const judulKartu = (j, produk) => { const t = produk ? String(j).replace(new RegExp(`^${kebab(produk).replace(/-/g, "[ -]")}[ -]*`, "i"), "") : String(j); return t.charAt(0).toUpperCase() + t.slice(1); };
async function katalogVideo(fileId, localPath, info) {
  info = { ...info, judul: judulKartu(info.judul, info.produk) };
  const { durasi, rasio } = probe(localPath);
  const jpg = path.join(os.tmpdir(), `poster-${fileId}.jpg`);
  const t = Math.min(Number(info.detikPoster ?? 2), Math.max(0, durasi - 0.5));
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(t), "-i", localPath, "-frames:v", "1", "-vf", "scale='min(720,iw)':-2", "-q:v", "3", jpg]);
  const pf = await folderPath([info.brand, "Video", "_Poster"], true);
  const fd = new FormData();
  fd.append("folder", pf);
  fd.append("file", new Blob([fs.readFileSync(jpg)], { type: "image/jpeg" }), `poster-${info.nama.replace(/\.[^.]+$/, "")}.jpg`);
  const poster = await dx("POST", "/files", fd);
  fs.rmSync(jpg, { force: true });
  await dx("PATCH", `/files/${poster.id}`, { title: `Poster · ${info.judul}`, tags: ["poster", kebab(info.brand)] });
  const item = { judul: info.judul, file: fileId, poster: poster.id, brand: info.brand, produk: info.produk || null, kategori: info.kategori || null,
    rasio, durasi, ucapan: info.ucapan || null, keterangan: info.keterangan || null };
  const lama = (await dx("GET", `/items/video_aset?filter[file][_eq]=${fileId}&fields=id,poster`))[0];
  if (lama?.poster) await dx("DELETE", `/files/${lama.poster}`).catch(() => {});
  const r = lama ? await dx("PATCH", `/items/video_aset/${lama.id}`, item) : await dx("POST", "/items/video_aset", item);
  console.log(`  katalog video_aset #${r.id}  ${rasio}  ${durasi} dtk  poster=${poster.id}`);
}

async function main() {
  if (a["katalog-ulang"]) {
    const sudah = new Set((await dx("GET", "/items/video_aset?limit=-1&fields=file")).map((x) => x.file));
    const vids = (await dx("GET", "/files?limit=-1&filter[type][_starts_with]=video/&fields=id,title,description,filename_download,folder.name,folder.parent.name"))
      .filter((v) => !sudah.has(v.id));
    for (const v of vids) {
      const tmp = path.join(os.tmpdir(), `vid-${v.id}${path.extname(v.filename_download)}`);
      fs.writeFileSync(tmp, Buffer.from(await (await fetch(`${U}/assets/${v.id}`, { headers: { Authorization: `Bearer ${TOKEN}` } })).arrayBuffer()));
      const sub = v.folder?.name || "", kat = { "Iklan": "iklan", "Klip AI": "klip-ai", "Screen Recording": "screen-recording", "Tutorial": "tutorial" }[sub] || "lainnya";
      const ucapan = (v.description || "").match(/['"‘“]([^'"’”]{8,})['"’”]/)?.[1] || null;
      console.log(v.filename_download);
      await katalogVideo(v.id, tmp, { brand: v.title?.match(/^Video (.+?) ·/)?.[1] || "Nusawebsite", nama: v.filename_download,
        judul: (v.title || v.filename_download).replace(/^Video .+? · /, ""), produk: v.folder?.parent?.name || null, kategori: kat, ucapan, keterangan: v.description });
      fs.rmSync(tmp, { force: true });
    }
    console.log(`selesai: ${vids.length} video masuk katalog`);
    return void (process.exitCode = 0);
  }

  if (a.pohon) {
    const folders = await dx("GET", "/folders?limit=-1&fields=id,name,parent");
    const files = await dx("GET", "/files?limit=-1&fields=folder,filesize,storage");
    const kids = (p) => folders.filter((f) => (f.parent || null) === p).sort((x, y) => x.name.localeCompare(y.name));
    const walk = (p, ind) => kids(p).forEach((f) => {
      const fs_ = files.filter((x) => x.folder === f.id);
      const mb = (fs_.reduce((s, x) => s + Number(x.filesize || 0), 0) / 1e6).toFixed(1);
      console.log(`${ind}${f.name}/  ${fs_.length ? `${fs_.length} file, ${mb} MB` : ""}`);
      walk(f.id, ind + "  ");
    });
    walk(null, "");
    const root = files.filter((x) => !x.folder).length;
    if (root) console.log(`(root) ${root} file — seharusnya 0, pindahkan ke folder brand`);
    return void (process.exitCode = 0);
  }

  for (const k of ["brand", "jenis", "file", "varian", "deskripsi"]) if (!a[k] || a[k] === true) { console.error(`--${k} wajib`); return void (process.exitCode = 2); }
  if (!JENIS.includes(a.jenis)) { console.error(`--jenis harus salah satu: ${JENIS.join(", ")}`); return void (process.exitCode = 2); }
  if (!fs.existsSync(a.file)) { console.error(`berkas tidak ada: ${a.file}`); return void (process.exitCode = 2); }

  const brand = String(a.brand).trim();
  const ext = path.extname(a.file).toLowerCase();
  const nama = `${kebab(brand)}-${kebab(a.jenis)}-${kebab(a.varian)}${ext}`;
  const segs = [brand, a.jenis, ...(a.sub && a.sub !== true ? String(a.sub).split("/").filter(Boolean) : [])];
  const meta = {
    title: `${a.jenis} ${brand} · ${a.varian}`,
    description: a.deskripsi,
    tags: [...new Set([kebab(brand), kebab(a.jenis), ...kebab(a.varian).split("-"), ...(a.tags && a.tags !== true ? String(a.tags).split(",").map((s) => s.trim()).filter(Boolean) : [])])],
  };
  if (a.dry) { console.log(JSON.stringify({ folder: segs.join("/"), nama, ...meta }, null, 2)); return void (process.exitCode = 0); }

  const folder = await folderPath(segs, true);
  const dup = (await dx("GET", `/files?filter[folder][_eq]=${folder}&filter[filename_download][_eq]=${encodeURIComponent(nama)}&fields=id`))[0];
  if (dup && !a.ganti) { console.error(`SUDAH ADA ${segs.join("/")}/${nama} (id ${dup.id}). Pakai --ganti untuk mengganti isinya.`); return void (process.exitCode = 3); }

  const fd = new FormData();
  if (!dup) fd.append("folder", folder);
  fd.append("file", new Blob([fs.readFileSync(a.file)], { type: MIME[ext.slice(1)] || "application/octet-stream" }), nama);
  const f = dup ? await dx("PATCH", `/files/${dup.id}`, fd) : await dx("POST", "/files", fd);
  await dx("PATCH", `/files/${f.id}`, meta);
  console.log(`${dup ? "DIGANTI" : "TERSIMPAN"} ${segs.join("/")}/${nama}  id=${f.id}  ${U}/assets/${f.id}`);
  if (a.jenis === "Video" && /^video\//.test(MIME[ext.slice(1)] || ""))
    await katalogVideo(f.id, a.file, { brand, nama, judul: a.varian, produk: a.produk !== true ? a.produk : null, kategori: a.kategori !== true ? a.kategori : null,
      ucapan: a.ucapan !== true ? a.ucapan : null, keterangan: a.deskripsi, detikPoster: a["detik-poster"] });
}
await main();
