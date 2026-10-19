const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  const B='https://demo-dokter-gigi.nusawebsite.com'; await p.goto(B+'/login'); await p.fill('#email, input[type=email]','admin@klinik.com'); await p.fill('#password','password'); await p.click('button[type=submit]');
  await p.waitForURL(u=>!/login/.test(u.pathname)); await p.waitForTimeout(1500);
  console.log('banner demo:', await p.locator('text=MODE DEMO AKTIF').count()); await b.close(); })();
