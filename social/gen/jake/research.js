// Day in the life: first-year equity research associate (Dev, fictional). PS2 style.
import {A,THREE,person,pose,el,anchor,ease,camMove,bub,popIn,fadeIn,desk,endCard,endFrame} from './common.js';
import {CO,bullpen,bp,tex,clock,stamp,boss,nameTag,wallScreen,sign} from './dlcommon.js';
const DEV={shirt:'#dfe8f5',sleeve:'#dfe8f5',pants:'#2a2f45',tie:'#1c3d8a',hair:'#111',skin:'#a8714a'};
const SENIOR={shirt:'#f4f4f4',suit:'#2b2f3a',sleeve:'#2b2f3a',pants:'#2b2f3a',tie:'#8a1c1c',hairStyle:'bald',hair:'#888',skin:'#d9a882'};
const phone=tex((g,w,h)=>{g.fillStyle='#0b0f18';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='bold 44px DejaVu Sans';g.fillText('ACME Corp: Q3 results',40,120);g.font='34px DejaVu Sans';g.fillStyle='#9fb0c3';g.fillText('Press release · 4:58 AM',40,180)});
const model=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#1d6f42';g.fillRect(0,0,w,60);g.fillStyle='#fff';g.font='bold 30px DejaVu Sans';g.fillText('ACME_model.xlsx',24,42);
  [['','Est.','Actual',''],['Revenue','$2.40B','$2.52B','BEAT'],['Gross margin','41.0%','38.6%','MISS'],['EPS','$1.10','$1.04','MISS']].forEach((r,j)=>{const y=140+j*100;r.forEach((c,i)=>{g.fillStyle=c==='BEAT'?'#16a06a':c==='MISS'?'#d62828':'#13203B';g.font=(j===0||i===3?'bold ':'')+'34px DejaVu Sans Mono';g.fillText(c,[30,330,560,790][i],y)})})});
const note=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#0b2a5b';g.fillRect(0,0,w,80);g.fillStyle='#fff';g.font='bold 34px DejaVu Sans';g.fillText('MORNING NOTE · ACME Corp',24,52);g.fillStyle='#13203B';g.font='bold 34px DejaVu Sans';g.fillText('Q3: revenue beat, margins missed',40,170);g.font='30px DejaVu Sans';['• Pricing pressure in core segment','• Guidance unchanged','• Rating: Hold'].forEach((t,i)=>g.fillText(t,40,250+i*70))});
const chart=(k)=>tex((g,w,h)=>{g.fillStyle='#05070d';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='bold 44px DejaVu Sans';g.fillText('ACME',30,62);const p=[50,50.4,50.1,50.6,50.3,47.2,47.0];g.lineWidth=10;g.strokeStyle='#ff4d5e';g.beginPath();const m=Math.max(2,Math.floor(p.length*k()));for(let i=0;i<m;i++){const x=60+i*150,y=560-(p[i]-44)*65;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()});
const crowd=(n,z)=>[...Array(n).keys()].map(i=>{const p=person(CO(i));p.g.position.set(-2.4+4.8*i/(n-1),0,z+(i%2)*0.6);p.g.rotation.y=0;p.mode='sit';A.scene.add(p.g);A.box(0.6,0.08,0.6,'#3a4a6b',p.g.position.x,0.5,p.g.position.z);return p});
window.SHOTS=[
 {setup(s){A.skyline();s.D=person(Object.assign({},DEV,{expr:'happy',prop:'briefcase'}));A.scene.add(s.D.g);s.cr=[0,1,2].map(i=>{const p=person(Object.assign({},CO(i+2),{prop:'briefcase'}));p.g.position.set([-1.5,1.5,0][i],0,[-1.4,-1.4,-2.6][i]);A.scene.add(p.g);return p})},
  frame(s,lt,D){pose(s.D,lt,'idle');s.cr.forEach((p,i)=>pose(p,lt+i,'walk'));camMove([0,1.8,6.5],[0,1.6,5.2],[0,1.3,0],[0,1.4,0],lt/D);nameTag(s,s.D,'DEV','1st-year equity research',lt)}},
 {setup(s){A.room('#3a3f5a','#5a4a3a');A.box(2.2,0.5,1.2,'#e9e4d8',0,0.25,0.2);A.box(2.2,0.15,1.25,'#5b7bd6',0.1,0.55,0.2);s.D=person(Object.assign({},DEV,{shirt:'#7a8db8',sleeve:'#7a8db8',tie:null,expr:'shock'}));s.D.g.position.set(0,0,0.95);A.scene.add(s.D.g);
   s.n=el('card','<div style="padding:20px 28px;font-family:DejaVu Sans"><div style="font-size:26px;color:#4A5672;font-weight:700">🔔 4:58 AM</div><div style="font-size:42px;font-weight:900;color:#13203B">ACME Corp: Q3 results</div></div>',{left:'170px',top:'480px',width:'740px'})},
  frame(s,lt,D){pose(s.D,lt,'sit');s.D.armR.rotation.x=-1.6;camMove([0.3,2.0,4.6],[0.2,1.9,3.8],[0,1.2,0.6],[0,1.25,0.6],lt/D);clock(s,'5:00 AM',lt,'#1b1f3a');popIn(s.n,lt,0.4)}},
 {setup(s){Object.assign(s,desk(DEV,model,'type',{expr:'worried'}));s.bp=bullpen(true)},
  frame(s,lt,D){pose(s.P,lt,'type');bp(s,lt);camMove([1.4,2.6,4.2],[1.0,2.4,3.3],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);clock(s,'5:30 AM',lt,'#1b1f3a')}},
 {setup(s){Object.assign(s,desk(DEV,note,'type',{expr:'worried'}));s.bp=bullpen(true);s.c=el('chip','⏱️ Out before 7:00',{left:'300px',top:'1180px',background:'#c62828',fontSize:'54px'})},
  frame(s,lt,D){pose(s.P,lt,'type');bp(s,lt);camMove([1.4,2.6,4.2],[1.0,2.4,3.3],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);clock(s,'6:45 AM',lt);popIn(s.c,lt,0.5)}},
 {setup(s){A.room('#2a3350','#3a4256');sign('MORNING MEETING',{bg:'#0b2a5b',w:4.2,size:90});s.D=person(Object.assign({},DEV,{expr:'happy'}));s.D.g.position.set(0,0,-0.8);A.scene.add(s.D.g);s.cr=crowd(6,1.4);s.c=el('chip','⏱️ 30 seconds. Go.',{left:'300px',top:'1180px',background:'#c62828',fontSize:'54px'})},
  frame(s,lt,D){pose(s.D,lt,'talk');s.cr.forEach((p,i)=>pose(p,lt+i,'sit'));camMove([0,2.6,6.6],[0,2.4,5.6],[0,1.6,-0.4],[0,1.7,-0.4],lt/D);clock(s,'7:15 AM',lt);popIn(s.c,lt,0.5)}},
 {setup(s){A.room('#141a2b','#2a3040');s.k=0;s.t=chart(()=>s.k);wallScreen(s.t);s.bp=bullpen(false,'freeze');s.D=person(Object.assign({},DEV,{expr:'shock'}));s.D.g.position.set(0,0,1.6);A.scene.add(s.D.g)},
  frame(s,lt,D){s.k=ease(lt/(D*0.6));s.t.draw();pose(s.D,lt,'freeze');bp(s,lt);camMove([0,2.6,9.0],[0,2.6,8.0],[0,2.4,-1],[0,2.5,-1],lt/D);clock(s,'9:30 AM',lt);stamp(s,'−6%','#ff4d5e',lt,D*0.6,220,760)}},
 {setup(s){Object.assign(s,desk(DEV,model,'sittalk',{expr:'worried'}));s.bp=bullpen(false,'sittalk');s.q=[0,1,2].map(i=>el('chip','📞 "What about margins?"',{left:[120,300,180][i]+'px',top:[430,610,790][i]+'px',background:['#2448D8','#7b4bd6','#16a06a'][i],fontSize:'46px'}))},
  frame(s,lt,D){pose(s.P,lt,'sittalk');bp(s,lt);camMove([2.6,2.6,4.4],[2.0,2.4,3.4],[0,1.5,0],[0,1.6,0],lt/D);clock(s,'12:00 PM',lt);s.q.forEach((e,i)=>popIn(e,lt,0.5+i*D*0.25))}},
 {setup(s){Object.assign(s,desk(DEV,model,'type',{expr:'shock'}));s.Se=boss(SENIOR,1.3,1.4,Math.PI*0.8);s.b=el('bub','New price target. By four.');s.bp=bullpen(false)},
  frame(s,lt,D){pose(s.P,lt,'type');pose(s.Se,lt,'talk');bp(s,lt);camMove([2.2,2.6,4.8],[1.8,2.5,4.0],[0.4,1.8,0.2],[0.4,1.9,0.2],lt/D);clock(s,'3:00 PM',lt);bub(s,s.Se,2.1);fadeIn(s.b,lt,0.3)}},
 {setup(s){Object.assign(s,desk(DEV,note,'type',{expr:'worried'}));s.bp=bullpen(true);s.c=el('chip','📅 Tomorrow: 2 more earnings',{left:'150px',top:'1180px',background:'#c62828',fontSize:'50px'})},
  frame(s,lt,D){pose(s.P,lt,'type');bp(s,lt);camMove([-3.6,3.4,6.4],[-3.0,3.1,5.4],[-0.2,1.4,0],[-0.2,1.5,0],lt/D);clock(s,'7:00 PM',lt,'#1b1f3a');popIn(s.c,lt,0.5)}},
 {setup(s){endCard(s,'Dev is')},frame:endFrame}
];
