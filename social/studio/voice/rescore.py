import sys,glob,os,re,numpy as np,librosa,jiwer
from faster_whisper import WhisperModel
asr=WhisperModel('small.en',device='cpu',compute_type='int8')
code=open('humanize.py').read()
exec(code[code.index('from num2words'):code.index('def best_of')])
print(norm("U S C and eighty-three"), norm("USC and 83"))
texts={'v3_ann1':"Michigan isn't even top three in the Big Ten... for Wall Street.",'v3_ann2':"And number one? U S C!",'v3_maya':"Rico! Anthropic just priced its IPO. Eighty-three bucks a share!",'v3_rico':"Eighty-three? The range was seventy to seventy-eight. Wall Street is starving."}
for k,t in texts.items():
    files=sorted(glob.glob(k+'_t*.wav'))+[k+'.wav']
    res=[(score(f,t),f) for f in files]
    for r,f in res: print(f, r['score'], r['wer'], r['spread'], '|', r['hyp'])
    best=max(res,key=lambda x:x[0]['score']);print('  BEST ->',best[1],best[0]['wer'])
    import shutil;shutil.copy(best[1],k+'_best.wav')
