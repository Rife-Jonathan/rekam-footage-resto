const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1000 } });
  const B='https://demo-dokter-gigi.nusawebsite.com'; await p.goto(B+'/login'); await p.fill('#email, input[type=email]','admin@klinik.com'); await p.fill('#password','password'); await p.click('button[type=submit]');
  await p.waitForURL(u=>!/login/.test(u.pathname));
  console.log((await p.$$eval('nav a, aside a', xs=>xs.map(x=>x.innerText.trim()+' -> '+x.getAttribute('href')))).join('\n'));
  for (const r of (process.argv[2]||'').split(',').filter(Boolean)) { await p.goto(B+r,{waitUntil:'networkidle'}); console.log('\n=== '+r+'\n'+(await p.$$eval('main button, main a, main [role=tab]', xs=>xs.map(x=>x.innerText.trim().replace(/\s+/g,' ')).filter(Boolean))).slice(0,60).join(' | ')); }
  await b.close(); })();
