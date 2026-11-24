const {chromium}=require("playwright"),fs=require("fs");const F=p=>"data:font/woff2;base64,"+fs.readFileSync("/home/claude/ma/social/gen/node_modules/@fontsource/"+p).toString("base64");
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1280,height:720}});
await p.setContent(`<style>@font-face{font-family:A;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}*{margin:0}body{width:1280px;height:720px;background:radial-gradient(900px 600px at 70% 40%,#3D6B00,transparent 70%),#05080F;font-family:A;color:#fff;overflow:hidden;position:relative}
.a{position:absolute;left:60px;top:70px;font-size:120px;line-height:.95;letter-spacing:-3px}.r{color:#FF4D4D}.g{color:#76B900}
.big{position:absolute;right:50px;bottom:40px;font-size:300px;color:#76B900;letter-spacing:-12px;text-shadow:0 10px 60px #000}.tag{position:absolute;left:64px;bottom:70px;font-size:54px;background:#76B900;color:#000;padding:8px 22px;border-radius:12px}</style>
<div class=a>CEO <span class=r>OUT.</span><br>CEO <span class=g>BACK.</span></div><div class=big>+30%</div><div class=tag>NVIDIA</div>`);
await p.waitForTimeout(200);await p.screenshot({path:"thumbnail.jpg",type:"jpeg",quality:92});await b.close()})();
