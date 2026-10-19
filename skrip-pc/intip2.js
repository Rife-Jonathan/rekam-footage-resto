const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1000 } });
  const B='https://demo-dokter-gigi.nusawebsite.com'; await p.goto(B+'/login'); await p.fill('#email, input[type=email]','admin@klinik.com'); await p.fill('#password','password'); await p.click('button[type=submit]');
  await p.waitForURL(u=>!/login/.test(u.pathname)); await p.goto(B+'/patients',{waitUntil:'networkidle'});
  await p.click('main a:has-text("Ahmad Fauzi"), main button:has-text("Ahmad Fauzi")'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
  console.log('URL', p.url()); console.log((await p.$$eval('main button, main a, [role=tab]', xs=>xs.map(x=>x.innerText.trim().replace(/\s+/g,' ')).filter(Boolean))).slice(0,50).join(' | '));
  await p.goto(B+'/invoices',{waitUntil:'networkidle'}); await p.click('main :text("INV000001")'); await p.waitForTimeout(1500);
  console.log('INV URL', p.url()); console.log((await p.$$eval('main button, main a', xs=>xs.map(x=>x.innerText.trim().replace(/\s+/g,' ')).filter(Boolean))).slice(0,30).join(' | '));
  await b.close(); })();
