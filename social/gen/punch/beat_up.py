# Upbeat pop/house beat: 4-on-the-floor kick, claps on 2&4, offbeat open hats, bouncy offbeat bass, bright major chord plucks (I-V-vi-IV), whooshes, riser + drop, typing clicks.
import sys, json, numpy as np, soundfile as sf
J = json.load(open(sys.argv[1])); SR = 44100; B = J["BEAT"]; END = J["END"]; N = int(END * SR) + SR // 2
out = np.zeros(N); rng = np.random.default_rng(5); tt = lambda n: np.arange(n) / SR
def add(x, at, g=1.0):
    s = int(at * SR); e = min(N, s + len(x))
    if 0 <= s < N: out[s:e] += g * x[:e - s]
def kick(): n=int(.22*SR); t=tt(n); return np.sin(2*np.pi*(55+120*np.exp(-t*45))*t)*np.exp(-t/.1)
def clap():
    n=int(.18*SR); t=tt(n); x=rng.standard_normal(n); env=np.exp(-t/.05)
    for d in (.0,.011,.022): env+=np.exp(-np.clip(t-d,0,None)/.006)*(t>=d)*.6
    return x*env*.35
def ohat(): n=int(.12*SR); x=np.diff(rng.standard_normal(n+1)); return x*np.exp(-tt(n)/.05)*.2
def pluck(f,d): n=int(d*SR); t=tt(n); w=sum(np.sin(2*np.pi*f*h*t)/h for h in (1,2,3,4)); return w*np.exp(-t/.18)*.09
def bass(f,d): n=int(d*SR); t=tt(n); return np.tanh(1.8*np.sin(2*np.pi*f*t))*np.exp(-t/.12)*np.minimum(1,t/.004)*.5
C=[[261.6,329.6,392.0],[196.0,246.9,293.7],[220.0,261.6,329.6],[174.6,220.0,261.6]]; BS=[65.4,49.0,55.0,43.65]
roll, rev = J["ROLL"], J["T"][0]
for b in range(int(END/B)+1):
    at=b*B; bar,pos=divmod(b,4)
    if roll<=at<rev: continue
    add(kick(),at,.85)
    if pos in (1,3): add(clap(),at,.8)
    add(ohat(),at+B/2,1)
    add(bass(BS[bar%4],B*.45),at+B/2,1)
    for s in (0,.75*B) if pos in (0,2) else (.5*B,):
        for f in C[bar%4]: add(pluck(f*2,B*.6),at+s,1)
for at in J.get("cuts",[]):
    n=int(.25*SR); x=np.convolve(rng.standard_normal(n),np.ones(25)/25,"same")*np.sin(np.pi*tt(n)/.25)**2; add(x,at-.08,.35)
for c in J.get("clicks",[]):
    n=int(.015*SR); add(np.diff(rng.standard_normal(n+1))*np.exp(-tt(n)/.003)*.13,c,1)
n=int((rev-roll)*SR)
if n>0:
    t=tt(n); add(rng.standard_normal(n)*(t/t[-1])**2*.25,roll); add(np.sin(2*np.pi*(300+1500*(t/t[-1])**2)*t)*(t/t[-1])*.15,roll)
n=int(1.4*SR); t=tt(n); add(np.sin(2*np.pi*(45+90*np.exp(-t*10))*t)*np.exp(-t/.45)+rng.standard_normal(n)*np.exp(-t/.07)*.5,rev,1)
f=int(.5*SR); out[-f:]*=np.linspace(1,0,f); out=np.tanh(out*1.4); out=out/np.abs(out).max()*.89
sf.write(sys.argv[2],np.stack([out,out],1).astype(np.float32),SR)
