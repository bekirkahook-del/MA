// Big 12 Wall Street BRAWL (PS2 style). Cartoon foam-finger bonks, nobody gets hurt. Data: Rareliquid (Oct 16, 2026).
import {A,THREE,person,pose,el,anchor,ease,back,camMove,popIn,fadeIn} from './common.js';
const SCH={tcu:['#4D1979','#FFFFFF','TCU'],baylor:['#154734','#FFB81C','BAYLOR'],colorado:['#1a1a1a','#CFB87C','CU'],asu:['#8C1D40','#FFC627','ASU'],
byu:['#002E5D','#FFFFFF','BYU'],utah:['#CC0000','#FFFFFF','UTAH'],ttu:['#CC0000','#111111','TTU'],kansas:['#0051BA','#E8000D','KU'],arizona:['#0C234B','#AB0520','UA'],
houston:['#C8102E','#FFFFFF','UH'],cincy:['#E00122','#111111','UC'],ucf:['#111111','#FFC904','UCF'],isu:['#C8102E','#F1BE48','ISU'],kstate:['#512888','#FFFFFF','K-STATE'],okstate:['#FF7300','#111111','OSU'],wvu:['#002855','#EAAA00','WVU']};
const OUT=['byu','utah','ttu','kansas','arizona','houston','cincy','ucf','isu','kstate','okstate','wvu'];
const SK=['#e0b48c','#a8714a','#f0c09a','#c98b63','#e8c3a0','#d9a882'],HR=['#2a1a12','#111','#c9a46a','#4a2f1d','#7a5a3a','#222'];
function fan(id,i,expr='happy'){const [c1,c2]=SCH[id];const p=person({shirt:c1,sleeve:c1,pants:'#222',tie:c2,hair:HR[i%6],skin:SK[i%6],girl:i%3===1,hairStyle:i%3===1?'long':undefined,expr});
  A.box(0.16,0.34,0.06,c2,0,-0.95,0.05,p.armR);A.box(0.06,0.14,0.06,c2,0,-1.18,0.05,p.armR); /* foam finger */
  p.id=id;A.scene.add(p.g);return p}
function arena(){A.room('#141a2b','#2b3247');A.scene.background=new THREE.Color('#0b1020');
  const s=A.textPlane(['BIG 12 BRAWL'],{w:3.6,h:0.75,bg:'#f6c84c',fg:'#0b1020',font:'bold 110px DejaVu Sans'});s.position.set(0,4.0,-2.12);A.scene.add(s);
  A.box(9,0.12,6,'#3a4256',0,0.06,0.6)}
/* swing + knockout helpers */
function swing(p,lt,t0){if(lt<t0||lt>t0+0.45)return;const k=(lt-t0)/0.45;p.armR.rotation.x=-2.6+Math.sin(k*Math.PI)*2.2;p.armR.rotation.z=-0.3}
function knock(p,lt,t0,dir=1){if(lt<t0)return;const k=ease((lt-t0)/0.55);if(p.kx0===undefined)p.kx0=p.g.position.x;p.g.rotation.z=-dir*k*1.45;p.g.position.y=Math.sin(Math.min(1,k)*Math.PI)*0.7;p.g.position.x=p.kx0+dir*k*1.2;p.expr='shock'}
function pow(s,key,txt,x,y,lt,t0,col='#ff4d5e'){if(!s[key])s[key]=el('stamp',txt,{left:x+'px',top:y+'px',color:col,fontSize:'96px',textShadow:'0 6px 0 #000'});s[key].style.opacity=lt>=t0&&lt<t0+0.6?1:0;s[key].style.transform=`translate(-50%,-50%) rotate(-8deg) scale(${0.5+0.5*back((lt-t0)/0.25)})`}
function tag(s,key,p,txt,lt,at=0,dy=2.45,size='40px'){if(!s[key])s[key]=el('label',txt,{fontSize:size,textAlign:'center'});const a=anchor(p,dy);s[key].style.left=a.x+'px';s[key].style.top=a.y+'px';s[key].style.opacity=ease((lt-at)/0.25)}
function card(s,html,lt,at,top=1230){if(!s.cd)s.cd=el('card',`<div style="padding:22px 30px;font-family:DejaVu Sans;text-align:center">${html}</div>`,{left:'140px',top:top+'px',width:'800px'});popIn(s.cd,lt,at)}
function stamp(s,txt,color,lt,at,size=170,top=330){if(!s.st)s.st=el('stamp',txt,{left:'540px',top:top+'px',color,fontSize:size+'px',textShadow:'0 8px 0 rgba(0,0,0,.6)'});popIn(s.st,lt,at,0.35,'translate(-50%,-50%) rotate(-6deg)')}
const duel=(s,a,b,ia,ib,flip)=>{s.A=fan(a,ia);s.A.g.position.set(-0.75,0,0.6);s.A.g.rotation.y=Math.PI/2;s.B=fan(b,ib,'neutral');s.B.g.position.set(0.75,0,0.6);s.B.g.rotation.y=-Math.PI/2};
window.SHOTS=[
 /* 1 hook: BYU gets bonked off the stage */
 {setup(s){arena();s.B=fan('byu',4,'happy');s.B.g.position.set(0.3,0,0.8);s.T=fan('tcu',0);s.T.g.position.set(-1.0,0,0.8);s.T.g.rotation.y=Math.PI/2},
  frame(s,lt,D){const h=D*0.35;pose(s.B,lt,'idle');pose(s.T,lt,lt<h?'walk':'idle');if(lt<h)s.T.g.position.x=-1.6+lt/h*0.9;swing(s.T,lt,h);knock(s.B,lt,h+0.2,1);
   camMove([0,2.2,7.0],[0,2.1,6.4],[0,1.5,0.6],[0,1.6,0.6],lt/D);tag(s,'tb',s.B,'BYU',lt,0.2);if(lt>h+0.2)s.tb.style.opacity=0;pow(s,'p1','BONK!',560,620,lt,h+0.2);stamp(s,'NOT TOP 100','#ff4d5e',lt,h+0.7,120,1200)}},
 /* 2 so who is? everyone brawls */
 {setup(s){arena();s.f=Object.keys(SCH).map((id,i)=>{const p=fan(id,i);p.g.position.set(-3.3+(i%8)*0.95,0,-0.4+Math.floor(i/8)*1.7);p.g.rotation.y=(i%2?1:-1)*Math.PI/2;return p})},
  frame(s,lt,D){s.f.forEach((p,i)=>{pose(p,lt+i*0.3,'idle');swing(p,lt,(i*0.37)%Math.max(0.5,D-0.6));p.g.position.y=Math.abs(Math.sin(lt*5+i))*0.12});
   camMove([-3,3.6,8.2],[3,3.2,7.6],[0,1.2,0.3],[0,1.2,0.3],lt/D);pow(s,'p1','POW!',300,700,lt,D*0.3,'#f6c84c');pow(s,'p2','BAM!',760,820,lt,D*0.6,'#ff4d5e')}},
 /* 3 #3 Colorado knocks out two */
 {setup(s){arena();s.C=fan('colorado',2);s.C.g.position.set(0,0,0.8);s.x=[fan('houston',9,'neutral'),fan('asu',3,'neutral')];s.x[0].g.position.set(-1.0,0,0.8);s.x[0].g.rotation.y=Math.PI/2;s.x[1].g.position.set(1.0,0,0.8);s.x[1].g.rotation.y=-Math.PI/2},
  frame(s,lt,D){pose(s.C,lt,'idle');s.x.forEach((p,i)=>pose(p,lt+i,'idle'));s.C.g.rotation.y=lt<D*0.4?-Math.PI/2:lt<D*0.68?Math.PI/2:0;if(lt>D*0.68)s.C.expr='happy';swing(s.C,lt,D*0.2);knock(s.x[1],lt,D*0.2+0.2,1);swing(s.C,lt,D*0.45);knock(s.x[0],lt,D*0.45+0.2,-1);
   camMove([0,2.4,8.2],[0,2.3,7.4],[0,1.5,0.6],[0,1.6,0.6],lt/D);pow(s,'p1','BONK!',700,650,lt,D*0.2+0.2);pow(s,'p2','POW!',380,650,lt,D*0.45+0.2,'#f6c84c');tag(s,'v1',s.x[1],'ASU #4',lt,0.2,2.45,'38px');tag(s,'v0',s.x[0],'UH',lt,0.2,2.45,'38px');tag(s,'w',s.C,'CU',lt,0.2,2.45,'38px');
   card(s,'<div style="font-size:30px;color:#4A5672;font-weight:800">#3 IN THE BIG 12</div><div style="font-size:66px;font-weight:900;color:#13203B">Colorado</div><div style="font-size:34px;font-weight:700;color:#13203B">56 analysts · #91 in the U.S. · knocks out #4 ASU</div>',lt,D*0.6)}},
 /* 4 #2 Baylor */
 {setup(s){arena();s.C=fan('baylor',1);s.C.g.position.set(0,0,0.8);s.x=[fan('kstate',13,'neutral'),fan('colorado',2,'neutral')];s.x[0].g.position.set(-1.0,0,0.8);s.x[0].g.rotation.y=Math.PI/2;s.x[1].g.position.set(1.0,0,0.8);s.x[1].g.rotation.y=-Math.PI/2},
  frame(s,lt,D){pose(s.C,lt,'idle');s.x.forEach((p,i)=>pose(p,lt+i,'idle'));s.C.g.rotation.y=lt<D*0.4?-Math.PI/2:lt<D*0.68?Math.PI/2:0;if(lt>D*0.68)s.C.expr='happy';swing(s.C,lt,D*0.2);knock(s.x[1],lt,D*0.2+0.2,1);swing(s.C,lt,D*0.45);knock(s.x[0],lt,D*0.45+0.2,-1);
   camMove([0,2.4,8.2],[0,2.3,7.4],[0,1.5,0.6],[0,1.6,0.6],lt/D);pow(s,'p1','WHAM!',700,650,lt,D*0.2+0.2);pow(s,'p2','BONK!',380,650,lt,D*0.45+0.2,'#f6c84c');tag(s,'v1',s.x[1],'CU #3',lt,0.2,2.45,'38px');tag(s,'v0',s.x[0],'K-STATE',lt,0.2,2.45,'38px');tag(s,'w',s.C,'BAYLOR',lt,0.2,2.45,'38px');
   card(s,'<div style="font-size:30px;color:#4A5672;font-weight:800">#2 IN THE BIG 12</div><div style="font-size:66px;font-weight:900;color:#13203B">Baylor</div><div style="font-size:34px;font-weight:700;color:#13203B">50 analysts, more per student · #89 · beats Colorado</div>',lt,D*0.6)}},
 /* 5 #1 TCU: last one standing on the podium */
 {setup(s){arena();A.box(1.4,0.6,1.0,'#f6c84c',0,0.3,0.4);s.T=fan('tcu',0);s.T.g.position.set(0,0.6,0.4);
   s.x=['baylor','okstate','isu','wvu'].map((id,i)=>{const p=fan(id,[1,14,12,15][i],'shock');p.g.position.set([-1.6,1.6,-2.4,2.4][i],0,[1.2,1.2,0.4,0.4][i]);p.g.rotation.y=i%2?-Math.PI/2:Math.PI/2;return p});s.cf=[...Array(14)].map((_,k)=>el('label',['🎉','✨','💜'][k%3],{fontSize:'64px'}))},
  frame(s,lt,D){pose(s.T,lt,lt>D*0.45?'cheer':'idle');swing(s.T,lt,D*0.15);s.x.forEach((p,i)=>{pose(p,lt+i,'idle');knock(p,lt,D*0.15+0.2+i*0.08,i%2?1:-1);p.g.position.z=[1.2,1.2,0.4,0.4][i]});
   camMove([0,2.6,8.0],[0,2.4,7.0],[0,1.7,0.4],[0,1.8,0.4],lt/D);pow(s,'p1','KO!',540,700,lt,D*0.15+0.25,'#f6c84c');tag(s,'vb',s.x[0],'BAYLOR #2',lt,0.1,2.45,'38px');stamp(s,'#1 TCU','#c9a2ff',lt,D*0.4,150,215);
   card(s,'<div style="font-size:66px;font-weight:900;color:#4D1979">115 analysts</div><div style="font-size:34px;font-weight:700;color:#13203B">More than double anyone in the Big 12 · #60 in the U.S.</div>',lt,D*0.5);
   s.cf.forEach((e,k)=>{const t=lt-D*0.45-k*0.05;e.style.left=(80+(k*73)%920)+'px';e.style.top=(200+((t*420+k*90)%1300))+'px';e.style.opacity=t>0?1:0})}},
 /* 6 twelve knocked out */
 {setup(s){arena();s.f=OUT.map((id,i)=>{const p=fan(id,4+i,'shock');p.g.position.set(-3.1+(i%6)*1.25,0.1,-0.2+Math.floor(i/6)*1.8);p.g.rotation.x=-1.45;return p})},
  frame(s,lt,D){s.f.forEach((p,i)=>{pose(p,lt+i,'freeze');p.g.rotation.x=-1.45});camMove([0,6.5,6.0],[0,6.0,5.2],[0,0,0.6],[0,0,0.6],lt/D);stamp(s,'12 KNOCKED OUT','#ff4d5e',lt,0.3,110,330);
   card(s,'<div style="font-size:44px;font-weight:900;color:#13203B">Not in the national top 100 for Wall Street</div>',lt,D*0.45)}},
 /* 7 the names */
 {setup(s){arena();s.f=OUT.slice(0,4).map((id,i)=>{const p=fan(id,4+i,'shock');p.g.position.set(-2.4+i*1.6,0.1,0.6);p.g.rotation.x=-1.45;return p});s.c=el('chip','+ 8 more',{left:'400px',top:'1180px',background:'#c62828',fontSize:'60px'})},
  frame(s,lt,D){s.f.forEach((p,i)=>{pose(p,lt+i,'freeze');p.g.rotation.x=-1.45;tag(s,'t'+i,p,['BYU','Utah','Texas Tech','Kansas'][i],lt,i*D*0.18,0.9,'46px')});camMove([0,6.4,7.4],[0,6.0,6.8],[0,0.2,0.6],[0,0.2,0.6],lt/D);popIn(s.c,lt,D*0.72)}},
 /* 8 survivors line up: underrated or overrated */
 {setup(s){arena();s.f=['colorado','tcu','baylor','asu'].map((id,i)=>{const p=fan(id,[2,0,1,3][i],'happy');p.g.position.set(-1.65+i*1.1,0,0.8);return p});
   s.q=el('stamp','Underrated or overrated? 👇',{left:'540px',top:'1320px',color:'#fff',fontSize:'72px',textShadow:'0 6px 0 #000',width:'900px'})},
  frame(s,lt,D){s.f.forEach((p,i)=>{pose(p,lt+i,'idle');p.armR.rotation.z=-2.5;tag(s,'t'+i,p,SCH[p.id][2],lt,0.2,2.75,'40px')});camMove([0,2.3,9.6],[0,2.2,8.8],[0,1.6,0.6],[0,1.7,0.6],lt/D);popIn(s.q,lt,0.3,0.35,'translate(-50%,-50%)')}},
 /* 9 next: Ivy */
 {setup(s){A.skyline();s.T=fan('tcu',0);A.scene.add(s.T.g);
   s.e=el('end',`<div class="t">NEXT EPISODE</div><div style="font-family:DejaVu Sans;font-weight:900;font-size:130px;color:#f6c84c;margin:20px 0">IVY 🏛️</div><div style="font-family:DejaVu Sans;font-weight:800;font-size:56px;color:#fff;text-align:center">Follow so your school<br>doesn't get left out</div><div class="s">Data: Rareliquid IB target school ranking, pulled Oct 16, 2026 (2/3 analysts at 18 top banks, 1/3 per student; counts are floors).<br>Original PS2-style characters in school colors, not official mascots. AI voice.</div>`);s.e.style.opacity=0},
  frame(s,lt,D){pose(s.T,lt,'cheer');camMove([0,1.6,7],[0,1.5,6],[0,1.3,0],[0,1.3,0],lt/D);s.e.style.opacity=ease((lt-0.2)/0.4)}}
];
