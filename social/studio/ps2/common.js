// shared helpers for the Jake stories
const A=window.API,{THREE,cam,person,pose,el,anchor,ease,back}=A;
export {A,THREE,cam,person,pose,el,anchor,ease,back};
export const JAKE={shirt:'#2e5bd8',pants:'#2a2f45',hair:'#4a2f1d'};
export const lerp=(a,b,k)=>a+(b-a)*k;
export function camMove(p0,p1,l0,l1,k){k=ease(k);cam.position.set(lerp(p0[0],p1[0],k),lerp(p0[1],p1[1],k),lerp(p0[2],p1[2],k));cam.lookAt(lerp(l0[0],l1[0],k),lerp(l0[1],l1[1],k),lerp(l0[2],l1[2],k))}
export const clampX=x=>Math.min(730,Math.max(350,x));
export function bub(s,P,dy=2.05){const a=anchor(P,dy);s.b.style.left=clampX(a.x)+'px';s.b.style.top=a.y+'px'}
export function popIn(e,lt,at,dur=0.32,base=''){const k=back((lt-at)/dur);e.style.opacity=lt<at?0:1;e.style.transform=base+` scale(${0.35+0.65*k})`}
export function fadeIn(e,lt,at){e.style.opacity=ease((lt-at)/0.25)}
export function desk(P0,screen,mode,{expr}={}){A.room();const d=A.deskWithScreen(0,0,screen);const P=person(Object.assign({},P0,expr?{expr}:{}));P.g.position.set(0,0,0.95);P.g.rotation.y=Math.PI;P.mode=mode;A.scene.add(P.g);return {d,P}}
export const deskCam=(lt,D,side=1)=>camMove([1.5*side,2.7,4.6],[1.1*side,2.5,3.6],[0,1.8,-0.3],[0,1.9,-0.3],lt/D);
export const screenCam=(lt,D)=>camMove([0,2.3,2.6],[0,2.15,1.3],[0,2.1,-0.3],[0,2.15,-0.3],Math.min(1,lt/(D*0.6)));
export function endCard(s,names){A.skyline();s.J=person(Object.assign({},JAKE,{shirt:'#f4f4f4',suit:'#1d2433',sleeve:'#1d2433',tie:'#c9a227',prop:'briefcase',expr:'happy'}));A.scene.add(s.J.g);
  s.e=el('end',`<div class="t">PRACTICE FREE · LINK IN BIO</div><img src="qr.png"><div class="u">mnaprep.com</div><div class="s">${names} fictional. AI voice.</div>`);s.e.style.opacity=0}
export function endFrame(s,lt,D){pose(s.J,lt);camMove([0,1.6,7],[0,1.5,6],[0,1.3,0],[0,1.3,0],lt/D);s.e.style.opacity=ease((lt-0.05)/0.25)}
/* bus interior with scenery sliding past the windows */
export function bus(){const S=A.scene;S.background=new THREE.Color('#9ccfee');A.lights({fog:false,sunI:1.8});A.floor('#5d6472');
  A.box(0.2,3,30,'#e8e3d4',-2.2,1.5,0);A.box(0.2,3,30,'#e8e3d4',2.2,1.5,0);A.box(5,0.2,30,'#ddd8c8',0,3,0);
  for(let z=-8;z<8;z+=1.6){A.box(0.21,1.0,1.2,'#9ccfee',-2.2,1.9,z).material=new THREE.MeshBasicMaterial({color:'#9ccfee'});A.box(0.21,1.0,1.2,'#9ccfee',2.2,1.9,z).material=new THREE.MeshBasicMaterial({color:'#9ccfee'})}
  for(let z=-6;z<6;z+=1.6)for(const x of [-1.3,1.3]){A.box(1.4,0.18,0.7,'#2f5d9e',x,0.75,z);if(!(x>0&&Math.abs(z-0.4)<0.1))A.box(1.4,0.9,0.16,'#2f5d9e',x,1.2,z+0.35)}
  A.box(0.06,0.06,30,'#c9c9c9',-0.9,2.6,0);A.box(0.06,0.06,30,'#c9c9c9',0.9,2.6,0);
  const out=new THREE.Group();S.add(out);for(let i=0;i<14;i++){const tr=new THREE.Group();tr.position.set(-4.5-Math.random()*2,0,-10+i*1.6);A.box(0.3,1.6,0.3,'#6b4429',0,0.8,0,tr);A.box(1.2,1.2,1.2,'#3f8f3a',0,2.0,0,tr);out.add(tr)}
  return out}
