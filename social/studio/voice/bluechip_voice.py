"""BlueChip brand voices: free, local, ours. Usage: python bluechip_voice.py announcer "text" out.wav"""
import sys, subprocess, tempfile, os
sys.path.insert(0, os.path.dirname(__file__))
from say import say
VOICES={
 # name: (kokoro blend, speed, ffmpeg post-chain)
 'announcer':('am_fenrir:0.5,am_michael:0.3,am_puck:0.2',1.08,
   'asetrate=24000*0.955,aresample=44100,atempo=1.047,highpass=f=70,equalizer=f=180:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=4,acompressor=threshold=-20dB:ratio=4:attack=5:release=80:makeup=6,alimiter=limit=0.95'),
 'maya':('af_heart:0.6,af_bella:0.4',1.05,
   'aresample=44100,highpass=f=90,equalizer=f=3000:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:makeup=4,alimiter=limit=0.95'),
 'rico':('am_michael:0.6,am_onyx:0.4',1.0,
   'asetrate=24000*0.97,aresample=44100,atempo=1.03,equalizer=f=150:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=3:makeup=4,alimiter=limit=0.95'),
}
def speak(voice,text,out):
    blend,speed,chain=VOICES[voice]
    raw=tempfile.mktemp(suffix='.wav');say(text,blend,raw,speed)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-af',chain,'-ac','1',out],check=True);os.remove(raw)
if __name__=='__main__': speak(sys.argv[1],sys.argv[2],sys.argv[3])
