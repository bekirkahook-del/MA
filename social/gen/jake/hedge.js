// Day in the life: long/short hedge fund analyst (Sam, fictional). PS2 style.
import {A,THREE,person,pose,el,anchor,ease,camMove,bub,popIn,fadeIn,desk,endCard,endFrame} from './common.js';
import {CO,bullpen,bp,tex,clock,stamp,boss,nameTag,wallScreen,sign} from './dlcommon.js';
const SAM={shirt:'#1f2533',sleeve:'#1f2533',pants:'#1f2533',hairStyle:'bun',hair:'#7a4a2a',girl:true,skin:'#f0c9a6'};
const PM={shirt:'#ffffff',sleeve:'#ffffff',pants:'#2a2f45',hair:'#3a3a3a',skin:'#e0b48c',suit:'#3b4a6b'};
const bbg=tex((g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.font='bold 30px DejaVu Sans Mono';[['S&P FUT','+0.4%','#3ddc84'],['NASDAQ FUT','+0.6%','#3ddc84'],['10Y','4.21%','#ffb000'],['OIL','-1.2%','#ff4d5e'],['ACME','-0.3%','#ff4d5e'],['NEWS','Fed speaker at 10:00','#ffb000']].forEach((r,i)=>{const y=70+i*85;g.fillStyle='#ffb000';g.fillText(r[0],30,y);g.fillStyle=r[2];g.fillText(r[1],420,y)})});
const chart=(f)=>tex((g,w,h)=>{g.fillStyle='#05070d';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='bold 44px DejaVu Sans';g.fillText('Her biggest long',30,62);const p=f();g.lineWidth=10;g.strokeStyle=p[p.length-1]>=p[0]-0.5?'#3ddc84':'#ff4d5e';g.beginPath();p.forEach((v,i)=>{const x=60+i*900/(Math.max(1,p.length-1)),y=330-(v-100)*25;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()});
const thesis=tex((g,w,h)=>{g.fillStyle='#fffbe6';g.fillRect(0,0,w,h);g.fillStyle='#13203B';g.font='bold 44px DejaVu Sans';g.fillText('Thesis check',40,80);g.font='38px DejaVu Sans';['✓ Demand still growing','✓ Margins on track','✓ No guidance change','✓ Management unchanged'].forEach((t,i)=>{g.fillStyle='#16a06a';g.fillText(t,50,180+i*90)})});
const tabs=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#1d6f42';g.fillRect(0,0,w,60);g.fillStyle='#fff';g.font='bold 30px DejaVu Sans';g.fillText('ACME_model_v41.xlsx',24,42);g.fillStyle='#e8eef8';g.fillRect(0,h-60,w,60);g.font='20px DejaVu Sans';g.fillStyle='#13203B';for(let i=0;i<14;i++)g.fillText('Tab'+(i+30),10+i*72,h-22);g.font='28px DejaVu Sans Mono';for(let r=0;r<9;r++)for(let c=0;c<5;c++){g.fillStyle='#13203B';g.fillText((Math.abs(Math.sin(r*7+c*3))*999).toFixed(1),30+c*200,120+r*50)}});
window.SHOTS=[
 {setup(s){A.skyline();s.S=person(Object.assign({},SAM,{expr:'happy'}));A.scene.add(s.S.g);s.cr=[0,1].map(i=>{const p=person(CO(i+3));p.g.position.set([-1.4,1.4][i],0,-1.6);A.scene.add(p.g);return p})},
  frame(s,lt,D){pose(s.S,lt,'idle');s.cr.forEach((p,i)=>pose(p,lt+i,'walk'));camMove([0,1.8,6.5],[0,1.6,5.2],[0,1.3,0],[0,1.4,0],lt/D);nameTag(s,s.S,'SAM','Hedge fund analyst',lt)}},
 {setup(s){Object.assign(s,desk(SAM,bbg,'type',{expr:'neutral'}));s.bp=bullpen(true)},
  frame(s,lt,D){pose(s.P,lt,'type');bp(s,lt);camMove([1.4,2.6,4.2],[1.0,2.4,3.3],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);clock(s,'6:00 AM',lt,'#1b1f3a')}},
 {setup(s){Object.assign(s,desk(SAM,bbg,'type',{expr:'worried'}));s.Pm=boss(PM,1.3,1.4,Math.PI*0.8);s.b=el('bub',"What's your variant view?");s.bp=bullpen(false)},
  frame(s,lt,D){pose(s.P,lt,'type');pose(s.Pm,lt,'talk');bp(s,lt);camMove([2.2,2.6,4.8],[1.8,2.5,4.0],[0.4,1.8,0.2],[0.4,1.9,0.2],lt/D);clock(s,'7:30 AM',lt);bub(s,s.Pm,2.1);fadeIn(s.b,lt,0.3)}},
 {setup(s){A.room('#141a2b','#2a3040');s.k=0;s.t=chart(()=>[100,100.3,99.8,98,95,93,92].slice(0,Math.max(2,Math.floor(7*s.k))));wallScreen(s.t);s.S=person(Object.assign({},SAM,{expr:'shock'}));s.S.g.position.set(0,0,1.6);A.scene.add(s.S.g);s.bp=bullpen(false)},
  frame(s,lt,D){s.k=ease(lt/(D*0.6));s.t.draw();pose(s.S,lt,'panic');bp(s,lt);camMove([0,2.6,9.0],[0,2.6,8.0],[0,2.4,-1],[0,2.5,-1],lt/D);clock(s,'9:30 AM',lt);stamp(s,'−8%','#ff4d5e',lt,D*0.6,220,1250)}},
 {setup(s){Object.assign(s,desk(SAM,thesis,'sit',{expr:'neutral'}));s.bp=bullpen(false)},
  frame(s,lt,D){pose(s.P,lt,'sit');bp(s,lt);camMove([1.4,2.6,4.2],[1.0,2.4,3.3],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);clock(s,'10:00 AM',lt);stamp(s,'HOLD','#16a06a',lt,D*0.55,170,1250)}},
 {setup(s){Object.assign(s,desk(SAM,thesis,'sittalk',{expr:'happy'}));s.bp=bullpen(false);s.c=el('card','<div style="padding:20px 28px;font-family:DejaVu Sans"><div style="font-size:28px;color:#4A5672;font-weight:700">📞 EXPERT CALL</div><div style="font-size:42px;font-weight:900;color:#13203B">Former employee of the company</div></div>',{left:'130px',top:'420px',width:'820px'})},
  frame(s,lt,D){pose(s.P,lt,'sittalk');bp(s,lt);camMove([2.6,2.6,4.4],[2.0,2.4,3.4],[0,1.5,0],[0,1.6,0],lt/D);clock(s,'12:00 PM',lt);popIn(s.c,lt,0.5)}},
 {setup(s){Object.assign(s,desk(SAM,tabs,'type',{expr:'worried'}));s.bp=bullpen(false);s.c=el('chip','📑 Tab 43 of way too many',{left:'200px',top:'1180px',background:'#1d6f42',fontSize:'50px'})},
  frame(s,lt,D){pose(s.P,lt,'type');bp(s,lt);camMove([1.4,2.6,4.2],[1.0,2.4,3.3],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);clock(s,'2:00 PM',lt);popIn(s.c,lt,0.5)}},
 {setup(s){A.room('#141a2b','#2a3040');s.k=0;s.t=chart(()=>{const p=[100,98,95,92,93,95,97,99,100.2];return p.slice(0,Math.max(2,Math.floor(p.length*s.k)))});wallScreen(s.t);s.S=person(Object.assign({},SAM,{expr:'happy'}));s.S.g.position.set(0,0,1.6);A.scene.add(s.S.g);s.bp=bullpen(false,'cheer')},
  frame(s,lt,D){s.k=ease(lt/(D*0.6));s.t.draw();pose(s.S,lt,'fist');bp(s,lt);camMove([0,2.6,9.0],[0,2.6,8.0],[0,2.4,-1],[0,2.5,-1],lt/D);clock(s,'4:00 PM',lt);stamp(s,'BACK!','#16a06a',lt,D*0.6,200,1250)}},
 {setup(s){Object.assign(s,desk(SAM,tabs,'type',{expr:'worried'}));s.Pm=boss(PM,-1.3,1.4,-Math.PI*0.8);s.b=el('bub','Call me at 6 AM.');s.bp=bullpen(true)},
  frame(s,lt,D){pose(s.P,lt,'type');pose(s.Pm,lt,'talk');bp(s,lt);camMove([-2.2,2.6,4.8],[-1.8,2.5,4.0],[-0.4,1.8,0.2],[-0.4,1.9,0.2],lt/D);clock(s,'7:00 PM',lt,'#1b1f3a');bub(s,s.Pm,2.1);fadeIn(s.b,lt,0.3)}},
 {setup(s){endCard(s,'Sam is')},frame:endFrame}
];
