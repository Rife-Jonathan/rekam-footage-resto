// Konfigurasi resto (bahan/SHOTLIST-RESTO.md): URL, akun demo, login lewat tombol "Masuk cepat untuk demo".
const BASE = 'https://resto.nusawebsite.com';
const SANDI = 'demo12345';
const AKUN = { manajer: 'demo.manager@resto.test', kasir: 'demo.cashier@resto.test', pelayan: 'demo.waiter@resto.test', dapur: 'demo.kitchen@resto.test' };
const TOMBOL = { manajer: 'Manajer', kasir: 'Kasir', pelayan: 'Pelayan', dapur: 'Dapur' };
// Halaman ini punya polling/websocket → jangan pakai networkidle (bisa tidak pernah idle).
const buka = async (p, rute) => { await p.goto(BASE + rute, { waitUntil: 'load', timeout: 60000 }); await p.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {}); };
async function login(p, akun = 'manajer') {
  await buka(p, '/login');
  // laptop sibuk → kadang halaman login belum ter-render; muat ulang sekali
  if (!(await p.locator('input[type=email], #email').first().waitFor({ timeout: 15000 }).then(() => true, () => false))) await buka(p, '/login');
  await p.fill('input[type=email], input[name=email], #email', AKUN[akun]);
  await p.fill('input[type=password], #password', SANDI);
  await p.locator('button[type=submit]').first().click();
  await p.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 60000 });
}
module.exports = { BASE, SANDI, AKUN, TOMBOL, buka, login };
