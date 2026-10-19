// Intip isi dialog/form setelah tombol pembuka diklik (HANYA BACA: request non-GET diblokir, headless).
//   node intip-form.js "<rute>|<selektor pembuka>" ...   mis. "/doctors|button:has-text(\"Tambah Dokter\")"
//   selektor kosong → isi halaman (main) saja. Screenshot: out/intip/form-<n>.png
const { chromium } = require('playwright');
const { BASE, login, buka } = require('./resto'); // AKUN=manajer|kasir|pelayan|dapur|publik
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: process.env.HP ? { width: 390, height: 844 } : { width: 1920, height: 1008 } });
  if ((process.env.AKUN || 'manajer') !== 'publik') await login(p, process.env.AKUN || 'manajer');
  await p.route('**/*', (r) => (r.request().method() === 'GET' ? r.continue() : r.abort()));
  let n = 0;
  for (const arg of process.argv.slice(2)) {
    const [rute, buka] = arg.split('|');
    await buka(p, rute).catch(() => {}); await p.waitForTimeout(1000);
    if (buka) { try { await p.locator(buka).first().click({ timeout: 5000 }); await p.waitForTimeout(1000); } catch (e) { console.log('## ' + arg + ' → GAGAL buka: ' + e.message.split('\n')[0]); continue; } }
    const isi = await p.evaluate((pakaiDialog) => {
      const akar = (pakaiDialog && [...document.querySelectorAll('[role=dialog]')].pop()) || document.querySelector('main') || document.body;
      const t = (e) => (e.getAttribute('aria-label') || e.getAttribute('title') || e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 45);
      return [...akar.querySelectorAll('h2,h3,label,input,textarea,select,button,[role=combobox],[role=tab],[role=switch],[role=checkbox]')].map((e) => {
        const tag = e.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return `${tag}[${e.type || ''}] ph="${e.placeholder || ''}" name="${e.name || e.id || ''}" val="${(e.value || '').slice(0, 25)}"`;
        if (tag === 'select') return `select name="${e.name || e.id || ''}" opsi=${[...e.options].slice(0, 6).map((o) => o.text.trim()).join('/')}`;
        const ik = [...(e.querySelector('svg')?.classList || [])].find((c) => c.startsWith('lucide-') && c !== 'lucide');
        return `${tag}${e.getAttribute('role') ? '(' + e.getAttribute('role') + ')' : ''}: ${t(e)}${ik ? ' {' + ik + '}' : ''}`;
      }).filter((s, i, a) => a.indexOf(s) === i).join('\n  ');
    }, !!buka);
    await p.screenshot({ path: __dirname + `/../out/intip/form-${++n}.png` });
    console.log('## ' + arg + '  [form-' + n + '.png]\n  ' + isi);
  }
  await b.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
