const { chromium } = require('E:/Content-Machine/node_modules/playwright');
(async () => { const b = await chromium.connectOverCDP('http://127.0.0.1:9556');
  const p = b.contexts().flatMap(c => c.pages()).find(p => p.url().includes('editor'));
  const r = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('div')) { const cs = getComputedStyle(e); const rc = e.getBoundingClientRect();
      if (rc.width > 200 && rc.width < 1300 && rc.y > 90 && rc.y < 780 && (cs.borderStyle !== 'none' && parseFloat(cs.borderWidth) >= 1) && /rgba?\(/.test(cs.backgroundColor) && cs.position === 'absolute')
        out.push({ x: rc.x|0, y: rc.y|0, w: rc.width|0, h: rc.height|0, cur: cs.cursor, bg: cs.backgroundColor, bd: cs.borderColor, cls: e.className.slice(0,80) }); }
    const cv = [...document.querySelectorAll('canvas,video')].map(e => { const rc = e.getBoundingClientRect(); return { tag: e.tagName, x: rc.x|0, y: rc.y|0, w: rc.width|0, h: rc.height|0 }; });
    return { out, cv };
  });
  console.log(JSON.stringify(r, null, 1)); process.exit(0); })();
