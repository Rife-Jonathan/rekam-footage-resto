const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1000 } });
  const B='https://demo-dokter-gigi.nusawebsite.com'; await p.goto(B+'/login'); await p.fill('#email, input[type=email]','admin@klinik.com'); await p.fill('#password','password'); await p.click('button[type=submit]');
  await p.waitForURL(u=>!/login/.test(u.pathname)); await p.goto(B+(process.argv[2]||'/queue'),{waitUntil:'networkidle'});
  console.log((await p.$$eval('button,a',xs=>xs.map(x=>x.innerText.trim().replace(/\s+/g,' ')).filter(Boolean))).slice(0,80).join(' | '));
  await p.screenshot({path:process.argv[3]}); await b.close(); })();
