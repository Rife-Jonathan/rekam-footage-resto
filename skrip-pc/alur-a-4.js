// Alur FASE A bagian 4: a17..a22 (bahan/SHOTLIST-RESTO.md). Durasi alur ≈ target − 1 dtk.
module.exports = (h) => {
  const { P, BASE, hover, tekan, ubah, geser, kirim, langkah, buka, sleep, DRY } = h;
  const roda = async (n, ms = 700) => { await kirim('roda ' + n); await geser(ms); };
  const teks = (t) => P().getByText(t, { exact: true }).first();
  // halaman kadang kosong sesaat (server beban) → muat ulang sampai isi tampil
  const pastikan = (sel) => async () => { for (let i = 0; i < 3; i++) { if (await P().locator(sel).first().isVisible().catch(() => false)) return; await P().waitForTimeout(2500); if (await P().locator(sel).first().isVisible().catch(() => false)) return; await P().reload({ waitUntil: 'load' }); } };
  const menuSamping = (t) => P().locator('aside a, nav a').filter({ hasText: t }).first();

  return {
    // ---------- A17 Penggajian (periode Sep 2026 — satu-satunya periode; shotlist menulis Agu) ----------
    a17: { awal: '/people/payroll', siap: pastikan('tbody tr'), async jalan() { // target 15
      await langkah('periode', () => hover(P().locator('tbody tr').first().locator('td').first(), 1300));
      await langkah('buka periode', () => tekan(P().locator('tbody tr').first().getByText('Buka'), 1700));
      await langkah('gaji bersih', () => tekan(P().getByText(/^gaji bersih$/i).first(), 1700, 0.9, 20));
      await langkah('baris karyawan', () => hover(P().locator('tbody tr', { hasText: 'Budi Santoso' }).locator('td').nth(0), 1200));
      await langkah('slip gaji', async () => {
        const a = P().locator('tbody tr', { hasText: 'Budi Santoso' }).getByText('Slip Gaji');
        await a.evaluate((e) => e.removeAttribute('target')); // tautan target=_blank → buka di tab yang sama (halaman rekam tetap satu)
        await tekan(a, 1800);
      });
      await langkah('rincian slip', () => hover(P().getByText('Gaji bersih', { exact: true }).first(), 1200));
    } },

    // ---------- A18 Log Audit ----------
    a18: { awal: '/audit', async jalan() { // target 12
      await langkah('filter aksi', async () => {
        await hover(P().locator('select').first(), 900);
        await P().locator('select').first().selectOption({ label: 'Pembayaran direfund' }); // pilih tanpa popup OS; hanya GET filter
        await geser(900);
      });
      await langkah('nilai lama baru', () => hover(P().locator('tbody tr').first().locator('td').nth(4), 1800));
      await langkah('sorot nominal', () => tekan(P().locator('tbody tr').first().getByText('Nominal:').first(), 1900, 0.9));
      await langkah('alasan', () => hover(P().locator('tbody tr').first().locator('td').nth(5), 2100));
    } },

    // ---------- A19 Website CMS ----------
    a19: { awal: '/website/home', siap: pastikan('h1:has-text("CMS"), h2:has-text("Konten Hero"), h3:has-text("Konten Hero")'), async jalan() { // target 14
      await langkah('hero', () => tekan(P().getByRole('heading', { name: 'Konten Hero' }), 1700));
      await langkah('gulir', () => roda(-5, 1700));
      await langkah('menu unggulan', () => tekan(P().getByRole('heading', { name: 'Menu Unggulan' }), 1700));
      await langkah('lihat situs', () => tekan(P().getByRole('link', { name: 'Lihat Situs' }).first(), 1800)); // href "/" (tab sama) → beranda publik
      await langkah('beranda publik', () => hover('h1', 2600));
    } },

    // ---------- A20 Web publik HP ----------
    a20: { akun: 'publik', hp: true, awal: '/', async jalan() { // target 14
      await langkah('hero', () => hover('h1', 1200, 0.5));
      await langkah('gulir beranda', async () => { await roda(-3, 800); await roda(-3, 800); });
      await langkah('ke menu', () => tekan(P().locator('a[href="/menu"]:visible').last(), 1700));
      await langkah('gulir menu', async () => { await roda(-3, 800); await roda(-2, 800); });
      await langkah('kategori', () => hover(P().getByRole('button', { name: 'Sate & Grill' }).first(), 1900, 0.7));
      await langkah('bottom nav', () => hover(P().locator('a[href="/"]:visible').last(), 2000, 0.8));
    } },

    // ---------- A21 Pengaturan ----------
    a21: { awal: '/settings/restaurant', async jalan() { // target 14
      const tab = (n) => P().getByRole('button', { name: n, exact: true }).first();
      await langkah('info', () => hover('#restaurant-tax-percent', 1000));
      await langkah('kasir & struk', () => tekan(tab('Kasir & Struk'), 1500));
      await langkah('jam buka', () => tekan(tab('Jam Buka per Hari'), 1500));
      await langkah('sla', () => tekan(tab('Target SLA Layanan'), 1500));
      await langkah('batas margin', () => tekan(tab('Batas Margin Menu'), 1500));
      await langkah('margin sehat', () => hover('#costing-margin-healthy-min-percent', 1300));
    } },

    // ---------- A22 Akses per role: Kasir → logout → Dapur ----------
    a22: { akun: 'kasir', awal: '/dashboard', siap: pastikan('aside a'), async jalan() { // target 16
      await langkah('sidebar kasir', () => hover(menuSamping('Pesanan'), 1500));
      await langkah('sidebar kasir 2', () => hover(menuSamping('Pembayaran'), 1300));
      await langkah('menu pengguna', () => tekan(P().getByLabel('Buka menu pengguna'), 900));
      await langkah('keluar', async () => {
        await ubah(P().locator('[role=menuitem]:has-text("Keluar")').first(), 900);
        if (DRY) { await P().context().clearCookies(); await buka(P(), '/login'); } // uji kering: POST logout diblokir → hapus cookie lokal saja
        else await P().waitForURL(/\/login/, { timeout: 30000 });
      });
      await langkah('pilih dapur', () => tekan(P().getByRole('button', { name: 'Dapur', exact: true }), 1000));
      await langkah('masuk', async () => {
        await ubah(P().getByRole('button', { name: 'Masuk', exact: true }), 800);
        if (!DRY) { await P().waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 60000 }); await sleep(800); }
      });
      await langkah('sidebar dapur', () => hover(DRY ? P().getByRole('button', { name: 'Masuk', exact: true }) : menuSamping('Dapur'), 1500));
    } },
  };
};
