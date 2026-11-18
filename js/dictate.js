/* In-app dictation for "Speak it" (interview practice). Uses the browser's speech recognition.
   Keeps listening until you tap Stop (restarts itself if the browser closes the mic) and says why if it can't. */
(function(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let rec=null,btn=null,ta=null,want=false,acc="",fails=0,lastStart=0;
  const note=m=>{const el=document.getElementById("dictNote");if(el)el.textContent=m||""};
  const label=on=>{if(btn&&btn.isConnected){btn.textContent=on?"⏹ Stop":"🎙 Start talking";btn.setAttribute("aria-pressed",on?"true":"false");btn.classList.toggle("on",on)}};
  function kill(){const r=rec;rec=null;if(r){try{r.onresult=r.onerror=r.onend=null;r.abort()}catch(e){}}}
  function stop(msg){want=false;kill();label(false);note(msg||"")}
  const WHY={"not-allowed":"Mic is blocked. Allow it for this site in your browser settings, then try again.","service-not-allowed":"Mic is blocked. Allow it for this site in your browser settings, then try again.","audio-capture":"No microphone found.","network":"Voice needs an internet connection.","language-not-supported":"Voice isn't supported for this language."};
  function begin(){
    if(!want||!ta||!ta.isConnected){stop();return}
    let r;try{r=new SR();r.lang="en-US";r.continuous=true;r.interimResults=true}catch(e){stop("Voice isn't available in this browser. Use your keyboard's dictation.");return}
    const base=acc;
    r.onresult=e=>{fails=0;let fin="",tmp="";for(let i=0;i<e.results.length;i++){const x=e.results[i];(x.isFinal?(fin+=x[0].transcript+" "):(tmp+=x[0].transcript))}
      acc=(base+fin).replace(/\s+/g," ");
      ta.value=(base+fin+tmp).replace(/\s+/g," ").replace(/^\s+/,"");ta.dispatchEvent(new Event("input",{bubbles:true}));note("Listening…")};
    r.onerror=e=>{const c=e&&e.error;if(WHY[c]){stop(WHY[c]);if(typeof toast==="function")toast(WHY[c])}};
    r.onend=()=>{if(rec!==r)return;rec=null;if(!want)return;
      // the browser closes the mic after a pause; keep going unless it keeps closing instantly
      if(Date.now()-lastStart<1500){fails++}else fails=0;
      if(fails>=3){stop("The mic keeps closing. Check your browser's mic permission, or use your keyboard's dictation.");return}
      setTimeout(begin,200)};
    rec=r;lastStart=Date.now();
    try{r.start();label(true);note("Listening… allow the mic if your browser asks.")}catch(e){rec=null;stop("Couldn't start the mic: "+(e&&e.message||"try again"))}
  }
  window.dictateOK=!!SR;
  window.dictateStop=()=>stop();
  window.dictateBind=function(b,t){
    if(!SR||!b||!t)return;stop();btn=b;ta=t;label(false);
    b.onclick=ev=>{ev.preventDefault();ev.stopPropagation();
      if(want){stop();return}
      want=true;fails=0;acc=ta.value?ta.value.replace(/\s+$/,"")+" ":"";begin()};
  };
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&want)stop()});
})();
