// Jensen Huang is back (Nov 23, 2026). PS2-style illustration of reported, sourced events. Real people shown as cartoon characters.
import {A,THREE,cam,person,pose,el,anchor,ease,back,camMove,bub,popIn,fadeIn,desk} from './common.js';
const JENSEN={shirt:'#161616',suit:'#0c0c0c',sleeve:'#0c0c0c',pants:'#1a1a1a',hair:'#6f6f6f',skin:'#e2b48c'}; // black leather jacket, grey hair
const KRESS={shirt:'#f4f4f4',suit:'#3b4a6b',sleeve:'#3b4a6b',pants:'#3b4a6b',hairStyle:'long',hair:'#c9a46a',girl:true,skin:'#f0c9a6'};
const GOV={shirt:'#f4f4f4',suit:'#22304f',sleeve:'#22304f',pants:'#22304f',tie:'#b22234',hair:'#d9d9d9',skin:'#e8b996'};
const TRADER=(i)=>({shirt:['#7fb3ff','#ffffff','#ffd9a8','#c8f0c0','#f2b8c6'][i%5],tie:['#1c3d8a','#8a1c1c',null,'#2a6b2a',null][i%5],hair:['#2a1a12','#4a2f1d','#111','#7a5a3a','#222'][i%5],skin:['#e0b48c','#a8714a','#f0c09a','#c98b63','#e8c3a0'][i%5],girl:i===2||i===4,hairStyle:i===2?'long':i===4?'bun':undefined});
const GREEN='#76b900';
/* stock chart texture: draws the NVDA close path up to fraction k (and optionally the rebound) */
const PX=[239.24,230.48,226.32,221.3,214.13,216.47,212.21,210.96,216,215.38,204.64,202.06,206.69,200.13,181.6,186.64,178.67,168.89,173.73,166.19,162.85,156.14,155.46,150.96,145.98,125.53];
function chartTex(){const cv=document.createElement('canvas');cv.width=1024;cv.height=614;const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.cv=cv;return t}
function drawChart(t,k,up){const g=t.cv.getContext('2d'),w=1024,h=614;g.fillStyle='#05070d';g.fillRect(0,0,w,h);
  g.fillStyle='#fff';g.font='bold 46px DejaVu Sans';g.fillText('NVDA',30,62);g.font='28px DejaVu Sans';g.fillStyle='#9fb0c3';g.fillText(up?'Oct 6 → Nov 23':'Oct 6 → Nov 20 close',170,60);
  const pts=PX.concat(up?[up]:[]);const n=pts.length,x0=40,x1=980,y0=100,y1=580,lo=110,hi=250;const X=i=>x0+(x1-x0)*i/(PX.length);const Y=v=>y1-(v-lo)/(hi-lo)*(y1-y0);
  const m=Math.max(2,Math.floor(PX.length*Math.min(1,k)));g.lineWidth=10;g.lineJoin='round';g.strokeStyle='#ff4d5e';g.beginPath();for(let i=0;i<m;i++){i?g.lineTo(X(i),Y(pts[i])):g.moveTo(X(i),Y(pts[i]))}g.stroke();
  if(up&&k>=1){g.strokeStyle=GREEN;g.beginPath();g.moveTo(X(PX.length-1),Y(PX[PX.length-1]));g.lineTo(X(PX.length),Y(up));g.stroke();g.fillStyle=GREEN;g.font='bold 44px DejaVu Sans';g.fillText('$'+up.toFixed(2),X(PX.length)-210,Y(up)-24)}
  else if(k>=1){g.fillStyle='#ff4d5e';g.font='bold 44px DejaVu Sans';g.fillText('$125.53',X(PX.length-1)-190,Y(125.53)+8)}
  t.needsUpdate=true}
function screenWall(tex,x=0,y=3.4,z=-2.05,w=4.6,h=2.75){const fr=A.box(w+0.25,h+0.25,0.12,'#111',x,y,z-0.08);const s=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));s.position.set(x,y,z);A.scene.add(s);return s}
function stamp(s,txt,color,lt,at,size=190,top=330){if(!s.st)s.st=el('stamp',txt,{left:'540px',top:top+'px',color,fontSize:size+'px',textShadow:'0 8px 0 rgba(0,0,0,.6)'});popIn(s.st,lt,at,0.35,'translate(-50%,-50%) rotate(-6deg)')}
function podium(x=0,z=0.3){A.box(0.9,1.15,0.6,'#2b2f3a',x,0.58,z);A.box(1.0,0.08,0.7,'#3a4050',x,1.18,z);A.box(0.06,0.4,0.06,'#999',x,1.4,z+0.1)}
function crowd(n,z,spread=4.4,mode='idle'){return [...Array(n).keys()].map(i=>{const p=person(TRADER(i));p.g.position.set(-spread/2+spread*i/(n-1),0,z+(i%2)*0.5);p.g.rotation.y=Math.PI;p.mode=mode;A.scene.add(p.g);return p})}
const BIG=window.NV_PRICE||170.54,PCT=window.NV_PCT||'35.9';
window.SHOTS=[
 /* 1 hook: Jensen walks back into HQ, staff cheer */
 {setup(s){A.room('#1d2a12','#2a2f36');const sign=A.textPlane(['NVIDIA'],{w:5,h:1.1,bg:'#0b0f08',fg:GREEN,font:'bold 150px DejaVu Sans'});sign.position.set(0,3.3,-2.12);A.scene.add(sign);
   s.J=person(Object.assign({},JENSEN,{expr:'happy'}));s.J.g.position.set(0,0,1.2);A.scene.add(s.J.g);s.c=crowd(4,-1.6,5.2,'cheer');s.c.forEach(p=>p.g.rotation.y=0);
   s.chip=el('chip',`NVDA ▲ ${PCT}% today`,{left:'300px',top:'1180px',background:'#2f7d1a',fontSize:'56px'})},
  frame(s,lt,D){pose(s.J,lt,'walk');s.J.g.position.z=2.2-Math.min(1,lt/D)*1.6;s.c.forEach((p,i)=>pose(p,lt+i*0.3,'cheer'));camMove([0,2.3,8.2],[0,2.0,6.4],[0,1.6,0],[0,1.7,0],lt/D);stamp(s,"HE'S BACK",GREEN,lt,1.2,150,210);popIn(s.chip,lt,D*0.55)}},
 /* 2 Nov 8: apology at a podium */
 {setup(s){A.room('#2a3350','#3a4256');podium();s.J=person(Object.assign({},JENSEN,{expr:'worried'}));s.J.g.position.set(0,0,-0.35);A.scene.add(s.J.g);
   s.b=el('bub','"I\'m sorry."');s.card=el('card','<div style="padding:22px 30px"><div style="font-size:30px;font-weight:800;color:#d62828;letter-spacing:.1em">NOV 8</div><div style="font-size:42px;font-weight:900;margin:6px 0">Admits affair, apologizes</div><div style="font-size:30px;color:#4A5672;line-height:1.35">Board opens independent investigation into <b>reports</b> he was targeted by Chinese intelligence</div></div>',{left:'90px',top:'1080px',width:'900px'})},
  frame(s,lt,D){pose(s.J,lt,'talk');camMove([0.6,2.0,4.2],[0.3,1.95,3.3],[0,1.8,0],[0,1.85,0],lt/D);bub(s,s.J,2.15);fadeIn(s.b,lt,0.3);popIn(s.card,lt,D*0.35)}},
 /* 3 Nov 12: resigns, Kress steps in, stock -14% */
 {setup(s){A.room('#1d2a12','#2a2f36');s.J=person(Object.assign({},JENSEN,{expr:'worried',prop:'briefcase'}));s.J.g.position.set(-0.4,0,0.9);s.J.g.rotation.y=-Math.PI/2;A.scene.add(s.J.g);
   s.K=person(Object.assign({},KRESS,{expr:'neutral'}));s.K.g.position.set(0.8,0,0.1);A.scene.add(s.K.g);
   s.l=el('label','Colette Kress<br><span style="font-size:34px;color:#f6c84c">Interim CEO</span>',{textAlign:'center'});s.chip=el('chip','NVDA −14% intraday',{left:'340px',top:'1180px',background:'#c62828',fontSize:'52px'})},
  frame(s,lt,D){pose(s.J,lt,'walk');s.J.g.position.x=-0.4-lt*0.08;pose(s.K,lt,'idle');camMove([0,2.2,7.4],[0,2.0,6.4],[0.1,1.5,0],[0.1,1.5,0],lt/D);stamp(s,'RESIGNED','#ff4d5e',lt,0.5,170,300);
   const a=anchor(s.K,2.35);s.l.style.left=a.x+'px';s.l.style.top=a.y+'px';s.l.style.opacity=ease((lt-D*0.35)/0.3);popIn(s.chip,lt,D*0.7)}},
 /* 4 the slide: trading floor panic, chart crashes */
 {setup(s){A.room('#141a2b','#2a3040');s.tex=chartTex();screenWall(s.tex);s.c=crowd(5,1.4,4.8,'panic');s.c.forEach(p=>p.g.rotation.y=0);s.c.forEach(p=>p.expr='shock')},
  frame(s,lt,D){drawChart(s.tex,ease(lt/(D*0.7)));s.c.forEach((p,i)=>pose(p,lt+i*0.4,'panic'));camMove([0,2.6,9.4],[0,2.6,8.4],[0,2.4,-1],[0,2.5,-1],lt/D);stamp(s,'−48%','#ff4d5e',lt,D*0.7,230,1250)}},
 /* 5 why: the board decides */
 {setup(s){s.iv=A.interviewRoom();s.J=person(Object.assign({},JENSEN,{expr:'neutral'}));s.J.g.position.set(0,0,0.4);s.J.g.rotation.y=Math.PI;A.scene.add(s.J.g);
   s.b=el('bub','"Satisfied with his candor and ability to lead."');s.l=el('label','NVIDIA BOARD',{fontSize:'40px',color:'#f6c84c'})},
  frame(s,lt,D){s.iv.forEach((p,i)=>pose(p,lt+i,i===1?'sittalk':'sit'));pose(s.J,lt,'idle');camMove([0,2.4,7.4],[0,2.3,6.0],[0,1.6,-2.4],[0,1.6,-2.5],lt/D);bub(s,s.iv[1],2.0);fadeIn(s.b,lt,0.4);
   const a=anchor(s.iv[0],-0.25);s.l.style.left='540px';s.l.style.top=(a.y+170)+'px';s.l.style.opacity=ease(lt/0.4)}},
 /* 6 govt: input from senior levels of the U.S. government */
 {setup(s){A.room('#e8e3d4','#8c7a5c');const fl=A.textPlane(['U.S. GOVERNMENT'],{w:3.6,h:0.7,bg:'#1b2a4a',fg:'#fff',font:'bold 90px DejaVu Sans'});fl.position.set(0,3.7,-2.12);A.scene.add(fl);
   s.G=person(Object.assign({},GOV,{expr:'neutral'}));s.G.g.position.set(-0.9,0,0.2);A.scene.add(s.G.g);s.iv=[person({shirt:'#e9ecf2',suit:'#2b2f3a',sleeve:'#2b2f3a',tie:'#8a1c1c',hairStyle:'bald',hair:'#888',skin:'#d9a882'})];s.iv[0].g.position.set(1.0,0,0.2);s.iv[0].g.rotation.y=-0.5;A.scene.add(s.iv[0].g);
   s.card=el('card','<div style="padding:26px 34px;text-align:center"><div style="font-size:34px;font-weight:800;color:#4A5672">BOARD, AFTER U.S. GOVERNMENT INPUT</div><div style="font-size:62px;font-weight:900;color:#16a06a;margin-top:8px">"No national security risk"</div></div>',{left:'90px',top:'1110px',width:'900px'})},
  frame(s,lt,D){pose(s.G,lt,'talk');pose(s.iv[0],lt+1,'idle');camMove([0.3,2.1,5.6],[0.1,2.0,4.6],[0,1.6,0],[0,1.6,0],lt/D);popIn(s.card,lt,D*0.4)}},
 /* 7 strings attached */
 {setup(s){A.room('#2a3350','#3a4256');s.J=person(Object.assign({},JENSEN,{expr:'neutral'}));s.J.g.position.set(0,0,0.3);A.scene.add(s.J.g);
   s.k=[['🔍 Investigation continues','#2448D8',920],['🛡️ New national security &amp; export control committee','#7b4bd6',1050],['✅ Chief compliance officer search','#16a06a',1250]].map(([t,c,y])=>el('chip',t,{left:'70px',top:y+'px',background:c,fontSize:'44px',maxWidth:'900px'}))},
  frame(s,lt,D){pose(s.J,lt,'talk');camMove([-0.6,1.9,4.6],[-0.4,1.85,3.9],[0,1.5,0],[0,1.55,0],lt/D);s.k.forEach((e,i)=>popIn(e,lt,0.4+i*D*0.27))}},
 /* 8 market verdict: chart rebounds, traders cheer */
 {setup(s){A.room('#141a2b','#2a3040');s.tex=chartTex();screenWall(s.tex);s.c=crowd(5,1.4,4.8,'cheer');s.c.forEach(p=>{p.g.rotation.y=0;p.expr='happy'})},
  frame(s,lt,D){drawChart(s.tex,1,BIG);s.c.forEach((p,i)=>pose(p,lt+i*0.3,'cheer'));camMove([0,2.6,9.4],[0,2.6,8.2],[0,2.4,-1],[0,2.5,-1],lt/D);stamp(s,`+${PCT}%`,GREEN,lt,0.5,220,1250)}},
 /* 9 CTA */
 {setup(s){A.skyline();s.J=person(Object.assign({},JENSEN,{expr:'happy'}));A.scene.add(s.J.g);
   s.e=el('end',`<div style="font-family:DejaVu Sans;font-weight:900;font-size:70px;color:#fff;text-align:center;line-height:1.15">Smart move<br>or <span style="color:#ff4d5e">a risk they'll regret?</span></div><div class="t" style="margin-top:34px">COMMENT 👇</div><img src="qr.png"><div class="s">Illustration of reported events. Cartoon characters, AI voice.<br>Sources: NVIDIA release (Nov 23), Al Jazeera, Yahoo Finance (NVDA as of 10:21 AM ET). Not financial advice.</div>`);s.e.style.opacity=0},
  frame(s,lt,D){pose(s.J,lt,'fist');camMove([0,1.6,7],[0,1.5,6],[0,1.3,0],[0,1.3,0],lt/D);s.e.style.opacity=ease((lt-0.3)/0.4)}}
];
