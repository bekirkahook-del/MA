/* Pitch Room: pitch a (fictional) stock to a room of 30, then get grilled. Opened from the Stock Pitch and Superday level briefings.
   1) Build: price target + upside math, pick the strongest thesis points, variant view and catalyst.
   2) Deliver: 3-minute timer, six sections, a 30-seat room. The room reacts to YOUR PACING AND STRUCTURE (it cannot hear you).
   3) Grill: 5 questions from the room, 2 with numbers on your case, 3 judgment questions with a model answer and a checklist.
   Does not touch scoring, XP or stars. Nothing is sent anywhere. */
(function(){
"use strict";
if(typeof openPanel!=="function"||typeof showBrief!=="function"||!window.MA_PITCH||!window.MAPractice)return;
const D=window.MA_PITCH,n=D.n,E=s=>typeof esc==="function"?esc(s):String(s);
const parse=MAPractice.parse,$=id=>document.getElementById(id);
const fm=(x,u)=>u==="$"?"$"+n(x):u==="%"?n(x)+"%":u==="x"?n(x)+"x":n(x);

const st=document.createElement("style");
st.textContent=`
.pt-case{border-left:3px solid var(--cobalt,#2448D8);background:var(--sheet-2,#f4f6fa);padding:10px 12px;border-radius:3px;font-size:14px;line-height:1.5;margin:8px 0}
.pt-kv{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:6px;font:600 13px var(--mono,monospace)}
.pt-opt{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1.5px solid var(--rule,#d9dde6);border-radius:6px;margin:6px 0;cursor:pointer;font-size:14px;line-height:1.4}
.pt-opt input{margin-top:3px}.pt-opt.on{border-color:var(--cobalt,#2448D8);background:rgba(36,72,216,.05)}
.pt-opt.good{border-color:var(--good,#1b8a4b);background:rgba(27,138,75,.07)}.pt-opt.bad{border-color:var(--bad,#b3261e);background:rgba(179,38,30,.06)}
.pt-why{font-size:12.5px;color:var(--ink-2,#5b6577);margin-top:3px}
.pt-clock{font:700 46px var(--mono,monospace);text-align:center;margin:2px 0}.pt-clock.over{color:var(--bad,#b3261e)}
.pt-seats{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin:8px 0}
.pt-seat{height:15px;border-radius:3px;background:var(--cobalt,#2448D8);transition:background .4s,opacity .4s}
.pt-seat.lost{background:var(--rule,#c8cdd8);opacity:.7}
.pt-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.pt-chip{font-size:12px;padding:4px 9px;border-radius:99px;border:1.5px solid var(--rule,#d9dde6);color:var(--ink-2,#5b6577)}
.pt-chip.cur{border-color:var(--cobalt,#2448D8);color:var(--cobalt,#2448D8);font-weight:700}.pt-chip.done{background:var(--sheet-2,#f4f6fa);text-decoration:line-through}
.pt-notes{font-size:13.5px;line-height:1.5;margin:6px 0}.pt-notes li{margin:3px 0}
.pt-ta{width:100%;min-height:78px;padding:10px;border:1.5px solid var(--rule,#d9dde6);border-radius:4px;font:14px/1.45 inherit;background:var(--sheet,#fff);color:var(--ink,#13203B);box-sizing:border-box}
.pt-who{font:600 12px var(--mono,monospace);color:var(--cobalt,#2448D8);text-transform:uppercase;letter-spacing:.05em}
.pt-score{font:700 46px var(--mono,monospace);margin:4px 0 0}
.pt-row{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:8px 0;border-bottom:1px solid var(--rule,#d9dde6);font-size:14px}
.pt-row small{grid-column:1/-1;color:var(--ink-2,#5b6577)}`;
document.head.appendChild(st);

function open(tr,i){
  const c=D.gen(),S=D.SECTORS[c.key],R={math:0,thesis:0,vc:0,seats:0,lost:0,qa:[],secT:[]};
  const back=()=>tr&&tr.levels&&tr.levels[i]?showBrief(tr,i):closePanel();
  const head=t=>`<div class="label">Pitch Room${tr?" · "+E(tr.name):""}</div><h2 style="margin:4px 0 6px">${t}</h2>`;
  const caseCard=()=>`<div class="pt-case"><b>${E(c.co)}</b> <span style="color:var(--ink-2,#5b6577)">(fictional)</span> ${E(c.blurb)}
    <div class="pt-kv"><span>Price $${n(c.P)}</span><span>Next-year EPS $${n(c.E)}</span><span>Trades at ${c.m0}x</span><span>Peers at ${c.peer}x</span></div></div>`;

  /* ---- 1) the number ---- */
  function s1(){
    openPanel(head("Lead with the number")+`<p class="note" style="margin:0 0 4px">You will pitch this to a room of 30 in 3 minutes. First, the math you open with.</p>${caseCard()}
      <p style="margin:6px 0 4px"><b>You say it should trade at the peer multiple.</b></p>
      <div class="rp-row"><span class="rp-u">$</span><input id="ptA" class="rp-in" inputmode="decimal" autocomplete="off" aria-label="Price target"><span style="font-size:13px">price target (peer multiple × EPS)</span></div>
      <div class="rp-row"><input id="ptB" class="rp-in" inputmode="decimal" autocomplete="off" aria-label="Upside percent"><span class="rp-u">%</span><span style="font-size:13px">upside from today's price</span></div>
      <div id="ptFb" aria-live="polite"></div>
      <div class="actions"><button class="btn" id="ptGo" type="button">Check</button><button class="ghost" id="ptQuit" type="button">Quit</button></div>`);
    $("ptQuit").onclick=back;$("ptA").focus();
    const go=()=>{
      const a=parse($("ptA").value),b=parse($("ptB").value);if(isNaN(a)||isNaN(b)){$("ptFb").innerHTML=`<div class="why">Type both numbers.</div>`;return}
      const okA=Math.abs(a-c.T)<=Math.max(0.1,c.T*0.01),okB=Math.abs(b-c.up)<=0.6;R.math=(okA?1:0)+(okB?1:0);
      $("ptA").classList.add(okA?"ok":"no");$("ptB").classList.add(okB?"ok":"no");
      $("ptFb").innerHTML=`<div class="why"><b>${R.math===2?"Both right.":"Check these."}</b> Target = ${c.peer} × $${n(c.E)} = <b>$${n(c.T)}</b>. Upside = (${n(c.T)} − ${n(c.P)}) ÷ ${n(c.P)} = <b>${n(c.up)}%</b>.<br>Open your pitch with: <i>"I'm long ${E(c.co)}, $${n(c.T)} target, ${Math.round(c.up)}% upside."</i></div>`;
      $("ptGo").textContent="Next";$("ptGo").onclick=s2};
    $("ptGo").onclick=go;[$("ptA"),$("ptB")].forEach(el=>el.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("ptGo").click()}}))}

  /* ---- 2) thesis picks ---- */
  const picks={};
  function s2(){
    const items=D.shuffle(S.good.map(x=>({t:x[0],w:x[1],g:1})).concat(S.bad.map(x=>({t:x[0],w:x[1],g:0}))));
    openPanel(head("Pick your 3 strongest thesis points")+`<p class="note" style="margin:0 0 4px">Three of these are strong, three are traps. A good point is specific and the market is missing it.</p>
      ${items.map((x,k)=>`<label class="pt-opt" data-k="${k}"><input type="checkbox" data-k="${k}"><span>${E(x.t)}<div class="pt-why" hidden></div></span></label>`).join("")}
      <div id="ptFb" aria-live="polite"></div>
      <div class="actions"><button class="btn" id="ptGo" type="button">Check</button></div>`);
    const boxes=[...document.querySelectorAll("#panel input[type=checkbox]")];
    boxes.forEach(b=>b.addEventListener("change",()=>{const on=boxes.filter(x=>x.checked);if(on.length>3)b.checked=false;boxes.forEach(x=>x.closest(".pt-opt").classList.toggle("on",x.checked))}));
    $("ptGo").onclick=()=>{
      const on=boxes.filter(x=>x.checked);if(on.length!==3){$("ptFb").innerHTML=`<div class="why">Pick exactly 3.</div>`;return}
      let gd=0,bd=0;boxes.forEach(b=>{const it=items[+b.dataset.k],lab=b.closest(".pt-opt"),w=lab.querySelector(".pt-why");w.hidden=false;w.textContent=(it.g?"Strong. ":"Weak. ")+it.w;lab.classList.remove("on");lab.classList.add(it.g?"good":"bad");if(b.checked){it.g?gd++:bd++}b.disabled=true});
      R.thesis=Math.max(0,gd-bd);picks.thesis=items.filter((it,k)=>boxes[k].checked).map(x=>x.t);picks.strong=items.filter(x=>x.g).map(x=>x.t);
      $("ptFb").innerHTML=`<div class="why"><b>${gd}/3 strong.</b> ${gd===3?"Those are your talking points.":"In the pitch, lead with the strong ones either way."}</div>`;
      $("ptGo").textContent="Next";$("ptGo").onclick=s3}}

  /* ---- 3) variant view + catalyst ---- */
  function s3(){
    const grp=(name,title,arr)=>`<p style="margin:12px 0 2px"><b>${title}</b></p>`+arr.map((x,k)=>`<label class="pt-opt" data-g="${name}" data-k="${k}"><input type="radio" name="${name}" value="${k}"><span>${E(x.t)}<div class="pt-why" hidden></div></span></label>`).join("");
    const V=D.shuffle(S.variant.map((x,k)=>({t:x[0],w:x[1],g:k===0}))),C=D.shuffle(S.catalyst.map((x,k)=>({t:x[0],w:x[1],g:k===0})));
    openPanel(head("Variant view and catalyst")+`<p class="note" style="margin:0 0 2px">Where is the market wrong, and what makes it notice?</p>${grp("v","Your variant view",V)}${grp("c","Your catalyst",C)}
      <div id="ptFb" aria-live="polite"></div><div class="actions"><button class="btn" id="ptGo" type="button">Check</button></div>`);
    $("ptGo").onclick=()=>{
      const vi=document.querySelector('#panel input[name=v]:checked'),ci=document.querySelector('#panel input[name=c]:checked');
      if(!vi||!ci){$("ptFb").innerHTML=`<div class="why">Pick one of each.</div>`;return}
      let pts=0;[["v",V,vi],["c",C,ci]].forEach(([g,arr,inp])=>{arr.forEach((it,k)=>{const lab=document.querySelector(`#panel [data-g=${g}][data-k="${k}"]`);const w=lab.querySelector(".pt-why");w.hidden=false;w.textContent=(it.g?"Strong. ":"Weak. ")+it.w;lab.classList.add(it.g?"good":"bad");lab.querySelector("input").disabled=true});if(arr[+inp.value].g)pts++});
      R.vc=pts;picks.variant=V.find(x=>x.g).t;picks.catalyst=C.find(x=>x.g).t;
      $("ptFb").innerHTML=`<div class="why"><b>${pts}/2.</b> Your card is ready. Next you deliver it. Say it out loud.</div>`;
      $("ptGo").textContent="Deliver the pitch";$("ptGo").onclick=s4}}

  /* ---- 4) deliver to the room ---- */
  function s4(){
    const SEC=D.SECTIONS,TOTAL=180,HARD=210;
    const order=D.shuffle(Array.from({length:30},(_,k)=>k));
    let started=false,t0=0,cur=0,secStart=0,timer=null,over=false;
    const rec=(k,t)=>{R.secT[k]=t};
    const pen=(t,tgt)=>{const q=t/tgt;return q<=1.25?0:Math.min(5,Math.round((q-1.25)*6))};
    const rush=(t,tgt)=>t<tgt*0.3?2:0;
    const lostNow=el=>{let l=0;R.secT.forEach((t,k)=>{l+=pen(t,SEC[k][1])+rush(t,SEC[k][1])});if(started&&!over)l+=pen(el,SEC[cur][1]);return Math.min(30,l)};
    const notes=()=>`<li><b>Recommendation:</b> Long ${E(c.co)}, $${n(c.T)} target, ${Math.round(c.up)}% upside.</li><li><b>Thesis:</b> ${(picks.thesis||[]).map(E).join(" · ")}</li><li><b>Variant view:</b> ${E(picks.variant||"")}</li><li><b>Catalyst:</b> ${E(picks.catalyst||"")}</li><li><b>Valuation:</b> ${c.peer}x peer multiple on $${n(c.E)} EPS. Bear case ${c.bm}x = $${n(c.bearP)}, ${n(c.down)}% loss.</li><li><b>Risks:</b> Name two things that break it and what limits each.</li>`;
    openPanel(head("The room")+`<div class="pt-clock" id="ptClock">3:00</div><div class="pt-seats" id="ptSeats">${Array.from({length:30},()=>`<span class="pt-seat"></span>`).join("")}</div>
      <div class="note" style="margin:0" id="ptRoom">30 of 30 still with you. This is a simulation from your pacing and structure. It cannot hear you.</div>
      <div class="pt-chips" id="ptChips">${SEC.map((s,k)=>`<span class="pt-chip" data-k="${k}">${s[0]} ${s[1]}s</span>`).join("")}</div>
      <div class="note" id="ptHint" style="margin:0 0 4px">${E(SEC[0][2])}</div>
      <details><summary style="cursor:pointer;color:var(--cobalt,#2448D8)">Your pitch card (speaking notes)</summary><ul class="pt-notes">${notes()}</ul></details>
      <div class="actions"><button class="btn" id="ptStart" type="button">Start the clock</button><button class="btn" id="ptNext" type="button" hidden>Next section →</button><button class="ghost" id="ptQuit" type="button">Quit</button></div>`);
    $("ptQuit").onclick=()=>{clearInterval(timer);back()};
    const paint=()=>{
      const el=started?(Date.now()-t0)/1000:0,left=TOTAL-el;
      const clk=$("ptClock");if(!clk){clearInterval(timer);return}
      clk.textContent=left>=0?Math.floor(left/60)+":"+String(Math.floor(left%60)).padStart(2,"0"):"+"+Math.floor(-left/60)+":"+String(Math.floor(-left%60)).padStart(2,"0")+" over";
      clk.classList.toggle("over",left<0);
      const lost=lostNow(started?(Date.now()-secStart)/1000:0);
      document.querySelectorAll("#ptSeats .pt-seat").forEach((s,k)=>s.classList.toggle("lost",order.indexOf(k)<lost));
      $("ptRoom").textContent=`${30-lost} of 30 still with you. Simulation from pacing and structure. It cannot hear you.`;
      document.querySelectorAll("#ptChips .pt-chip").forEach((ch,k)=>{ch.classList.toggle("cur",started&&k===cur);ch.classList.toggle("done",k<cur)});
      if(started){const t=(Date.now()-secStart)/1000,tg=SEC[cur][1];$("ptHint").textContent=t>tg*1.25?"Wrap up. The room is drifting.":SEC[cur][2]}
      if(started&&el>=HARD&&!over){over=true;finish(true)}};
    const finish=cut=>{
      clearInterval(timer);const t=(Date.now()-secStart)/1000;if(started&&R.secT[cur]==null)rec(cur,t);
      let skipped=0;for(let k=0;k<SEC.length;k++)if(R.secT[k]==null){skipped++}
      const lost=Math.min(30,lostNow(0)+skipped*4);R.lost=lost;R.seats=30-lost;R.skipped=skipped;R.cut=!!cut;
      s5(cut?"The chair cut you off at 3:30. Practice landing inside 3:00.":skipped?`You skipped ${skipped} section${skipped>1?"s":""}. Each one cost 4 seats.`:"")};
    $("ptStart").onclick=()=>{started=true;t0=Date.now();secStart=t0;$("ptStart").hidden=true;$("ptNext").hidden=false;timer=setInterval(paint,250);paint()};
    $("ptNext").onclick=()=>{
      rec(cur,(Date.now()-secStart)/1000);
      if(cur>=SEC.length-1){finish(false);return}
      cur++;secStart=Date.now();if(cur===SEC.length-1)$("ptNext").textContent="Finish pitch";paint()}}

  /* ---- 5) the grilling ---- */
  function s5(note){
    const Q=D.questions(c);let k=0;
    const next=()=>{k++;k>=Q.length?s6():ask()};
    const ask=()=>{
      const q=Q[k],seat=1+Math.floor(Math.random()*30);
      const top=`${head("Q&A: you are being grilled")}${k===0&&note?`<p class="note" style="margin:0 0 6px">${E(note)}</p>`:""}<div class="mk-top"><span>Question ${k+1} of ${Q.length}</span><span>Seat ${seat}</span></div><div class="pt-who">${E(q.asker)}</div><div class="q" style="margin:4px 0 8px">${E(q.q)}</div>`;
      if(q.type==="num"){
        openPanel(top+`<div class="rp-row">${q.unit==="$"?`<span class="rp-u">$</span>`:""}<input id="ptA" class="rp-in" inputmode="decimal" autocomplete="off" aria-label="Your answer">${q.unit==="x"?`<span class="rp-u">x</span>`:""}<button class="btn" id="ptGo" type="button">Answer</button></div><div id="ptFb" aria-live="polite"></div>`);
        $("ptA").focus();
        const go=()=>{const u=parse($("ptA").value);if(isNaN(u)){$("ptFb").innerHTML=`<div class="why">Type a number.</div>`;return}
          const ok=Math.abs(u-q.ans)<=q.tol;R.qa.push(ok?1:0);$("ptA").classList.add(ok?"ok":"no");
          $("ptFb").innerHTML=`<div class="why"><b>${ok?"Right.":"Not quite."}</b> ${ok?"":`The answer is <b>${fm(q.ans,q.unit)}</b>. `}${E(q.tip)}</div><ol class="rp-steps">${q.steps.map(s=>`<li><span>${E(s[0])}</span><span class="m">${E(s[1])}</span></li>`).join("")}</ol>`;
          $("ptGo").textContent="Next question";$("ptGo").onclick=next};
        $("ptGo").onclick=go;$("ptA").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("ptGo").click()}})}
      else{
        openPanel(top+`<textarea id="ptTa" class="pt-ta" placeholder="Say your answer out loud, or type it here. Nothing is saved or sent." aria-label="Your answer"></textarea>
          <div id="ptFb"></div><div class="actions"><button class="btn" id="ptGo" type="button">Show the model answer</button></div>`);
        $("ptTa").focus();
        $("ptGo").onclick=()=>{
          $("ptFb").innerHTML=`<p style="margin:10px 0 4px"><b>Did you cover these?</b></p>${q.points.map((p,j)=>`<label class="pt-opt"><input type="checkbox" data-j="${j}"><span>${E(p)}</span></label>`).join("")}<div class="pt-why" style="margin:6px 0">Model answer: ${E(q.model)}</div>`;
          $("ptTa").disabled=true;$("ptGo").textContent="Next question";
          $("ptGo").onclick=()=>{R.qa.push(document.querySelectorAll("#ptFb input:checked").length/q.points.length);next()}}}};
    ask()}

  /* ---- 6) scorecard ---- */
  function s6(){
    const nQ=R.qa.length||1,qa=R.qa.reduce((a,b)=>a+b,0)/nQ;
    const parts=[["The math",R.math/2*20,20,`${R.math}/2 right on target and upside`],["The pitch card",(R.thesis+R.vc)/5*20,20,`Thesis ${R.thesis}/3, variant + catalyst ${R.vc}/2`],["Delivery",R.seats/30*25,25,`${R.seats}/30 seats still with you${R.skipped?`, ${R.skipped} section${R.skipped>1?"s":""} skipped`:""}${R.cut?", cut off at 3:30":""}`],["Q&A",qa*35,35,`${Math.round(qa*100)}% of the points in the room's questions`]];
    const tot=Math.round(parts.reduce((a,p)=>a+p[1],0));
    const weak=parts.map(p=>[p[1]/p[2],p[0]]).sort((a,b)=>a[0]-b[0])[0][1];
    const tips={"The math":"Run Number reps on the Valuation levels until the target and upside take under 20 seconds.","The pitch card":"Reread the Stock Pitch lesson: a thesis is specific and the market is missing it.","Delivery":"Rehearse out loud with a timer. Recommendation in 20 seconds, and never skip risks.","Q&A":"Say the bear-case number before anyone asks. Practice 'what would make you wrong'."};
    const label=tot>=85?"Ready for the room.":tot>=70?"Close. One area is holding you back.":"Keep rehearsing. Run it again with a new company.";
    openPanel(head("Scorecard")+`<div class="pt-score">${tot}/100</div><p style="margin:2px 0 8px"><b>${label}</b></p>
      ${parts.map(p=>`<div class="pt-row"><span><b>${p[0]}</b></span><span class="m" style="font-family:var(--mono,monospace)">${Math.round(p[1])}/${p[2]}</span><small>${E(p[3])}</small></div>`).join("")}
      <p class="note" style="margin-top:10px"><b>Fix first: ${E(weak)}.</b> ${E(tips[weak])}</p>
      <div class="actions"><button class="btn" id="ptAgain" type="button">New company</button><button class="ghost" id="ptBack" type="button">Back</button></div>`);
    $("ptAgain").onclick=()=>open(tr,i);$("ptBack").onclick=back}

  s1()}

/* "Pitch Room" button on the Stock Pitch and Superday briefings */
const KEYS=["pm:2","ib:4"];
const _sb=window.showBrief;
window.showBrief=function(tr,i){
  _sb.apply(this,arguments);
  try{
    if(KEYS.indexOf(tr.id+":"+i)<0)return;
    const a=document.querySelector("#panel .actions");
    if(!a||!a.querySelector("#go")||a.querySelector("#ptBtn"))return;
    const b=document.createElement("button");b.className="ghost outline";b.id="ptBtn";b.type="button";b.textContent="Pitch Room";b.title="Pitch to a room of 30, then get grilled";
    b.onclick=()=>open(tr,i);(a.querySelector("#mlBtn")||a.querySelector("#rpBtn")||a.querySelector("#lsAgain")||a.querySelector("#go")).after(b)}catch(e){}};

window.MAPitch={open};
})();
