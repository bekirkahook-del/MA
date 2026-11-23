/* 1:1 coaching (low profile for now, Bekir Nov 23, 2026): a footer link and #coaching open a small panel.
   Students join the waitlist for a mock with a junior/senior who landed an IB/PE/etc offer; those students apply to coach.
   Requests are stored through the feedback function (kind "coaching"). Price: $80 per 1-hour session, coach gets $50 (Bekir, Nov 23, 2026). No payments yet: waitlist only. */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const signedEmail=()=>{try{return MA_AUTH.session.user.email||""}catch(e){return ""}};
  async function send(type,fields){const A=window.MA_AUTH;let tok="";try{const s=A&&A.sb&&(await A.sb.auth.getSession()).data.session;tok=s?s.access_token:""}catch(e){}
    const text=Object.entries(fields).filter(([,v])=>v).map(([k,v])=>k+": "+v).join("\n");
    const r=await fetch("/.netlify/functions/feedback",{method:"POST",headers:{"Content-Type":"application/json",...(tok?{Authorization:"Bearer "+tok}:{})},
      body:JSON.stringify({kind:"coaching",reason:type,text,email:fields.Email||"",where:"coaching",page:location.pathname+location.hash})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Couldn't send. Try again.");return true}
  const inp=(id,label,ph,type)=>`<label class="note" for="${id}" style="display:block;margin:10px 0 4px">${label}</label><input id="${id}" type="${type||"text"}" maxlength="120" placeholder="${ph||""}" style="width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:10px 12px;border:1px solid var(--rule);border-radius:4px;background:var(--paper);color:var(--ink)">`;
  function open(tab){ev("coach_open");tab=tab||"student";const em=signedEmail();
    const body=tab==="student"?`
      <p class="sub"><b>1-hour session · $80.</b> A full mock interview with a junior or senior who already landed an offer in IB, PE or similar: real questions, follow-ups, honest feedback, and a written scorecard after. We're lining up coaches now. Join the list and we'll email you first.</p>
      ${inp("coF","Firm or group you're interviewing for","e.g. Evercore, Houlihan RX, PE on-cycle")}
      ${inp("coW","When is your interview?","e.g. first round in 2 weeks")}
      ${inp("coN","Anything specific to work on? (optional)","technicals, story, LBO test…")}
      ${em?"":inp("coE","Your email","you@school.edu","email")}
      <div class="actions"><button class="btn" id="coGo">Join the waitlist</button></div>`:`
      <p class="sub">Are you a junior or senior who landed an IB, PE, hedge fund, RX or consulting offer or internship? Run 1-hour mock interviews for students on your own schedule. <b>You earn $50 per session.</b> Tell us about you and we'll reach out.</p>
      ${inp("coF","Firm and group of your offer or internship","e.g. Moelis, TMT summer analyst")}
      ${inp("coT","Your school and year","e.g. Ohio State, senior")}
      ${inp("coL","LinkedIn URL","https://linkedin.com/in/…","url")}
      ${em?"":inp("coE","Your email","you@school.edu","email")}
      <div class="actions"><button class="btn" id="coGo">Apply to coach</button></div>`;
    openPanel(`<div class="label">1:1 coaching · early access</div><h2>${tab==="student"?"Mock interview with someone who landed the offer":"Coach students and earn $50 a session"}</h2>
      <div class="seg" role="group" aria-label="Who are you" style="margin:8px 0 6px"><button data-t="student" aria-pressed="${tab==="student"}">I'm a student</button><button data-t="coach" aria-pressed="${tab==="coach"}">I landed an offer</button></div>
      ${body}<p class="note" id="coM" role="status" aria-live="polite"></p>`);
    panel.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>open(b.dataset.t));
    const v=id=>((document.getElementById(id)||{}).value||"").trim();
    document.getElementById("coGo").onclick=async e=>{const m=document.getElementById("coM"),email=em||v("coE");
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){m.textContent="Add your email so we can reach you.";return}
      if(!v("coF")){m.textContent=tab==="student"?"Which firm or group?":"Which firm and group?";return}
      e.target.disabled=true;m.textContent="Sending…";
      try{const name=(window.S&&S.profile&&S.profile.name)||"";
        await send(tab==="student"?"student":"coach",tab==="student"?{Name:name,Email:email,Firm:v("coF"),When:v("coW"),Focus:v("coN"),School:(window.S&&S.profile&&S.profile.school)||""}:{Name:name,Email:email,Offer:v("coF"),SchoolYear:v("coT"),LinkedIn:v("coL")});
        ev(tab==="student"?"coach_waitlist":"coach_apply");
        panel.querySelector(".actions").remove();m.textContent=tab==="student"?"You're on the list. We'll email you when a coach is ready.":"Thanks. We'll be in touch soon."}
      catch(x){e.target.disabled=false;m.textContent=x.message}};
  }
  window.maCoaching=open;
  const link=()=>{const f=document.querySelector("footer");if(!f||f.querySelector(".co-link"))return;const b=document.createElement("button");b.type="button";b.className="fb-link co-link";b.textContent="1:1 coaching";b.onclick=()=>open();f.appendChild(b)};
  const hash=()=>{if(/^#coaching$/.test(location.hash))setTimeout(()=>open(),400)};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{link();hash()});else{link();hash()}
  addEventListener("hashchange",hash);
})();
