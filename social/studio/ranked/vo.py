import sys, os, subprocess, json
D='/home/user/voicelab'
sys.argv=['x']
code=open(D+'/humanize.py').read(); exec(code[:code.index("if __name__")])
L=json.load(open('lines.json'))
for i,(t,e) in enumerate(L,1):
    raw=f'vo/raw{i}.wav'; out=f'vo/l{i}.wav'
    best,_=best_of(t, D+'/refs/ref2_announcer.wav', e, 0.45, raw, 1)
    if best['wer']>0.12: best,_=best_of(t, D+'/refs/ref2_announcer.wav', e, 0.45, raw, 1)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-af','aresample=44100,highpass=f=65,acompressor=threshold=-22dB:ratio=2:attack=10:release=120:makeup=3,alimiter=limit=0.95','-ac','1',out],check=True)
    print(i, json.dumps({'wer':best['wer']}), flush=True)
