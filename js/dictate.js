/* In-app dictation for "Speak it" (interview practice). Uses the browser's speech recognition. */
(function(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let rec=null,btn=null;
  function label(on){if(btn&&btn.isConnected){btn.textContent=on?"⏹ Stop":"🎙 Start talking";btn.setAttribute("aria-pressed",on?"true":"false");btn.classList.toggle("on",on)}}
  function stop(){const r=rec;rec=null;if(r){try{r.onresult=r.onerror=r.onend=null;r.stop()}catch(e){}}label(false)}
  window.dictateOK=!!SR;
  window.dictateStop=stop;
  window.dictateBind=function(b,ta){
    if(!SR||!b||!ta)return;stop();btn=b;label(false);
    b.onclick=()=>{
      if(rec){stop();return}
      let base=ta.value?ta.value.replace(/\s+$/,"")+" ":"",fin="";
      let r;try{r=new SR();r.lang="en-US";r.continuous=true;r.interimResults=true}catch(e){return}
      r.onresult=e=>{let tmp="";fin="";for(let i=0;i<e.results.length;i++){const x=e.results[i];(x.isFinal?(fin+=x[0].transcript+" "):(tmp+=x[0].transcript))}
        ta.value=(base+fin+tmp).replace(/\s+/g," ").replace(/^\s+/,"");ta.dispatchEvent(new Event("input",{bubbles:true}))};
      r.onerror=e=>{const c=e&&e.error;if(c==="not-allowed"||c==="service-not-allowed"){stop();if(typeof toast==="function")toast("Mic is blocked. Allow it in your browser, or use your keyboard's dictation.")}};
      r.onend=()=>{if(rec===r){stop()}};
      rec=r;try{r.start();label(true)}catch(e){rec=null;label(false)}
    };
  };
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop()});
})();
