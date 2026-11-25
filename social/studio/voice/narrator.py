"""M&A Prep narrator voice (Variant B): built from the owner's own recording, +1 semitone, ~10% slower.
Usage: python narrator.py "text" out.wav [energy 0.4-0.9]
Pipeline: Chatterbox clone of refs/narrator_ref.wav -> best of 3 takes (word-accurate, most natural) -> light polish -> Variant B shift."""
import sys, os, subprocess, json
sys.argv_in = sys.argv[1:]; sys.argv = ['x']
code = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'humanize.py')).read()
exec(code[:code.index("if __name__")])
VOICE_B = dict(rate=1.059, tempo=round(0.9/1.059, 4))   # +1 semitone, ~10% slower
def narrate(text, out, energy=0.6):
    raw = out.replace('.wav', '_raw.wav')
    best, _ = best_of(text, os.path.join(D, 'refs/narrator_ref.wav'), energy, 0.45, raw, 1)
    if best['wer'] > 0.12:   # retry once if words came out wrong
        best, _ = best_of(text, os.path.join(D, 'refs/narrator_ref.wav'), energy, 0.45, raw, 1)
    chain = (f"aresample=44100,highpass=f=65,acompressor=threshold=-22dB:ratio=2:attack=10:release=120:makeup=3,"
             f"asetrate=44100*{VOICE_B['rate']},aresample=44100,atempo={VOICE_B['tempo']},alimiter=limit=0.95")
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-af',chain,'-ac','1',out], check=True)
    print(json.dumps({'out': out, 'words_ok': best['wer'] <= 0.05, 'wer': best['wer'], 'pitch_spread': best['spread']}))
if __name__ == '__main__':
    t, o = sys.argv_in[0], sys.argv_in[1]
    narrate(t, o, float(sys.argv_in[2]) if len(sys.argv_in) > 2 else 0.6)
