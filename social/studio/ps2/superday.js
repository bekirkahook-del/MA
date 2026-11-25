// Jake's first Superday (fictional). PS2 style.
import {A,THREE,person,pose,el,anchor,ease,JAKE,camMove,bub,popIn,fadeIn,desk,endCard,endFrame} from './common.js';
import {CO,tex,clock,stamp,boss,sign} from './dlcommon.js';
const SUIT=Object.assign({},JAKE,{shirt:'#f4f4f4',suit:'#1d2433',sleeve:'#1d2433',pants:'#1d2433',tie:'#2448D8'});
const GUARD={shirt:'#1b2a4a',sleeve:'#1b2a4a',pants:'#1b2a4a',hair:'#222',skin:'#a8714a'};
const AN={shirt:'#cfe0ff',sleeve:'#cfe0ff',pants:'#2a2f45',hair:'#4a2f1d',skin:'#f0c09a'};
const ASSOC={shirt:'#f4f4f4',suit:'#2b2f3a',sleeve:'#2b2f3a',pants:'#2b2f3a',tie:'#1c3d8a',hair:'#111',skin:'#c98b63',girl:true,hairStyle:'bun'};
const VP={shirt:'#dfe8f5',suit:'#2b2f3a',sleeve:'#2b2f3a',pants:'#2b2f3a',tie:'#8a1c1c',hair:'#2a2a2a',skin:'#d9a882'};
const MD={shirt:'#f4f4f4',suit:'#111827',sleeve:'#111827',pants:'#111827',tie:'#c9a227',hairStyle:'bald',hair:'#9a9a9a',skin:'#e8b996'};
/* interview table: interviewer on the far side, Jake on the near side, side camera */
function table(s,who,expr){A.room('#2a3350','#3a4256');A.box(2.2,0.1,1.1,'#5b3a26',0,0.85,0);
  s.I=person(Object.assign({},who,{expr:'neutral'}));s.I.g.position.set(0,0,-0.95);A.scene.add(s.I.g);
  s.J=person(Object.assign({},SUIT,{expr:expr||'neutral'}));s.J.g.position.set(0,0,0.95);s.J.g.rotation.y=Math.PI;A.scene.add(s.J.g)}
const tcam=(lt,D,v)=>v==='J'?camMove([-1.3,2.4,-1.9],[-1.0,2.3,-1.7],[0,1.55,0.95],[0,1.6,0.95],lt/D):camMove([1.3,2.4,3.3],[1.0,2.3,2.8],[0,1.55,-0.95],[0,1.6,-0.95],lt/D);
const mail=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#0b3b8c';g.fillRect(0,0,w,70);g.fillStyle='#fff';g.font='bold 34px DejaVu Sans';g.fillText('Inbox',30,47);
  g.fillStyle='#e8efff';g.fillRect(0,95,w,120);g.fillStyle='#13203B';g.font='bold 36px DejaVu Sans';g.fillText('Recruiting Team',30,145);g.font='bold 40px DejaVu Sans';g.fillStyle='#16a06a';g.fillText('Congratulations!',30,195);
  g.fillStyle='#4A5672';g.font='28px DejaVu Sans';g.fillText('We are pleased to extend you an offer...',30,280)});
window.SHOTS=[
 /* 1 intro */
 {setup(s){A.skyline();s.J=person(Object.assign({},SUIT,{expr:'worried',prop:'briefcase'}));A.scene.add(s.J.g);s.c=el('chip','4 interviews · 1 day',{left:'300px',top:'1180px',background:'#2448D8',fontSize:'54px'})},
  frame(s,lt,D){pose(s.J,lt,'idle');camMove([0,1.7,4.8],[0,1.75,2.5],[0,1.4,0],[0,1.62,0],lt/D);stamp(s,'SUPERDAY','#f6c84c',lt,0.6,150,330);popIn(s.c,lt,D*0.5)}},
 /* 2 lobby, security */
 {setup(s){A.room('#cfd8e6','#8c95a8');sign('RECEPTION',{bg:'#111',fg:'#f6c84c',size:100});A.box(2.4,1.0,0.7,'#5b3a26',1.4,0.5,-0.9);
   s.G=person(Object.assign({},GUARD,{expr:'neutral'}));s.G.g.position.set(1.4,0,-1.5);A.scene.add(s.G.g);s.J=person(Object.assign({},SUIT,{expr:'happy',prop:'briefcase'}));s.J.g.position.set(-0.9,0,0.6);s.J.g.rotation.y=0.5;A.scene.add(s.J.g);
   s.b=el('bub','You lost, kid?');s.c=el('chip','⏰ 40 min early',{left:'330px',top:'1180px',background:'#7b4bd6',fontSize:'54px'})},
  frame(s,lt,D){pose(s.G,lt,'talk');pose(s.J,lt,'idle');camMove([0,2.2,6.4],[0,2.0,5.4],[0.2,1.5,-0.4],[0.2,1.6,-0.4],lt/D);clock(s,'7:00 AM',lt);bub(s,s.G,2.1);fadeIn(s.b,lt,D*0.45);popIn(s.c,lt,0.5)}},
 /* 3 interview 1: DCF, nails it */
 {setup(s){table(s,AN,'happy');s.b=el('bub','Walk me through a DCF.')},
  frame(s,lt,D){pose(s.I,lt,lt<D*0.4?'sittalk':'sit');pose(s.J,lt,lt<D*0.4?'sit':'sittalk');tcam(lt,D,lt<D*0.4?'I':'J');clock(s,'INTERVIEW 1 · ANALYST',lt);bub(s,s.I,2.0);fadeIn(s.b,lt,0.2);s.b.style.opacity=lt<D*0.4?s.b.style.opacity:0;stamp(s,'NAILED IT ✓','#38d27a',lt,D*0.6,120,1250)}},
 /* 4 interview 2: pitch a stock, freezes */
 {setup(s){table(s,ASSOC,'shock');s.b=el('bub','Pitch me a stock.');s.sw=[0,1].map(()=>el('label','💧',{fontSize:'54px'}))},
  frame(s,lt,D){pose(s.I,lt,'sittalk');pose(s.J,lt,'freeze');tcam(lt,D,lt<D*0.35?'I':'J');clock(s,'INTERVIEW 2 · ASSOCIATE',lt);bub(s,s.I,2.0);fadeIn(s.b,lt,0.2);if(lt>D*0.35)s.b.style.opacity=0;
   const a=anchor(s.J,1.75);s.sw.forEach((e,i)=>{const t=(lt*1.3+i*0.5)%1;e.style.left=a.x+(i?50:-50)+'px';e.style.top=a.y+t*120+'px';e.style.opacity=lt>D*0.4?1-t:0});stamp(s,'…uh','#ff4d5e',lt,D*0.55,150,1250)}},
 /* 5 interview 3: why us */
 {setup(s){table(s,VP,'neutral');s.b=el('bub','Why us, and not the bank across the street?')},
  frame(s,lt,D){pose(s.I,lt,'sittalk');pose(s.J,lt,'sit');tcam(lt,D,'I');clock(s,'INTERVIEW 3 · VP',lt);bub(s,s.I,2.0);fadeIn(s.b,lt,0.2)}},
 /* 6 he prepped this one */
 {setup(s){table(s,VP,'happy');s.card=el('card','<div style="padding:22px 30px;font-family:DejaVu Sans"><div style="font-size:28px;color:#4A5672;font-weight:800">JAKE\'S ANSWER</div><div style="font-size:44px;font-weight:900;color:#13203B">"The deal you closed last month…"</div></div>',{left:'90px',top:'330px',width:'900px'})},
  frame(s,lt,D){s.I.expr=lt>D*0.55?'happy':'neutral';pose(s.I,lt,'sit');pose(s.J,lt,'sittalk');tcam(lt,D,lt<D*0.5?'J':'I');popIn(s.card,lt,0.3);stamp(s,'VP SMILES 🙂','#38d27a',lt,D*0.6,110,1250)}},
 /* 7 interview 4: tell me about yourself, 30s timer */
 {setup(s){table(s,MD,'worried');s.b=el('bub','Tell me about yourself.');s.t=el('chip','⏱️ 0:30',{left:'400px',top:'1180px',background:'#c62828',fontSize:'64px'})},
  frame(s,lt,D){pose(s.I,lt,lt<D*0.3?'sittalk':'sit');pose(s.J,lt,lt<D*0.3?'sit':'sittalk');tcam(lt,D,lt<D*0.3?'I':'J');clock(s,'INTERVIEW 4 · MD',lt);bub(s,s.I,2.0);fadeIn(s.b,lt,0.2);if(lt>D*0.3)s.b.style.opacity=0;
   s.t.textContent='⏱️ 0:'+String(Math.max(0,30-Math.floor(lt/D*30))).padStart(2,'0');popIn(s.t,lt,0.4)}},
 /* 8 6 PM walking out, refreshing email */
 {setup(s){A.skyline();s.J=person(Object.assign({},SUIT,{expr:'worried',prop:'briefcase'}));A.scene.add(s.J.g);s.c=el('chip','📧 refresh… refresh…',{left:'250px',top:'1180px',background:'#2448D8',fontSize:'54px'})},
  frame(s,lt,D){pose(s.J,lt,'walk');s.J.armL.rotation.x=-1.4;camMove([0,1.8,6.0],[0,1.7,5.2],[0,1.3,0],[0,1.4,0],lt/D);clock(s,'6:00 PM',lt,'#1b1f3a');popIn(s.c,lt,0.4)}},
 /* 9 three days later: offer */
 {setup(s){Object.assign(s,desk(Object.assign({},JAKE,{expr:'shock'}),mail,'sit'))},
  frame(s,lt,D){pose(s.P,lt,lt>D*0.45?'cheer':'sit');if(lt>D*0.45)s.P.expr='happy';camMove([2.6,2.6,4.4],[2.0,2.4,3.4],[0,1.6,-0.2],[0,1.7,-0.2],lt/D);clock(s,'3 DAYS LATER',lt);stamp(s,'OFFER 🎉','#38d27a',lt,D*0.45,170,1250)}},
 {setup(s){endCard(s,'Jake is')},frame:endFrame}
];
