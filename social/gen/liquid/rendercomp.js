const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const spec = JSON.parse(fs.readFileSync('spec.json')), amp = JSON.parse(fs.readFileSync('amp.json')), clips = JSON.parse(fs.readFileSync('clips.json'));
  const stills = process.argv[2] === '--stills' ? process.argv[3].split(',').map(Number) : null;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, 'comp.html')); await p.waitForFunction(() => window.setup && window.THREE);
  await p.evaluate(([s, a, c]) => window.setup(s, a, c), [spec, amp, clips]);
  const fr = async t => { await p.evaluate(t => window.frame(t), t); await p.waitForTimeout(5); return p.screenshot({ type: 'jpeg', quality: 93 }) };
  if (stills) { for (const t of stills) fs.writeFileSync(`still_${t}.jpg`, await fr(t)); return b.close(); }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', 'video.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(spec.end * 30);
  for (let f = 0; f < N; f++) { const buf = await fr(f / 30); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f, N); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('video done');
})();
