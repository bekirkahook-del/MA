const { chromium } = require('playwright');
const steps = JSON.parse(process.argv[2]);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  await ctx.addInitScript(() => { try { localStorage.setItem('ma-notice', '1') } catch (e) {} });
  const p = await ctx.newPage(); const W = ms => p.waitForTimeout(ms);
  await p.goto('https://mnaprep.com/', { waitUntil: 'load', timeout: 60000 }); await W(3000);
  await p.addStyleTag({ content: '#nl-badge-frame{display:none!important}' });
  const vis = t => p.locator(`:is(button,a,summary,[role=tab],[role=button],label,.ob-o):visible`, { hasText: t }).first();
  for (const [i, s] of steps.entries()) {
    if (s.startsWith('css:')) { try { await p.locator(s.slice(4)).locator('visible=true').first().click({ timeout: 4000 }) } catch (e) { console.log('FAIL', s) } } else if (s.startsWith('text:')) { try { await p.getByText(s.slice(5), { exact: true }).locator('visible=true').first().click({ timeout: 4000 }) } catch (e) { console.log('FAIL', s) } } else if (s.startsWith('scroll:')) await p.mouse.wheel(0, +s.slice(7)); else if (s.startsWith('js:')) await p.evaluate(s.slice(3));
    else try { await vis(s).click({ timeout: 4000 }); } catch (e) { console.log('FAIL', s); }
    await W(1400);
  }
  await p.screenshot({ path: 'shots/probe.png' });
  console.log((await p.$$eval('button,a,summary,.ob-o', es => es.filter(e => { const r = e.getBoundingClientRect(); return e.offsetParent && r.top > 150 && r.top < 780 }).map(e => e.innerText.trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean))).join(' | '));
  await b.close();
})();
