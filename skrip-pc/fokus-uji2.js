const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  const box = async () => p.evaluate(() => { const e = document.querySelector('div.absolute.rounded-md[class*="2563EB"]'); const r = e.getBoundingClientRect(); return { x: r.x|0, y: r.y|0, w: r.width|0, h: r.height|0 }; });
  const b0 = await box(); const tx = b0.x + b0.w*1.5*0.6, ty = b0.y + b0.h*1.5*0.6;
  await p.mouse.move(b0.x + b0.w/2, b0.y + b0.h/2); await p.mouse.down(); await p.mouse.move(tx, ty, { steps: 15 }); await p.mouse.up(); await p.waitForTimeout(500);
  console.log('drag ->', JSON.stringify(await box()));
  await p.mouse.click(b0.x + 50, b0.y + 50); await p.waitForTimeout(500);
  console.log('klik ->', JSON.stringify(await box())); process.exit(0); })();
