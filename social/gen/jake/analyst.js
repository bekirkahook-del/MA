// Day in the life of a first-year IB analyst (Jake, fictional). PS2 style.
import {A,THREE,cam,person,pose,el,anchor,ease,back,JAKE,camMove,bub,popIn,fadeIn,desk,endCard,endFrame} from './common.js';
const AN=Object.assign({},JAKE,{shirt:'#f4f4f4',suit:'#1d2433',sleeve:'#f4f4f4',tie:'#2448D8'}); // analyst: white shirt, sleeves rolled, tie
const VP={shirt:'#dfe8f5',suit:'#2b2f3a',sleeve:'#2b2f3a',pants:'#2b2f3a',tie:'#8a1c1c',hair:'#2a2a2a',skin:'#d9a882'};
const MD={shirt:'#f4f4f4',suit:'#111827',sleeve:'#111827',pants:'#111827',tie:'#c9a227',hairStyle:'bald',hair:'#9a9a9a',skin:'#e8b996'};
const tex=(draw)=>{const cv=document.createElement('canvas');cv.width=1024;cv.height=614;const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.cv=cv;t.draw=()=>{draw(cv.getContext('2d'),1024,614);t.needsUpdate=true};return t};
const inbox=n=>tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#0b3b8c';g.fillRect(0,0,w,70);g.fillStyle='#fff';g.font='bold 34px DejaVu Sans';g.fillText('Inbox',30,47);g.fillText(n()+' unread',w-260,47);
  [['VP','RE: comps - need by noon'],['MD','pls turn'],['Associate','RE: RE: RE: deck v14'],['Staffer','New project: Falcon'],['VP','?'],['Compliance','Reminder: training']].forEach((r,i)=>{const y=125+i*80;g.fillStyle=i%2?'#f4f6fa':'#fff';g.fillRect(0,y-46,w,80);g.fillStyle='#13203B';g.font='bold 30px DejaVu Sans';g.fillText(r[0],30,y);g.font='28px DejaVu Sans';g.fillStyle='#4A5672';g.fillText(r[1],250,y);g.fillStyle='#2448D8';g.beginPath();g.arc(w-40,y-10,10,0,7);g.fill()})});
const comps=k=>tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#1d6f42';g.fillRect(0,0,w,60);g.fillStyle='#fff';g.font='bold 30px DejaVu Sans';g.fillText('Comps.xlsx',24,42);
  const cols=['Company','EV ($M)','EV/EBITDA','P/E'],rows=[['Peer A','12,400','11.2x','18.4x'],['Peer B','8,950','9.8x','15.1x'],['Peer C','21,300','13.5x','22.7x'],['Peer D','5,120','8.4x','13.9x'],['Median','10,675','10.5x','16.8x']];
  g.font='bold 28px DejaVu Sans Mono';cols.forEach((c,i)=>{g.fillStyle='#13203B';g.fillText(c,24+i*250,110)});
  const m=Math.floor(rows.length*k());rows.slice(0,m).forEach((r,j)=>{const y=170+j*70;g.fillStyle=j===4?'#fff2cc':'#fff';g.fillRect(10,y-40,w-20,60);g.strokeStyle='#d0d7e2';g.strokeRect(10,y-40,w-20,60);r.forEach((c,i)=>{g.fillStyle='#13203B';g.font=(j===4?'bold ':'')+'28px DejaVu Sans Mono';g.fillText(c,24+i*250,y)})})});
const slide=(v,red)=>tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#0b2a5b';g.fillRect(0,0,w,80);g.fillStyle='#fff';g.font='bold 34px DejaVu Sans';g.fillText('Project Falcon · Valuation summary',24,52);
  g.fillStyle='#13203B';g.font='bold 30px DejaVu Sans';[['DCF','$42-48'],['Comps','$39-46'],['Precedents','$44-51']].forEach((r,i)=>{const y=170+i*110;g.fillText(r[0],40,y);g.fillStyle=red()?'#d62828':'#2448D8';g.fillRect(300,y-34,300+i*60,44);g.fillStyle='#13203B';g.fillText(r[1],660+i*60,y)});
  g.fillStyle='#7a869a';g.font='24px DejaVu Sans';g.fillText(v(),w-180,h-24)});
const sent=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#0b3b8c';g.fillRect(0,0,w,70);g.fillStyle='#fff';g.font='bold 34px DejaVu Sans';g.fillText('Sent  1:31 AM',30,47);g.fillStyle='#13203B';g.font='bold 34px DejaVu Sans';g.fillText('Falcon deck v23 (final)(final2).pdf',40,170);g.fillStyle='#16a06a';g.font='bold 40px DejaVu Sans';g.fillText('Sent ✓',40,250)});
function clock(s,t,lt,col='#0b0f18'){if(!s.ck)s.ck=el('chip',t,{left:'50%',top:'250px',background:col,fontSize:'64px',border:'4px solid #f6c84c',transform:'translateX(-50%)'});s.ck.style.opacity=ease(lt/0.2)}
function stamp(s,txt,color,lt,at,size=150,top=420){if(!s.st)s.st=el('stamp',txt,{left:'540px',top:top+'px',color,fontSize:size+'px',textShadow:'0 8px 0 rgba(0,0,0,.6)'});popIn(s.st,lt,at,0.35,'translate(-50%,-50%) rotate(-6deg)')}
const boss=(o,x,z,ry)=>{const p=person(o);p.g.position.set(x,0,z);p.g.rotation.y=ry;A.scene.add(p.g);return p};
const CO=i=>({shirt:['#f4f4f4','#cfe0ff','#ffe8cc','#e6f4ea','#f7d6e0','#ffffff'][i%6],sleeve:['#f4f4f4','#cfe0ff','#ffe8cc','#e6f4ea','#f7d6e0','#ffffff'][i%6],tie:['#8a1c1c',null,'#2a6b2a',null,'#1c3d8a',null][i%6],hair:['#111','#4a2f1d','#c9a46a','#2a1a12','#7a5a3a','#222'][i%6],skin:['#a8714a','#f0c09a','#e0b48c','#c98b63','#e8c3a0','#d9a882'][i%6],girl:i===2||i===4,hairStyle:i===2?'long':i===4?'bun':i===5?'bald':undefined,pants:'#2a2f45'});
/* the rest of the analyst bullpen: coworkers typing at their own desks on both sides */
function bullpen(night){const ps=[];[[-2.3,-0.6],[2.3,-0.6],[-2.5,1.9],[2.5,1.9],[-4.4,0.6],[4.4,0.6]].forEach(([x,z],i)=>{A.box(1.2,0.06,0.7,'#5b3a26',x,0.82,z-0.55);A.box(0.9,0.55,0.05,'#111',x,1.15,z-0.8);
  const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.82,0.46),new THREE.MeshBasicMaterial({color:night?'#9db4ff':'#e8eef8'}));sc.position.set(x,1.15,z-0.77);A.scene.add(sc);
  const p=person(Object.assign({},CO(i),{expr:night?'worried':'neutral'}));p.g.position.set(x,0,z);p.g.rotation.y=Math.PI;p.mode='type';A.scene.add(p.g);ps.push(p)});return ps}
const bp=(s,lt)=>(s.bp||[]).forEach((p,i)=>pose(p,lt+i*0.7,'type'));
window.SHOTS=[
 /* 1 intro: Jake in the office lobby, skyline */
 {setup(s){A.skyline();s.J=person(Object.assign({},AN,{expr:'happy',prop:'briefcase'}));A.scene.add(s.J.g);s.cr=[0,1,2,3].map(i=>{const p=person(Object.assign({},CO(i+1),{prop:'briefcase'}));p.g.position.set([-1.6,1.6,-0.9,0.9][i],0,[-1.2,-1.2,-2.4,-2.4][i]);A.scene.add(p.g);return p});s.l=el('label','JAKE<br><span style="font-size:36px;color:#f6c84c">1st-year IB analyst</span>',{textAlign:'center'})},
  frame(s,lt,D){pose(s.J,lt,'idle');s.cr.forEach((p,i)=>pose(p,lt+i,'walk'));camMove([0,1.8,6.5],[0,1.6,5.2],[0,1.3,0],[0,1.4,0],lt/D);const a=anchor(s.J,2.4);s.l.style.left=a.x+'px';s.l.style.top=a.y+'px';s.l.style.opacity=ease((lt-0.6)/0.3)}},
 /* 2 7:30 alarm, bed */
 {setup(s){A.room('#3a3f5a','#5a4a3a');A.box(2.2,0.5,1.2,'#e9e4d8',0,0.25,0.2);A.box(2.2,0.15,1.25,'#5b7bd6',0.1,0.55,0.2);A.box(0.5,0.18,0.9,'#fff',-0.85,0.62,0.2);
   s.J=person(Object.assign({},AN,{shirt:'#7a8db8',sleeve:'#7a8db8',suit:null,tie:null,expr:'shock'}));s.J.g.position.set(0,0.0,0.95);A.scene.add(s.J.g);
   s.al=el('label','⏰ BEEP BEEP',{fontSize:'70px',color:'#ff4d5e'});s.c=el('chip','Slept: 5.5 hrs',{left:'330px',top:'1180px',background:'#c62828',fontSize:'52px'})},
  frame(s,lt,D){pose(s.J,lt,'sit');s.J.armL.rotation.z=2.4+Math.sin(lt*14)*0.3;s.J.armR.rotation.z=-2.4-Math.sin(lt*14)*0.3;camMove([0.3,2.0,4.6],[0.2,1.9,3.8],[0,1.2,0.6],[0,1.25,0.6],lt/D);clock(s,'7:30 AM',lt);s.al.style.left=(540+Math.sin(lt*40)*8)+'px';s.al.style.top='560px';s.al.style.opacity=lt<D*0.6?1:0;popIn(s.c,lt,D*0.55)}},
 /* 3 coffee + inbox */
 {setup(s){s.t=inbox(()=>s.n||0);Object.assign(s,desk(AN,s.t,'sit'));s.bp=bullpen(0);const cup=A.box(0.12,0.18,0.12,'#f4f4f4',0,-0.75,0.12,s.P.armR);s.c=el('chip','☕ Coffee #1',{left:'360px',top:'1180px',background:'#6b4a32',fontSize:'52px'})},
  frame(s,lt,D){s.n=Math.min(47,Math.round(47*ease(lt/(D*0.7))));s.t.draw();pose(s.P,lt,'sit');s.P.armR.rotation.x=-1.6+Math.sin(lt*2)*0.1;camMove([1.4,2.6,4.2],[1.0,2.4,3.3],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);bp(s,lt);clock(s,'8:45 AM',lt);popIn(s.c,lt,0.5)}},
 /* 4 VP needs comps by noon */
 {setup(s){s.t=comps(()=>s.k||0);Object.assign(s,desk(AN,s.t,'type',{expr:'worried'}));s.bp=bullpen(0);s.V=boss(VP,1.3,1.4,Math.PI*0.8);s.b=el('bub','Comps by noon.');s.c=el('chip','"Noon" = 11:00',{left:'340px',top:'1180px',background:'#c62828',fontSize:'54px'})},
  frame(s,lt,D){s.k=ease((lt-0.8)/(D*0.7));s.t.draw();pose(s.P,lt,'type');pose(s.V,lt,'talk');camMove([2.2,2.6,4.8],[1.8,2.5,4.0],[0.4,1.8,0.2],[0.4,1.9,0.2],lt/D);bp(s,lt);clock(s,'9:30 AM',lt);bub(s,s.V,2.1);fadeIn(s.b,lt,0.3);popIn(s.c,lt,D*0.6)}},
 /* 5 lunch at desk */
 {setup(s){s.t=comps(()=>1);Object.assign(s,desk(AN,s.t,'type'));s.bp=bullpen(0);A.box(0.5,0.12,0.36,'#e9d6b0',0.75,0.82,0.15);A.box(0.46,0.04,0.32,'#c0392b',0.75,0.9,0.15);s.c=el('chip','🥡 Lunch at desk: day 31',{left:'230px',top:'1180px',background:'#7b4bd6',fontSize:'50px'})},
  frame(s,lt,D){s.t.draw();pose(s.P,lt,'type');camMove([3.6,3.4,6.4],[3.0,3.1,5.4],[0.2,1.4,0],[0.2,1.5,0],lt/D);bp(s,lt);clock(s,'12:30 PM',lt);popIn(s.c,lt,0.5)}},
 /* 6 MD changes one number */
 {setup(s){s.red=false;s.v='v14';s.t=slide(()=>s.v,()=>s.red);Object.assign(s,desk(AN,s.t,'type',{expr:'shock'}));s.bp=bullpen(0);s.M=boss(MD,-1.3,1.4,-Math.PI*0.8);s.b=el('bub','Small change. Use $44.')},
  frame(s,lt,D){if(lt>D*0.45){s.red=true;s.v='v15 → v22'}s.t.draw();pose(s.P,lt,lt>D*0.45?'panic':'type');pose(s.M,lt,'talk');camMove([-2.2,2.6,4.8],[-1.8,2.5,4.0],[-0.4,1.8,0.2],[-0.4,1.9,0.2],lt/D);bp(s,lt);clock(s,'3:00 PM',lt);bub(s,s.M,2.1);fadeIn(s.b,lt,0.3);stamp(s,'EVERY SLIDE','#ff4d5e',lt,D*0.5,120,1250)}},
 /* 7 dinner on the bank, still at desk, dark window */
 {setup(s){s.t=slide(()=>'v22',()=>false);Object.assign(s,desk(AN,s.t,'type',{expr:'worried'}));s.bp=bullpen(1);A.box(0.5,0.12,0.36,'#2e2e2e',-0.75,0.82,0.15);s.c=el('chip','🍜 Dinner: on the bank',{left:'250px',top:'1180px',background:'#16a06a',fontSize:'52px'})},
  frame(s,lt,D){s.t.draw();pose(s.P,lt,'type');camMove([-3.6,3.4,6.4],[-3.0,3.1,5.4],[-0.2,1.4,0],[-0.2,1.5,0],lt/D);bp(s,lt);clock(s,'7:00 PM',lt,'#1b1f3a');popIn(s.c,lt,0.5)}},
 /* 8 11 PM turn comments, due 8 AM */
 {setup(s){s.t=slide(()=>'v23',()=>false);Object.assign(s,desk(AN,s.t,'type',{expr:'worried'}));s.bp=bullpen(1);s.c=el('chip','Due: 8:00 AM',{left:'360px',top:'1180px',background:'#c62828',fontSize:'56px'});s.z=el('label','💀',{fontSize:'80px'})},
  frame(s,lt,D){s.t.draw();pose(s.P,lt,'type');camMove([0,4.2,7.6],[0,3.8,6.6],[0,1.2,0],[0,1.3,0],lt/D);bp(s,lt);clock(s,'11:00 PM',lt,'#1b1f3a');popIn(s.c,lt,0.5);const a=anchor(s.P,1.9);s.z.style.left=(a.x+90)+'px';s.z.style.top=(a.y-60-Math.sin(lt*2)*15)+'px';s.z.style.opacity=ease((lt-D*0.5)/0.3)}},
 /* 9 1:30 AM send, VP replies thx */
 {setup(s){Object.assign(s,desk(AN,sent,'sit',{expr:'happy'}));sent.draw();s.P.g.visible=false;s.r=el('card','<div style="padding:22px 30px;font-family:DejaVu Sans"><div style="font-size:28px;color:#4A5672;font-weight:700">VP · 1:32 AM</div><div style="font-size:84px;font-weight:900;color:#13203B">thx</div></div>',{left:'330px',top:'560px',width:'420px',transform:'rotate(-3deg)'})},
  frame(s,lt,D){camMove([0,2.3,3.4],[0,2.2,2.5],[0,2.1,-0.3],[0,2.15,-0.3],Math.min(1,lt/(D*0.5)));clock(s,'1:30 AM',lt,'#1b1f3a');popIn(s.r,lt,D*0.55,0.35,'rotate(-3deg)')}},
 /* 10 end */
 {setup(s){endCard(s,'Jake is')},frame:endFrame}
];
