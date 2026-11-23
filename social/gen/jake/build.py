# python build.py chad|coffee  -> /home/user/jake2/<story>.mp4
import sys,json,subprocess,numpy as np,soundfile as sf
st=sys.argv[1];B='/home/user/jake2';SR=44100
L=json.load(open(f'{B}/{st}/lines.json'))
TEMPO={'chad':1.1}.get(st,1.0);GAP={'chad':0.12}.get(st,0.55)
import os
os.makedirs(f'{B}/{st}/vof',exist_ok=True)
for i in range(len(L)):
    src=f'{B}/{st}/vo/l{i+1}.wav';dst=f'{B}/{st}/vof/l{i+1}.wav'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-af',f'atempo={TEMPO}','-ar','44100',dst],check=True)
dur=[sf.info(f'{B}/{st}/vof/l{i+1}.wav').duration for i in range(len(L))]
TL=[];t=0;VO=[]
for i,(x,_) in enumerate(L):
    a=t;v=a+0.2;d=dur[i]+GAP+((1.3 if st=='chad' else 1.8) if i==len(L)-1 else 0);TL.append({'a':round(a,3),'b':round(a+d,3),'cap':'' if i==len(L)-1 else x.replace('M and A','M&A').replace('A M','AM')});VO.append(v);t=a+d
json.dump(TL,open(f'{B}/eng/tl_{st}.json','w'));END=t
subprocess.run(['node',f'{B}/eng/render.js',f'{st}.js',f'{B}/eng/tl_{st}.json',f'{B}/{st}/frames'],check=True,cwd=f'{B}/eng')
N=int((END+0.2)*SR);tt=np.arange(N)/SR;rng=np.random.default_rng(5)
# lo-fi bed: soft chords (Am-F-C-G), kick + hat, 84 bpm
bpm=84;bt=60/bpm;mus=np.zeros(N)
chords=[[220,261.6,329.6],[174.6,220,261.6],[261.6,329.6,392],[196,246.9,293.7]]
for k in range(int(END/(bt*4))+2):
    c=chords[k%4];a=int(k*bt*4*SR);n=int(bt*4*SR)
    if a>=N:break
    x=np.arange(n)/SR;env=np.exp(-x*0.9)*0.9+0.1
    seg=sum(np.sin(2*np.pi*f*x)+0.3*np.sin(4*np.pi*f*x) for f in c)*env*0.06;e=min(N,a+n);mus[a:e]+=seg[:e-a]
for k in range(int(END/bt)+2):
    a=int(k*bt*SR);x=np.arange(int(.25*SR))/SR
    if a>=N:break
    if k%2==0:kk=np.sin(2*np.pi*(55+60*np.exp(-x*30))*x)*np.exp(-x*12)*0.5
    else:kk=rng.standard_normal(len(x))*np.exp(-x*40)*0.08
    e=min(N,a+len(kk));mus[a:e]+=kk[:e-a]
    h=int((k+0.5)*bt*SR);hx=rng.standard_normal(int(.05*SR))*np.exp(-np.arange(int(.05*SR))/SR*90)*0.05;e=min(N,h+len(hx));mus[h:e]+=hx[:e-h]
vo=np.zeros(N)
for i,v in enumerate(VO):
    x,sr=sf.read(f'{B}/{st}/vof/l{i+1}.wav');x=x[:,0] if x.ndim>1 else x;a=int(v*SR);e=min(N,a+len(x));vo[a:e]+=x[:e-a]
sfx=np.zeros(N)
def add(sig,at,g=1):
    a=int(at*SR);e=min(N,a+len(sig));sfx[a:e]+=g*sig[:e-a]
def whoosh():
    n=int(.35*SR);x=np.arange(n)/SR;w=rng.standard_normal(n);w=np.convolve(w,np.ones(30)/30,'same');return w*np.sin(np.pi*x/.35)**2*0.25
def ding(f=1320):x=np.arange(int(.6*SR))/SR;return (np.sin(2*np.pi*f*x)+0.4*np.sin(2*np.pi*f*2*x))*np.exp(-x*6)*0.25
def buzz():x=np.arange(int(.5*SR))/SR;return np.sign(np.sin(2*np.pi*110*x))*np.exp(-x*3)*0.15
def pop():x=np.arange(int(.12*SR))/SR;return np.sin(2*np.pi*(600+900*np.exp(-x*40))*x)*np.exp(-x*30)*0.3
for s in TL[1:]:add(whoosh(),s['a']-0.12)
EV={'chad':{0:[(0.9,'pop')],1:[(0.7,'ding')],2:[(-0.62,'pop')],6:[(-0.7,'buzz')],7:[(0.4,'pop')],8:[(-0.55,'ding')],9:[(0.6,'ding'),(-0.45,'pop')]},
    'coffee':{2:[(0.15+0.5*k,'ding') for k in range(3)],3:[(0.3,'pop')],6:[(-0.55,'buzz')],8:[(0.2,'pop')],9:[(0.5,'ding'),(-0.55,'pop')]}}[st]
for i,evs in EV.items():
    for at,kind in evs:add({'pop':pop,'ding':ding,'buzz':buzz}[kind](),TL[i]['a']+(at if at>=0 else -at*(TL[i]['b']-TL[i]['a'])))
env=np.convolve((np.abs(vo)>0.02).astype(float),np.ones(int(.2*SR))/int(.2*SR),'same');duck=1-0.6*np.clip(env*3,0,1)
mix=vo/(np.abs(vo).max()+1e-9)*0.9+mus*duck*0.9+sfx
fade=np.clip((END+0.2-tt)/1.0,0,1);mix*=np.minimum(1,fade+0.0)
sf.write(f'{B}/{st}/mix_raw.wav',np.stack([mix,mix],1).astype(np.float32),SR)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{B}/{st}/mix_raw.wav','-af','loudnorm=I=-14:TP=-1.5:LRA=11','-ar','44100',f'{B}/{st}/mix.wav'],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','30','-i',f'{B}/{st}/frames/%05d.jpg','-i',f'{B}/{st}/mix.wav','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{B}/{st}.mp4'],check=True)
print('done',st,round(END,1),'s')
