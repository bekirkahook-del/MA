// Day in the life: first-year strategy consultant (Maya, fictional). PS2 style.
import {A,THREE,person,pose,el,anchor,ease,camMove,bub,popIn,fadeIn,desk,endCard,endFrame} from './common.js';
import {CO,bullpen,bp,tex,clock,stamp,boss,nameTag,wallScreen,sign} from './dlcommon.js';
const MAYA={shirt:'#f4f4f4',suit:'#22304f',sleeve:'#22304f',pants:'#22304f',hairStyle:'long',hair:'#1a1a1a',girl:true,skin:'#c98b63'};
const PARTNER={shirt:'#f4f4f4',suit:'#3a3a3a',sleeve:'#3a3a3a',pants:'#3a3a3a',tie:'#6b2a8a',hair:'#bdbdbd',skin:'#e8b996'};
const CLIENT={shirt:'#9fc5e8',sleeve:'#9fc5e8',pants:'#4a4a4a',hair:'#5a3a22',skin:'#f0c09a'};
const travelers=(n,z,mode='walk')=>[...Array(n).keys()].map(i=>{const p=person(Object.assign({},CO(i),{prop:'briefcase'}));p.g.position.set(-3+6*i/(n-1),0,z+(i%2)*0.8);p.g.rotation.y=i%2?Math.PI/2:-Math.PI/2;p.mode=mode;A.scene.add(p.g);return p});
const chairs=(z)=>{for(let i=-3;i<=3;i++){A.box(0.6,0.08,0.6,'#3a4a6b',i*0.75,0.5,z);A.box(0.6,0.6,0.08,'#3a4a6b',i*0.75,0.8,z-0.28)}};
const stickies=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);const c=['#ffe066','#ff9fb2','#9fe0ff','#b8f2a0'];for(let i=0;i<40;i++){g.fillStyle=c[i%4];g.fillRect(30+(i%8)*122,30+Math.floor(i/8)*114,100,90);g.fillStyle='#333';g.fillRect(42+(i%8)*122,55+Math.floor(i/8)*114,70,6);g.fillRect(42+(i%8)*122,72+Math.floor(i/8)*114,50,6)}});
const tree=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.strokeStyle='#13203B';g.lineWidth=5;g.font='bold 32px DejaVu Sans';g.fillStyle='#13203B';
  const box=(x,y,t)=>{g.strokeRect(x-110,y-36,220,64);g.fillText(t,x-g.measureText(t).width/2,y+8)};box(512,70,'Profit down');
  [[256,'Revenue'],[768,'Costs']].forEach(([x,t])=>{g.beginPath();g.moveTo(512,104);g.lineTo(x,200);g.stroke();box(x,236,t)});
  [[128,'Price'],[384,'Volume'],[640,'Fixed'],[896,'Variable']].forEach(([x,t],i)=>{g.beginPath();g.moveTo(i<2?256:768,270);g.lineTo(x,390);g.stroke();box(x,426,t)});g.fillStyle='#16a06a';g.font='bold 40px DejaVu Sans';g.fillText('MECE ✓',820,580)});
const deck=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#0b2a5b';g.fillRect(0,0,w,70);g.fillStyle='#fff';g.font='bold 32px DejaVu Sans';g.fillText('Recommendation: 3 levers, $40M',20,47);g.fillStyle='#13203B';g.font='28px DejaVu Sans';['1. Reprice the top 20 SKUs','2. Consolidate 3 warehouses','3. Renegotiate freight'].forEach((t,i)=>g.fillText(t,40,170+i*90));g.fillStyle='#7a869a';g.font='24px DejaVu Sans';g.fillText('slide 37 of 40',w-200,h-24)});
window.SHOTS=[
 /* 1 intro at the airport */
 {setup(s){A.room('#cfd8e6','#8c95a8');sign('DEPARTURES',{bg:'#0b2a5b',size:100,y:4.3});s.M=person(Object.assign({},MAYA,{expr:'happy',prop:'briefcase'}));s.M.g.position.set(0,0,1.0);A.scene.add(s.M.g);s.tr=travelers(5,-0.6)},
  frame(s,lt,D){pose(s.M,lt,'idle');s.tr.forEach((p,i)=>{pose(p,lt+i,'walk');p.g.position.x+=(i%2?0.012:-0.012)});camMove([0,1.9,6.6],[0,1.7,5.4],[0,1.3,0.5],[0,1.4,0.5],lt/D);nameTag(s,s.M,'MAYA','1st-year consultant',lt)}},
 /* 2 Monday 5 AM gate */
 {setup(s){A.room('#1d2436','#3a4256');sign('GATE B12 · 6:00 AM',{bg:'#111',fg:'#f6c84c',w:4.4,size:80});chairs(0.4);
   s.ps=[-2,-1,1,2].map((x,i)=>{const p=person(Object.assign({},CO(i+2),{expr:'neutral'}));p.g.position.set(x*0.75,0,0.55);p.g.rotation.y=Math.PI;p.mode='sleep';A.scene.add(p.g);return p});
   s.M=person(Object.assign({},MAYA,{expr:'worried'}));s.M.g.position.set(0,0,0.55);s.M.g.rotation.y=Math.PI;A.scene.add(s.M.g);s.c=el('chip','✈️ Flight to the client',{left:'270px',top:'1180px',background:'#2448D8',fontSize:'52px'})},
  frame(s,lt,D){s.ps.forEach((p,i)=>pose(p,lt+i,'sleep'));pose(s.M,lt,'sit');s.M.armR.rotation.x=-1.6;camMove([0,2.2,-3.6],[0,2.0,-2.8],[0,1.2,0.5],[0,1.25,0.5],lt/D);clock(s,'MON 5:00 AM',lt);popIn(s.c,lt,0.6)}},
 /* 3 team room, sticky notes */
 {setup(s){A.room('#e8e3d4','#8c7a5c');wallScreen(stickies);A.box(3.2,0.1,1.4,'#5b3a26',0,0.85,0.6);
   s.tm=[[-1.1,-0.2,0],[1.1,-0.2,0],[-1.1,1.4,Math.PI],[1.1,1.4,Math.PI]].map(([x,z,r],i)=>{const p=person(i===0?Object.assign({},MAYA,{expr:'happy'}):CO(i));p.g.position.set(x,0,z);p.g.rotation.y=r;p.mode=i%2?'sittalk':'sit';A.scene.add(p.g);return p});
   s.c=el('chip','4 consultants · 1 whiteboard',{left:'200px',top:'1180px',background:'#7b4bd6',fontSize:'50px'})},
  frame(s,lt,D){s.tm.forEach((p,i)=>pose(p,lt+i,p.mode));camMove([0,3.0,6.6],[0,2.8,5.6],[0,2.0,-0.6],[0,2.1,-0.6],lt/D);clock(s,'9:00 AM',lt);popIn(s.c,lt,0.6)}},
 /* 4 client interview */
 {setup(s){A.room('#c9d3e6','#8c95a8');A.box(1.6,0.1,1.0,'#5b3a26',0,0.85,0.3);s.M=person(Object.assign({},MAYA,{expr:'neutral'}));s.M.g.position.set(-1.0,0,0.3);s.M.g.rotation.y=Math.PI/2;A.scene.add(s.M.g);
   s.C=person(Object.assign({},CLIENT,{expr:'worried'}));s.C.g.position.set(1.0,0,0.3);s.C.g.rotation.y=-Math.PI/2;A.scene.add(s.C.g);s.b=el('bub','Walk me through your process?');s.c=el('chip','Client interview #6 today',{left:'250px',top:'1180px',background:'#16a06a',fontSize:'50px'})},
  frame(s,lt,D){pose(s.M,lt,'sittalk');pose(s.C,lt+1,'sit');camMove([0,2.4,5.4],[0,2.2,4.6],[0,1.4,0.3],[0,1.5,0.3],lt/D);clock(s,'11:00 AM',lt);bub(s,s.M,2.0);fadeIn(s.b,lt,0.3);popIn(s.c,lt,D*0.6)}},
 /* 5 issue tree */
 {setup(s){A.room('#e8e3d4','#8c7a5c');wallScreen(tree);s.M=person(Object.assign({},MAYA,{expr:'happy'}));s.M.g.position.set(-1.5,0,-0.6);s.M.g.rotation.y=0.4;A.scene.add(s.M.g);s.tm=[0,1].map(i=>{const p=person(CO(i+1));p.g.position.set(1.0+i*0.9,0,1.0);p.g.rotation.y=Math.PI*0.9;A.scene.add(p.g);return p})},
  frame(s,lt,D){pose(s.M,lt,'talk');s.M.armR.rotation.x=-1.4;s.tm.forEach((p,i)=>pose(p,lt+i,'idle'));camMove([0.4,2.8,6.8],[0.3,2.7,5.8],[0,2.4,-1],[0,2.5,-1],lt/D);clock(s,'1:00 PM',lt)}},
 /* 6 partner: can this be one slide */
 {setup(s){s.t=deck;Object.assign(s,desk(MAYA,s.t,'type',{expr:'shock'}));s.Pa=boss(PARTNER,-1.3,1.4,-Math.PI*0.8);s.b=el('bub','Can this be one slide?')},
  frame(s,lt,D){pose(s.P,lt,lt>D*0.5?'freeze':'type');pose(s.Pa,lt,'talk');camMove([-2.2,2.6,4.8],[-1.8,2.5,4.0],[-0.4,1.8,0.2],[-0.4,1.9,0.2],lt/D);clock(s,'4:00 PM',lt);bub(s,s.Pa,2.1);fadeIn(s.b,lt,0.3);stamp(s,'40→1','#ff4d5e',lt,D*0.5,140,1250)}},
 /* 7 team dinner */
 {setup(s){A.cafe();A.box(2.4,0.08,1.2,'#3b2416',0,0.85,0.4);s.tm=[[-0.8,-0.3,0],[0.8,-0.3,0],[-0.8,1.1,Math.PI],[0.8,1.1,Math.PI]].map(([x,z,r],i)=>{const p=person(i===0?Object.assign({},MAYA,{expr:'happy'}):Object.assign({},CO(i+2),{expr:'happy'}));p.g.position.set(x,0,z);p.g.rotation.y=r;A.scene.add(p.g);return p});
   s.c=el('chip','🍝 Team dinner → back to the deck',{left:'120px',top:'1180px',background:'#6b4a32',fontSize:'48px'})},
  frame(s,lt,D){s.tm.forEach((p,i)=>pose(p,lt+i,i%2?'sittalk':'sit'));camMove([2.4,2.8,5.4],[2.0,2.6,4.6],[0,1.3,0.4],[0,1.4,0.4],lt/D);clock(s,'7:00 PM',lt,'#1b1f3a');popIn(s.c,lt,0.6)}},
 /* 8 hotel room */
 {setup(s){A.room('#4a3b5c','#5a4a3a');A.box(2.0,0.5,1.4,'#e9e4d8',2.0,0.25,0.2);A.box(2.0,0.12,1.45,'#8a3b5c',2.0,0.55,0.2);Object.assign(s,desk(MAYA,deck,'type',{expr:'worried'}));s.c=el('chip','🏨 Hotel points: 48,000',{left:'230px',top:'1180px',background:'#c9a227',fontSize:'52px'})},
  frame(s,lt,D){pose(s.P,lt,'type');camMove([3.2,3.0,5.2],[2.6,2.8,4.4],[0.4,1.3,0],[0.4,1.4,0],lt/D);clock(s,'11:00 PM',lt,'#1b1f3a');popIn(s.c,lt,D*0.5)}},
 /* 9 Thursday flight home */
 {setup(s){A.room('#cfd8e6','#8c95a8');sign('BOARDING · HOME',{bg:'#16a06a',w:4.2,size:90});s.M=person(Object.assign({},MAYA,{expr:'happy',prop:'briefcase'}));s.M.g.position.set(0,0,1.0);s.M.g.rotation.y=Math.PI;A.scene.add(s.M.g);s.tr=travelers(5,-0.4);
   s.c=el('chip','Friday: office… or couch 🛋️',{left:'200px',top:'1180px',background:'#2448D8',fontSize:'50px'})},
  frame(s,lt,D){pose(s.M,lt,'walk');s.M.g.position.z=1.0-lt*0.25;s.tr.forEach((p,i)=>pose(p,lt+i,'walk'));camMove([0,2.0,6.6],[0,1.9,5.6],[0,1.4,0],[0,1.5,0],lt/D);clock(s,'THU 7:00 PM',lt);popIn(s.c,lt,D*0.5)}},
 {setup(s){endCard(s,'Maya is')},frame:endFrame}
];
