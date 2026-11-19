// usage: node render.js scenes.json out.mp4 [fps]   |   node render.js scenes.json --stills 1.2,4.0,...
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2])); const out = process.argv[3]; const fps = +(process.argv[4] || 30);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => console.log('page:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, 'liquid.html'));
  await p.evaluate(s => window.setup(s), spec.scenes);
  const end = spec.end, cv = await p.$('#c');
  if (out === '--stills') {
    for (const t of process.argv[4].split(',').map(Number)) {
      await p.evaluate(([t, e]) => window.frame(t, e), [t, end]);
      await cv.screenshot({ path: path.join(__dirname, `still_${t}.png`) }); console.log('still', t);
    }
    return b.close();
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(end * fps);
  for (let f = 0; f < N; f++) {
    await p.evaluate(([t, e]) => window.frame(t, e), [f / fps, end]);
    const buf = await cv.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log('frame', f, '/', N);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out);
})();
