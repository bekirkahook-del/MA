// node render.js <story.js> <tl.json> <outdir> [test]
const {chromium}=require('playwright');const fs=require('fs');const [story,tlf,out,mode]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
 const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CERR',m.text())});
 const TL=JSON.parse(fs.readFileSync(tlf));await p.addInitScript(([s,t])=>{window.STORY=s;window.TL=t},[story,TL]);
 await p.goto('file://'+__dirname+'/engine.html');await p.waitForFunction(()=>window.ready,{timeout:60000});
 await p.evaluate(()=>['learn.png','lesson.png','question.png','coffee.png','email.png','qr.png'].forEach(n=>window.API.img(n)));await p.waitForTimeout(2500);await p.evaluate(()=>window.render(0));await p.waitForTimeout(1500);/* textures load */
 fs.mkdirSync(out,{recursive:true});const end=TL[TL.length-1].b,fps=30;
 const ts=mode==='test'?TL.map(s=>s.a+(s.b-s.a)*0.75):[...Array(Math.round(end*fps)).keys()].map(f=>f/fps);
 let last=-1;for(const [k,t] of ts.entries()){const i=TL.findIndex(s=>t>=s.a&&t<s.b);await p.evaluate(t=>window.render(t),t);if(i!==last){last=i;await p.waitForTimeout(400);await p.evaluate(t=>window.render(t),t)}
  await p.screenshot({path:`${out}/${String(k).padStart(5,'0')}.jpg`,type:'jpeg',quality:90})}
 await b.close()})();
