// Records short phone clips of the real app features. Frames -> clips/<name>/NNNN.jpg + times.json
const { chromium } = require('playwright'); const fs = require('fs');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true, userAgent: UA });
  await ctx.addInitScript(() => { try { localStorage.setItem('ma-notice', '1') } catch (e) {} });
  const p = await ctx.newPage(); const W = ms => p.waitForTimeout(ms);
  await p.goto('https://mnaprep.com/', { waitUntil: 'load', timeout: 60000 }); await W(3000);
  await p.addStyleTag({ content: `#nl-badge-frame{display:none!important}
   #tapdot{position:fixed;z-index:2147483647;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(37,99,235,.35);border:3px solid rgba(37,99,235,.9);pointer-events:none;transform:scale(.4);opacity:0;transition:transform .25s,opacity .25s}#tapdot.on{transform:scale(1);opacity:1}` });
  const vis = t => p.locator(':is(button,a,summary,[role=tab]):visible', { hasText: t }).first();
  const tapL = async loc => { const bb = await loc.boundingBox(); if (!bb) return;
    await p.evaluate(([x, y]) => { let d = document.getElementById('tapdot'); if (!d) { d = document.createElement('div'); d.id = 'tapdot'; document.body.appendChild(d); } d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.add('on'); setTimeout(() => d.classList.remove('on'), 420); }, [bb.x + bb.width / 2, bb.y + bb.height / 2]);
    await W(200); await loc.click().catch(() => {}); };
  const tap = t => tapL(vis(t));
  const scroll = (dy, ms) => p.evaluate(([dy, ms]) => new Promise(r => { const s = scrollY, t = performance.now(); const f = n => { const k = Math.min(1, (n - t) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, s + dy * e); k < 1 ? requestAnimationFrame(f) : r() }; requestAnimationFrame(f) }), [dy, ms]);
  const right = async () => { // tap the correct option of the open question
    const r = await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent && /^[A-D]\s/.test(b.innerText.trim()));
      const os = bs.map(b => b.innerText.trim().slice(1).trim()); let j = 0;
      for (const tr of TRACKS) for (const L of tr.levels) for (const q of (L.q || [])) if (q[1] && q[1][0] === os[0] && q[1][1] === os[1]) j = q[2];
      const e = bs[j]; if (!e) return null; const bb = e.getBoundingClientRect(); return [bb.x + bb.width / 2, bb.y + bb.height / 2]; });
    if (!r) { console.log('no options'); return; }
    await p.evaluate(([x, y]) => { let d = document.getElementById('tapdot'); if (!d) { d = document.createElement('div'); d.id = 'tapdot'; document.body.appendChild(d); } d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.add('on'); setTimeout(() => d.classList.remove('on'), 420); }, r);
    await W(200); await p.mouse.click(r[0], r[1]); };
  let rec = null;
  const start = name => { const dir = `clips/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    rec = { dir, t0: Date.now(), times: [], on: true };
    rec.loop = (async () => { let i = 0; while (rec.on) { const buf = await p.screenshot({ type: 'jpeg', quality: 88 }); fs.writeFileSync(`${dir}/${String(i).padStart(4, '0')}.jpg`, buf); rec.times.push((Date.now() - rec.t0) / 1000); i++; } })(); };
  const stop = async () => { rec.on = false; await rec.loop; fs.writeFileSync(`${rec.dir}/times.json`, JSON.stringify(rec.times)); console.log(rec.dir, rec.times.length, 'frames', rec.times.at(-1)); };
  await tap("Skip, I'll look around"); await W(800);
  // 1 Tracks: open level 1, start drill, answer right
  await tap('Learn'); await W(600); await tap('Tracks'); await W(500); await scroll(300, 10); await W(400);
  start('tracks'); await W(500); await tapL(p.locator('.node[data-l="0"]').locator('visible=true').first()); await W(1300);
  await tap('Start drill'); await W(1300); await right(); await W(1400); await stop();
  await p.keyboard.press('Escape'); await p.locator('.x,[aria-label=Close]').locator('visible=true').first().click({ timeout: 1500 }).catch(() => {}); await W(500);
  // 2 Rapid Fire
  await p.evaluate(() => scrollTo(0, 0)); await tap('Practice'); await W(600); await tap('Rapid Fire'); await W(500); await scroll(250, 10);
  start('rapid'); await W(400); await tap('Start round'); await W(1100); await right(); await W(900); await right(); await W(900); await right(); await W(700); await stop();
  await p.keyboard.press('Escape'); await p.locator('.x,[aria-label=Close]').locator('visible=true').first().click({ timeout: 1500 }).catch(() => {}); await W(500);
  // 3 Mock interview
  await p.evaluate(() => scrollTo(0, 0)); await W(300);
  start('mock'); await W(300); await tap('Interview'); await W(1200); await scroll(260, 900); await W(600); await tap('Superday simulator'); await W(1300); await stop();
  // 4 Deals
  await p.evaluate(() => scrollTo(0, 0)); await tap('Learn'); await W(500);
  start('deals'); await W(300); await tap('Deals'); await W(900); await scroll(250, 700); await tap('Marvell Technology'); await W(900); await scroll(330, 1400); await W(500); await stop();
  // 5 Compete: collegiate series + leaderboards
  await p.evaluate(() => scrollTo(0, 0)); await tap('Home'); await W(800);
  start('compete'); await W(1400); await tap('Compete'); await W(900); await tap('Leaderboards'); await W(700); await scroll(260, 900); await W(800); await stop();
  await b.close();
})();
