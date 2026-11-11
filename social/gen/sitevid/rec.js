// Records a scripted mobile session of mnaprep.com as sharp JPEG frames via CDP screencast.
// usage: node rec.js <scenario> <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const [,, scen, out] = process.argv;
fs.mkdirSync(out, { recursive: true });

const HIDE = `#nl-badge-frame{display:none!important}
#tapdot{position:fixed;z-index:2147483647;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
background:rgba(37,99,235,.35);border:3px solid rgba(37,99,235,.9);pointer-events:none;transform:scale(.4);opacity:0;transition:transform .25s,opacity .25s}
#tapdot.on{transform:scale(1);opacity:1}`;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 693 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  const css = () => p.addStyleTag({ content: HIDE }).catch(() => {});
  const W = ms => p.waitForTimeout(ms);
  const marks = {}; let t0 = 0, frames = [];
  const mark = n => marks[n] = (Date.now() - t0) / 1000;
  const cdp = await ctx.newCDPSession(p);
  let n = 0;
  cdp.on('Page.screencastFrame', async f => {
    const fn = `${out}/f${String(n++).padStart(5, '0')}.jpg`;
    fs.writeFileSync(fn, Buffer.from(f.data, 'base64'));
    frames.push([fn, Date.now()]);
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  const start = async () => { t0 = Date.now(); await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1170, maxHeight: 2079, everyNthFrame: 1 }); };
  // keep the screen "alive" so frames keep arriving even when nothing moves
  const tick = async () => p.evaluate(() => { let d = document.getElementById('kp'); if (!d) { d = document.createElement('i'); d.id = 'kp'; d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01;z-index:2147483647'; document.body.appendChild(d); } setInterval(() => d.style.background = d.style.background == 'red' ? 'blue' : 'red', 33); });
  const scroll = async (dy, ms) => p.evaluate(([dy, ms]) => new Promise(r => { const s = scrollY, t = performance.now();
    const f = now => { const k = Math.min(1, (now - t) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, s + dy * e); k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); }), [dy, ms]);
  const scrollTo = async (sel, offset, ms) => { const y = await p.evaluate(([s, o]) => { const e = document.querySelector(s); return e.getBoundingClientRect().top - o; }, [sel, offset]); await scroll(y, ms); };
  const tap = async loc => { const bb = await loc.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    await p.evaluate(([x, y]) => { let d = document.getElementById('tapdot'); if (!d) { d = document.createElement('div'); d.id = 'tapdot'; document.body.appendChild(d); }
      d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.add('on'); setTimeout(() => d.classList.remove('on'), 450); }, [x, y]);
    await W(180); await loc.click(); };

  if (scen === 'home') {
    await p.goto('https://mnaprep.com/', { waitUntil: 'networkidle' }); await W(2500);
    await p.getByText("Skip, I'll look around").click().catch(() => {}); await W(600); await css(); await tick();
    await p.evaluate(() => scrollTo(0, 0)); await W(400);
    await start(); mark('hook'); await W(2600);
    await scrollTo('.pv', 150, 900); mark('q'); await W(2600);
    await tap(p.locator('.pv').getByText('Up $2.50')); mark('xp'); await W(2600);
    await scroll(560, 1600); mark('feat'); await W(1800);
    await scroll(560, 1500); mark('live'); await W(2600);
    mark('end');
  }
  if (scen === 'pay') {
    await p.goto('https://mnaprep.com/tools/investment-banking-pay/', { waitUntil: 'networkidle' }); await W(1500); await css(); await tick();
    await start(); mark('hook'); await W(2400);
    await scroll(330, 1000); mark('an'); await W(2400);
    mark('md'); await W(2200);
    await tap(p.getByRole('button', { name: 'Elite boutique' })); mark('eb'); await W(2600);
    await tap(p.getByRole('button', { name: 'Middle market' })); mark('mm'); await W(2200);
    await scrollTo('table', 120, 1400); mark('tbl'); await W(2600);
    mark('end');
  }
  if (scen === 'sd') {
    await p.goto('https://mnaprep.com/tools/superday-readiness-test/', { waitUntil: 'networkidle' }); await W(1500); await css(); await tick();
    const ans = [2, 1, 2, 1, 0, 1, 0, 2, 3, 1, 2, 1];
    const q = i => p.locator('.opt').nth(i * 4 + ans[i]);
    await start(); mark('hook'); await W(2400);
    await scroll(300, 900); mark('q1'); await W(3000);
    await tap(q(0)); mark('a1'); await W(1600);
    await scroll(300, 800); mark('q2'); await W(2400);
    await tap(q(1)); await W(1200);
    await scroll(330, 800); mark('q3'); await W(2600);
    await tap(q(2)); mark('a3'); await W(1400);
    mark('rest');
    for (let i = 3; i < 12; i++) { await q(i).scrollIntoViewIfNeeded(); await q(i).click(); await W(260); }
    const btn = p.locator('button', { hasText: /score|result|submit|check/i }).first();
    if (await btn.count()) { await btn.scrollIntoViewIfNeeded(); await W(500); await tap(btn); }
    await W(900); mark('score'); await W(3200);
    mark('end');
  }
  await cdp.send('Page.stopScreencast');
  const tEnd = Date.now();
  // ffconcat with real durations
  let s = 'ffconcat version 1.0\n';
  frames.forEach(([fn, t], i) => { const nx = i + 1 < frames.length ? frames[i + 1][1] : tEnd; s += `file '${fn.split('/').pop()}'\nduration ${((nx - t) / 1000).toFixed(3)}\n`; });
  s += `file '${frames[frames.length - 1][0].split('/').pop()}'\n`;
  fs.writeFileSync(`${out}/list.txt`, s);
  fs.writeFileSync(`${out}/marks.json`, JSON.stringify({ ...marks, total: (tEnd - t0) / 1000 }));
  await p.screenshot({ path: `${out}/last.png` });
  console.log(scen, frames.length, 'frames', JSON.stringify(marks));
  await b.close();
})();
