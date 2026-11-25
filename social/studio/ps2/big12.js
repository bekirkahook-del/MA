// Big 12 school fans: one portrait per shot (PS2 style, school colors, no logos)
import {A,THREE,person,pose,el,camMove} from './common.js';
const SCH=[['tcu','#4D1979','#FFFFFF','TCU'],['baylor','#154734','#FFB81C','BAYLOR'],['colorado','#1a1a1a','#CFB87C','CU'],['asu','#8C1D40','#FFC627','ASU'],
['byu','#002E5D','#FFFFFF','BYU'],['utah','#CC0000','#FFFFFF','UTAH'],['ttu','#CC0000','#111111','TTU'],['kansas','#0051BA','#E8000D','KU'],['arizona','#0C234B','#AB0520','UA'],
['houston','#C8102E','#FFFFFF','UH'],['cincy','#E00122','#111111','UC'],['ucf','#111111','#FFC904','UCF'],['isu','#C8102E','#F1BE48','ISU'],['kstate','#512888','#FFFFFF','K-STATE'],['okstate','#FF7300','#111111','OSU'],['wvu','#002855','#EAAA00','WVU']];
const SK=['#e0b48c','#a8714a','#f0c09a','#c98b63','#e8c3a0','#d9a882'],HR=['#2a1a12','#111','#c9a46a','#4a2f1d','#7a5a3a','#222'];
window.SHOTS=SCH.map(([id,c1,c2,ab],i)=>({setup(s){A.room(c1,'#222');A.scene.background=new THREE.Color(c1);
  const f=person({shirt:c1,sleeve:c1,pants:'#222',tie:c2,hair:HR[i%6],skin:SK[i%6],girl:i%3===1,hairStyle:i%3===1?'long':undefined,expr:'happy'});A.scene.add(f.g);s.f=f;
  const pen=A.textPlane([ab],{w:1.15,h:0.5,bg:c2,fg:c1==='#111111'&&c2==='#111111'?'#fff':c1,font:'bold 120px DejaVu Sans'});pen.position.set(0.95,2.55,0.25);pen.rotation.z=-0.25;s.f.armR.add?A.scene.add(pen):0;
  const st=A.box(0.04,1.1,0.04,'#ddd',0.42,2.1,0.25);},
 frame(s,lt,D){pose(s.f,lt,'idle');s.f.armR.rotation.z=-2.4;s.f.expr='happy';camMove([0.12,1.9,4.4],[0.12,1.9,4.4],[0.12,1.85,0],[0.12,1.85,0],0)}}));
