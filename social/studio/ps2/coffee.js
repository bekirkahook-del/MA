import {A,THREE,cam,person,pose,el,anchor,ease,back,JAKE,camMove,bub,popIn,fadeIn,desk,deskCam,screenCam,endCard,endFrame} from './common.js';
const ALUM={shirt:'#f4f4f4',suit:'#22304f',sleeve:'#22304f',pants:'#22304f',hairStyle:'long',hair:'#2a1a12',girl:true,skin:'#c98b63'};
function mailTex(){const cv=document.createElement('canvas');cv.width=1024;cv.height=614;const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.cv=cv;return t}
function drawSent(t,n){const g=t.cv.getContext('2d'),w=1024,h=614;g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#2448D8';g.fillRect(0,0,w,70);g.fillStyle='#fff';g.font='bold 34px DejaVu Sans';g.fillText('Sent mail',30,47);g.fillText(n+' / 40',w-180,47);
  for(let i=0;i<Math.min(n,7);i++){const y=110+i*72;g.fillStyle=i%2?'#f4f6fa':'#fff';g.fillRect(0,y-40,w,72);g.fillStyle='#13203B';g.font='bold 28px DejaVu Sans';g.fillText('Alum #'+(n-i),30,y);g.fillStyle='#4A5672';g.font='26px DejaVu Sans';g.fillText('Quick question from a fellow student',260,y);g.fillStyle='#16a06a';g.fillText('Sent ✓',w-140,y)}
  t.needsUpdate=true}
function drawInbox(t,k){const g=t.cv.getContext('2d'),w=1024,h=614;g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#2448D8';g.fillRect(0,0,w,70);g.fillStyle='#fff';g.font='bold 34px DejaVu Sans';g.fillText('Inbox',30,47);
  const rows=[['Banker #1','Sorry, swamped this month.'],['Mom ❤️','SO proud of you sweetie!! Call me'],['Banker #2','Tomorrow at 9 AM works.']];
  rows.forEach((r,i)=>{if(k<=i)return;const y=130+i*110;g.fillStyle=i===1?'#fff0f3':i===2?'#e8efff':'#fff';g.fillRect(0,y-55,w,104);g.fillStyle='#13203B';g.font='bold 34px DejaVu Sans';g.fillText(r[0],30,y);g.fillStyle='#4A5672';g.font='28px DejaVu Sans';g.fillText(r[1],30,y+38);g.fillStyle='#2448D8';g.beginPath();g.arc(w-50,y-8,12,0,7);g.fill()});
  t.needsUpdate=true}
function standJake(s,expr,wall){A.room(wall);const P=person(Object.assign({},JAKE,{expr}));P.g.position.set(0,0,0.6);A.scene.add(P.g);s.P=P}
function cafeDuo(s){A.cafe();s.J=person(JAKE);s.Al=person(ALUM);s.J.g.position.set(-0.95,0,0.1);s.J.g.rotation.y=Math.PI/2;s.Al.g.position.set(0.95,0,0.1);s.Al.g.rotation.y=-Math.PI/2;A.scene.add(s.J.g);A.scene.add(s.Al.g);[-0.95,0.95].forEach(x=>A.box(0.6,0.08,0.6,'#3b2416',x,0.58,0.1))}
window.SHOTS=[
 {setup(s){standJake(s,'worried');const jb=A.box(0.22,0.3,0.14,'#f2c14e',0,-0.75,0.15,s.P.armR);s.b=el('bub','Coffee?? I drink apple juice. 🧃')},
  frame(s,lt,D){pose(s.P,lt,'idle');s.P.armR.rotation.x=-1.3;camMove([0,2.0,6.5],[0,1.8,5.0],[0,1.5,0],[0,1.5,0],lt/D);bub(s,s.P);fadeIn(s.b,lt,0.9)}},
 {setup(s){s.t=new THREE.Texture();s.t=mailTex();Object.assign(s,desk(JAKE,s.t,'type'));s.c=el('chip','',{left:'330px',top:'1180px',fontSize:'56px'})},
  frame(s,lt,D){pose(s.P,lt,'type');deskCam(lt,D);const n=Math.max(1,Math.min(40,Math.round(1+39*ease((lt-0.2)/(D-0.5)))));drawSent(s.t,n);s.c.textContent='Emails sent: '+n}},
 {setup(s){s.t=mailTex();Object.assign(s,desk(JAKE,s.t,'sit'));s.c=el('chip','',{left:'250px',top:'1180px',fontSize:'52px',background:'#16a06a'})},
  frame(s,lt,D){pose(s.P,lt,'sit');deskCam(lt,D,-1);const k=Math.max(0,Math.min(3,Math.floor((lt-0.15)/0.5)+1));drawInbox(s.t,k);s.c.textContent=k>=2?'Replies: 3 (one is Mom)':'Replies: '+k}},
 {setup(s){standJake(s,'happy');s.card=el('card','<div style="padding:30px 40px;text-align:center"><div style="font-size:30px;color:#2448D8;font-weight:800;letter-spacing:.1em">TOMORROW</div><div style="font-size:88px;font-weight:900;margin:6px 0">9:00 AM</div><div style="font-size:40px;font-weight:700">☕ Coffee chat</div></div>',{left:'270px',top:'300px',width:'540px'})},
  frame(s,lt,D){pose(s.P,lt,lt>0.9?'cheer':'idle');camMove([0,1.9,6.6],[0,1.8,5.4],[0,1.4,0],[0,1.5,0],lt/D);popIn(s.card,lt,0.3)}},
 {setup(s){standJake(s,'shock','#e6c9c9');s.b=el('bub','What do I even SAY???');s.sw=[0,1,2].map(()=>el('label','💧',{fontSize:'56px'}))},
  frame(s,lt,D){pose(s.P,lt,'panic');const sh=Math.sin(lt*30)*0.03;camMove([sh,1.9,5.2],[sh,1.8,4.2],[0,1.6,0],[0,1.6,0],lt/D);bub(s,s.P);const a=anchor(s.P,2.05);
   s.sw.forEach((e,i)=>{const t=(lt*1.4+i*0.33)%1;e.style.left=(a.x+(i-1)*120)+'px';e.style.top=(a.y+80+t*140)+'px';e.style.opacity=1-t})}},
 {setup(s){Object.assign(s,desk(JAKE,A.img('coffee.png'),'sittalk'));s.c=el('chip','📞 AI banker on the line',{left:'230px',top:'1180px',fontSize:'50px',background:'#16a06a'})},
  frame(s,lt,D){pose(s.P,lt,'sittalk');camMove([1.2,2.6,4.2],[0.5,2.3,2.4],[0,1.9,-0.3],[0,2.1,-0.3],lt/D);fadeIn(s.c,lt,0.8)}},
 {setup(s){Object.assign(s,desk(JAKE,A.img('coffee.png'),'sittalk'));s.b=el('bub','So... how much do you make?');s.sc=el('card','<div style="padding:22px 36px;text-align:center"><div style="font-size:28px;font-weight:800;color:#4A5672;letter-spacing:.1em">RAPPORT</div><div style="font-size:110px;font-weight:900;color:#d62828">0/10</div></div>',{left:'330px',top:'280px',width:'420px'})},
  frame(s,lt,D){s.P.expr=lt>D*0.55?'shock':'happy';pose(s.P,lt,lt<D*0.5?'sittalk':'sit');camMove([-1.3,2.6,4.4],[-1.0,2.4,3.6],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);bub(s,s.P,1.75);fadeIn(s.b,lt,0.2);popIn(s.sc,lt,D*0.55)}},
 {setup(s){cafeDuo(s);s.J.expr='happy';s.qs=['What does your group work on?','What was your first deal like?'];s.b=el('bub','')},
  frame(s,lt,D){pose(s.J,lt,'sittalk');pose(s.Al,lt+1,'sit');camMove([0,2.4,7.0],[0,2.2,5.8],[0,1.3,0],[0,1.4,0],lt/D);s.b.textContent=s.qs[Math.min(1,Math.floor(lt/(D/2)))];bub(s,s.J,2.0)}},
 {setup(s){cafeDuo(s);s.Al.expr='happy';s.b=el('bub','Send me your resume.')},
  frame(s,lt,D){s.J.expr=lt>1.0?'happy':'shock';pose(s.J,lt,'sit');if(lt>1.0){s.J.armL.rotation.z=2.6;s.J.armR.rotation.z=-2.6}pose(s.Al,lt,'sittalk');camMove([1.0,2.3,6.2],[0.7,2.1,5.0],[0.3,1.4,0],[0.3,1.4,0],lt/D);bub(s,s.Al,2.0);fadeIn(s.b,lt,0.2)}},
 {setup(s){Object.assign(s,desk(JAKE,A.img('email.png'),'type',{expr:'happy'}));s.c=el('chip','Sent ✓ in 47 min',{left:'300px',top:'1180px',fontSize:'52px',background:'#16a06a'});s.n=el('chip','"Hi Sarah" ✓ spelled right',{left:'250px',top:'330px',fontSize:'46px',background:'#7b4bd6'})},
  frame(s,lt,D){pose(s.P,lt,'type');deskCam(lt,D);popIn(s.c,lt,0.5);popIn(s.n,lt,D*0.55)}},
 {setup(s){endCard(s,'Jake is')},frame:endFrame}
];
