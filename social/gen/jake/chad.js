import {A,THREE,cam,person,pose,el,anchor,ease,back,JAKE,camMove,bub,popIn,fadeIn,desk,deskCam,screenCam,endCard,endFrame,bus} from './common.js';
const CHAD={shirt:'#d23c3c',pants:'#c9b28a',hair:'#e9c25a',hairStyle:'flip',shades:true,skin:'#f0c09a'};
const coursePage=()=>A.canvasTex(1024,614,(g,w,h)=>{g.fillStyle='#111';g.fillRect(0,0,w,h);g.fillStyle='#f6c84c';g.font='bold 54px DejaVu Sans';g.fillText('FINANCE MASTERY',60,110);g.fillText('BOOTCAMP',60,175);
  g.fillStyle='#fff';g.font='34px DejaVu Sans';g.fillText('40 hours of video lectures',60,250);g.font='bold 120px DejaVu Sans';g.fillText('$500',60,400);
  g.fillStyle='#16a06a';g.fillRect(60,450,380,90);g.fillStyle='#fff';g.font='bold 44px DejaVu Sans';g.fillText('ENROLL NOW',95,510)});
const videoPage=()=>A.canvasTex(1024,614,(g,w,h)=>{g.fillStyle='#0d0d0d';g.fillRect(0,0,w,h);g.fillStyle='#1d1d1d';g.fillRect(40,40,w-80,420);g.fillStyle='#fff';g.font='bold 40px DejaVu Sans';g.fillText('Module 1 of 40: Intro to Finance (part 1)',60,520);
  g.fillStyle='#444';g.fillRect(60,560,w-120,14);g.fillStyle='#d23c3c';g.fillRect(60,560,90,14);g.fillStyle='#aaa';g.font='28px DejaVu Sans Mono';g.fillText('0:06:12 / 1:12:44',w-330,600);
  g.fillStyle='#fff';g.beginPath();g.moveTo(470,190);g.lineTo(470,310);g.lineTo(570,250);g.fill()});
function stamp(s,txt,color,lt,at,size=230){if(!s.st)s.st=el('stamp',txt,{left:'540px',top:'330px',color,fontSize:size+'px',textShadow:'0 8px 0 rgba(0,0,0,.55)'});popIn(s.st,lt,at,0.35,'translate(-50%,-50%) rotate(-6deg)')}
const IVS=(s)=>{s.iv=A.interviewRoom();const wb=A.textPlane(['Walk me through a DCF.','EV = Σ FCF / (1+WACC)^t'],{w:4,h:1.6,bg:'#f5f6f8',fg:'#13203B',font:'bold 70px DejaVu Sans'});wb.position.set(0,3.4,-3.95);A.scene.add(wb)};
window.SHOTS=[
 {setup(s){Object.assign(s,desk(CHAD,coursePage(),'type'))},frame(s,lt,D){pose(s.P,lt);camMove([1.5,2.7,4.6],[1.1,2.5,3.6],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);stamp(s,'$500','#ff4d4d',lt,0.9)}},
 {setup(s){Object.assign(s,desk(JAKE,A.img('learn.png'),'type'))},frame(s,lt,D){pose(s.P,lt);camMove([-1.5,2.7,4.6],[-1.1,2.5,3.6],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);stamp(s,'$0','#38d27a',lt,0.7,260)}},
 {setup(s){Object.assign(s,desk(CHAD,videoPage(),'sleep'));s.z=el('label','Z z z',{fontSize:'76px',color:'#bcd3ff'});s.c=el('chip','Watched: 2 of 40 hours',{left:'190px',top:'1180px',background:'#d23c3c',fontSize:'50px'});s.x2=el('chip','⏩ 2× speed',{left:'640px',top:'360px',background:'#7b4bd6',fontSize:'50px'})},
  frame(s,lt,D){pose(s.P,lt,'sleep');camMove([2.6,2.6,4.4],[2.0,2.4,3.4],[0,1.5,0],[0,1.6,0],lt/D);const a=anchor(s.P,1.9);s.z.style.left=a.x+70+'px';s.z.style.top=a.y-40-Math.sin(lt*2)*20+'px';fadeIn(s.c,lt,0.8);popIn(s.x2,lt,D*0.62)}},
 {setup(s){s.out=bus();s.J=person(Object.assign({},JAKE,{expr:'happy'}));s.J.g.position.set(1.3,0.1,0.45);s.J.g.rotation.y=Math.PI;s.J.mode='sit';A.scene.add(s.J.g);
   const ph=new THREE.Group();ph.position.set(1.3,1.5,-0.05);ph.rotation.x=-0.45;A.scene.add(ph);A.box(0.36,0.66,0.04,'#111',0,0,0,ph);const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.32,0.6),new THREE.MeshBasicMaterial({map:A.img('question.png')}));sc.position.z=0.025;ph.add(sc);
   s.c=el('chip','5-minute levels 🚌',{left:'300px',top:'1180px',fontSize:'52px'})},
  frame(s,lt,D){pose(s.J,lt,'sit');s.J.armL.rotation.x=-1.25;s.J.armR.rotation.x=-1.25;s.out.position.z=(lt*4)%1.6;
   const bob=Math.sin(lt*9)*0.015;camMove([-0.1,2.15+bob,-2.4],[0.15,2.0+bob,-1.7],[1.3,1.5,0.3],[1.3,1.55,0.3],lt/D);fadeIn(s.c,lt,0.4)}},
 {setup(s){Object.assign(s,desk(JAKE,A.img('lesson.png'),'type'));s.P.g.visible=false;s.c=el('chip','',{left:'320px',top:'1180px',fontSize:'62px',background:'#f2793b'})},
  frame(s,lt,D){screenCam(lt,D);const d=Math.min(30,1+Math.floor(Math.max(0,lt-0.4)/((D-0.8)/29)));s.c.textContent='🔥 Day '+d+' streak';if(lt>D*0.5&&!s.sw){s.sw=1;s.d.scr.material.map=A.img('question.png')}}},
 {setup(s){IVS(s);s.b=el('bub','Walk me through a DCF.')},
  frame(s,lt,D){s.iv.forEach((p,i)=>pose(p,lt+i,i===1?'sittalk':'sit'));camMove([0,2.4,7.8],[0,2.3,6.2],[0,1.9,-2.5],[0,1.9,-2.6],lt/D);bub(s,s.iv[1],2.0);fadeIn(s.b,lt,0.5)}},
 {setup(s){IVS(s);s.C=person(Object.assign({},CHAD,{expr:'worried'}));s.C.g.position.set(0,0,0.2);s.C.g.rotation.y=Math.PI;A.scene.add(s.C.g);s.b=el('bub','A DCF is when you... um... finance the company?');s.sw=[0,1].map(()=>el('label','💧',{fontSize:'54px'}))},
  frame(s,lt,D){s.iv.forEach((p,i)=>{p.expr=lt>D*0.6?'shock':'neutral';pose(p,lt+i,'sit')});pose(s.C,lt,lt<D*0.7?'talk':'freeze');camMove([2.8,2.2,4.6],[2.3,2.1,3.9],[0,1.5,-1],[0,1.5,-1],lt/D);bub(s,s.C,2.05);fadeIn(s.b,lt,0.2);
   const a=anchor(s.C,1.85);s.sw.forEach((e,i)=>{const t=(lt*1.3+i*0.5)%1;e.style.left=a.x+(i?60:-60)+'px';e.style.top=a.y+t*130+'px';e.style.opacity=1-t})}},
 {setup(s){IVS(s);s.iv.forEach(p=>p.expr='worried');s.n=el('card','<div style="padding:26px 34px;font-family:DejaVu Sans Mono;font-size:40px;line-height:1.5;background:#fffbe6;border-radius:12px"><b>Candidate: Chad</b><br>DCF: ✗<br>Confidence: ✗<br>Sunglasses: indoors</div>',{left:'210px',top:'300px',width:'660px',transform:'rotate(-3deg)'})},
  frame(s,lt,D){s.iv.forEach((p,i)=>pose(p,lt+i,'sit'));s.iv[1].armR.rotation.x=-1.0+Math.sin(lt*16)*0.08;camMove([0.4,2.0,1.6],[0.2,1.9,0.6],[0,1.5,-2.6],[0,1.5,-2.7],lt/D);popIn(s.n,lt,0.4,0.35,'rotate(-3deg)')}},
 {setup(s){IVS(s);s.J=person(Object.assign({},JAKE,{expr:'happy'}));s.J.g.position.set(0,0,0.2);s.J.g.rotation.y=Math.PI;A.scene.add(s.J.g);s.b=el('bub','Cash flows → discount at WACC → terminal value.');s.ok=el('chip','TECHNICALS ✓  0:30',{left:'500px',top:'330px',background:'#16a06a',fontSize:'48px'})},
  frame(s,lt,D){s.iv.forEach((p,i)=>{p.expr=lt>D*0.55?'happy':'neutral';pose(p,lt+i,'sit')});pose(s.J,lt,'talk');camMove([-2.8,2.2,4.6],[-2.3,2.1,3.9],[0,1.5,-1],[0,1.5,-1],lt/D);bub(s,s.J,2.05);fadeIn(s.b,lt,0.2);popIn(s.ok,lt,D*0.55)}},
 {setup(s){A.campus();s.C=person(Object.assign({},CHAD,{expr:'worried'}));s.J=person(Object.assign({},JAKE,{expr:'happy'}));s.C.g.position.set(-1,0,1);s.J.g.position.set(1,0,1);A.scene.add(s.C.g);A.scene.add(s.J.g);
   s.r=el('card','<div style="padding:22px 30px;font-family:DejaVu Sans Mono;font-size:34px;line-height:1.45;text-align:center;background:#fff;border-radius:8px;border-top:6px dashed #ccc"><b>RECEIPT</b><br>Interview course ..... $500.00<br><span style="color:#d62828;font-weight:900">NO REFUNDS</span></div>',{left:'120px',top:'300px',width:'560px',transform:'rotate(4deg)'});
   s.l3=el('chip','OFFER ✓',{left:'640px',top:'1150px',background:'#16a06a',fontSize:'56px'})},
  frame(s,lt,D){pose(s.C,lt,'idle');s.C.armR.rotation.x=-1.2;pose(s.J,lt,lt>0.8?'fist':'idle');camMove([0,1.9,9],[0,1.7,7.4],[0,1.4,1],[0,1.4,1],lt/D);popIn(s.l3,lt,0.6);popIn(s.r,lt,D*0.45,0.35,'rotate(4deg)')}},
 {setup(s){endCard(s,'Jake and Chad are')},frame:endFrame}
];
