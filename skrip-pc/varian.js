// Atur gaya editor Recordly lalu ekspor.  node varian.js <padding> <cropTop> <latar: wallpaper|color|none>
// Slider Recordly = div[role=slider]; diatur lewat keyboard (Home lalu ArrowRight n kali).
const { chromium } = require('playwright');
(async () => {
  const [pad, top, latar] = [+process.argv[2], +process.argv[3], process.argv[4] || 'wallpaper'];
  const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap((c) => c.pages()).find((x) => x.url().includes('editor'));
  const slider = async (loc, n) => {
    await loc.focus();
    for (let i = 0; i < 200 && +(await loc.getAttribute('aria-valuenow')) > n; i++) await p.keyboard.press('ArrowLeft');
    for (let i = 0; i < 200 && +(await loc.getAttribute('aria-valuenow')) < n; i++) await p.keyboard.press('ArrowRight');
    return loc.getAttribute('aria-valuenow');
  };
  const pads = p.locator('[role=slider]').filter({ hasNot: p.locator('[aria-label]') });
  const padSlider = p.locator('[role=slider]').nth(3);
  console.log('padding =', await slider(padSlider, pad));
  console.log('crop top =', await slider(p.locator('[role=slider][aria-label="Top"]'), top));
  if (process.argv[5]) console.log('radius =', await slider(p.locator('[role=slider][aria-label="Radius"]'), +process.argv[5]));
  if (latar === 'color') {
    await p.getByRole('button', { name: 'Color', exact: true }).click();
    await p.waitForTimeout(800);
  } else if (latar === 'wallpaper') {
    await p.getByRole('button', { name: 'Image', exact: true }).click();
  }
  await p.screenshot({ path: process.env.SHOT || 'C:/Users/M.S.I/AppData/Local/Temp/varian.png' });
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
