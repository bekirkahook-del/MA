/* Pro toolkit: flashcards (free), weak-concept report, networking CRM, AI banker coach (Pro), +20 graded models */
(function(){
"use strict";
const NEW=[{"id": "c21", "t": "Margin analysis", "d": "Revenue $800. COGS $480. Operating expenses $160.", "pro": true, "cells": [["Gross profit", 320, "800 − 480", 1], ["Gross margin (%)", 40, "320 ÷ 800", 0.2], ["EBIT", 160, "320 − 160", 1], ["EBIT margin (%)", 20, "160 ÷ 800", 0.2]]}, {"id": "c22", "t": "Implied share price from a multiple", "d": "EBITDA $90. Trading multiple 9.0x. Debt $250. Cash $60. Diluted shares 40.", "pro": true, "cells": [["Enterprise value", 810, "90 × 9", 1], ["Equity value", 620, "810 − 250 + 60", 1], ["Implied share price", 15.5, "620 ÷ 40", 0.02]]}, {"id": "c23", "t": "Leverage and coverage", "d": "Total debt $420. Cash $70. EBITDA $100. Interest expense $35.", "pro": true, "cells": [["Net debt", 350, "420 − 70", 1], ["Total debt / EBITDA (x)", 4.2, "420 ÷ 100", 0.02], ["Net debt / EBITDA (x)", 3.5, "350 ÷ 100", 0.02], ["EBITDA / interest (x)", 2.86, "100 ÷ 35", 0.05]]}, {"id": "c24", "t": "Depreciation tax shield", "d": "Depreciation $60. Tax rate 25%. Pre-tax income before depreciation is $200.", "pro": true, "cells": [["Taxes with no depreciation", 50, "200 × 25%", 0.1], ["Taxes with depreciation", 35, "(200 − 60) × 25%", 0.1], ["Tax shield", 15, "60 × 25%", 0.1]]}, {"id": "c25", "t": "Depreciation methods", "d": "Equipment costs $1,000, 5-year life, no salvage. Compare straight-line with double-declining balance.", "pro": true, "cells": [["Straight-line, year 1", 200, "1,000 ÷ 5", 1], ["Double-declining rate (%)", 40, "2 ÷ 5", 0.1], ["Double-declining, year 1", 400, "1,000 × 40%", 1], ["Double-declining, year 2", 240, "(1,000 − 400) × 40%", 1]]}, {"id": "c26", "t": "Cash conversion cycle", "d": "Revenue $730. COGS $438. Receivables $100. Inventory $90. Payables $60. Use 365 days.", "pro": true, "cells": [["DSO (days)", 50, "100 ÷ 730 × 365", 0.2], ["DIO (days)", 75, "90 ÷ 438 × 365", 0.2], ["DPO (days)", 50, "60 ÷ 438 × 365", 0.2], ["Cash conversion cycle (days)", 75, "DSO + DIO − DPO", 0.5]]}, {"id": "c27", "t": "Perpetuity growth terminal value", "d": "Final-year free cash flow $100. Growth 3%. Discount rate 9%.", "pro": true, "cells": [["Next-year cash flow", 103, "100 × 1.03", 1], ["Terminal value", 1716.67, "103 ÷ (9% − 3%)", 1], ["PV of terminal value, 5 years out", 1115.72, "1,716.7 ÷ 1.09^5", 1]]}, {"id": "c28", "t": "Unlevering beta", "d": "Levered beta 1.30. Debt 30, equity 70, tax rate 25%. Then relever at a debt/equity of 0.50.", "pro": true, "cells": [["Debt / equity (x)", 0.43, "30 ÷ 70", 0.01], ["Unlevered beta", 0.98, "1.30 ÷ (1 + 0.75 × 0.4286)", 0.01], ["Relevered beta", 1.35, "Unlevered × (1 + 0.75 × 0.50)", 0.01]]}, {"id": "c29", "t": "Cost of equity (CAPM)", "d": "Risk-free rate 4.0%. Beta 1.2. Equity risk premium 5.5%. Size premium 1.0%.", "pro": true, "cells": [["Beta × risk premium (%)", 6.6, "1.2 × 5.5%", 0.05], ["CAPM cost of equity (%)", 10.6, "4.0% + 6.6%", 0.05], ["Cost of equity with size premium (%)", 11.6, "10.6% + 1.0%", 0.05]]}, {"id": "c30", "t": "WACC build", "d": "Equity value $600, debt $400. Cost of equity 11%. Pre-tax cost of debt 7%. Tax rate 25%.", "pro": true, "cells": [["Equity weight (%)", 60, "600 ÷ 1,000", 0.1], ["After-tax cost of debt (%)", 5.25, "7% × 0.75", 0.05], ["WACC (%)", 8.7, "60% × 11% + 40% × 5.25%", 0.05]]}, {"id": "c31", "t": "All-stock deal ownership", "d": "Acquirer earns $500 on 100 shares and trades at $40. Target offers a deal value of $1,200, paid all in acquirer stock.", "pro": true, "cells": [["New shares issued", 30, "1,200 ÷ 40", 0.1], ["Combined shares", 130, "100 + 30", 1], ["Acquirer ownership (%)", 76.92, "100 ÷ 130", 0.1]]}, {"id": "c32", "t": "Accretion: all-stock", "d": "Acquirer net income $500, 100 shares. Target net income $60. The deal issues 30 new shares. Ignore synergies.", "pro": true, "cells": [["Standalone EPS", 5, "500 ÷ 100", 0.02], ["Pro forma EPS", 4.31, "560 ÷ 130", 0.01], ["Accretion / dilution (%)", -13.85, "4.31 ÷ 5.00 − 1", 0.2]]}, {"id": "c33", "t": "Cash sweep, one year", "d": "Starting debt $400 at 8% interest. Cash flow before interest is $80 and all excess cash repays debt.", "pro": true, "cells": [["Interest expense", 32, "400 × 8%", 0.1], ["Debt repaid", 48, "80 − 32", 0.1], ["Ending debt", 352, "400 − 48", 1]]}, {"id": "c34", "t": "3-year returns", "d": "Sponsor invests $200 of equity and sells its stake for $500 after 3 years. No interim cash flows.", "pro": true, "cells": [["MOIC (x)", 2.5, "500 ÷ 200", 0.01], ["IRR (%)", 35.72, "2.5^(1/3) − 1", 0.3]]}, {"id": "c35", "t": "Doubling time", "d": "An investment compounds at 12% a year. Use the rule of 72 and compare it with the exact answer.", "pro": true, "cells": [["Rule of 72 (years)", 6, "72 ÷ 12", 0.05], ["Exact doubling time (years)", 6.12, "ln 2 ÷ ln 1.12", 0.05], ["Value of $100 after 6 years", 197.38, "100 × 1.12^6", 0.5]]}, {"id": "c36", "t": "Revolver draw", "d": "Beginning cash $20. Minimum cash $25. Cash flow before the revolver is −$30.", "pro": true, "cells": [["Cash before revolver", -10, "20 − 30", 0.1], ["Revolver draw", 35, "25 − (−10)", 0.1], ["Ending cash", 25, "Held at minimum", 0.1]]}, {"id": "c37", "t": "Goodwill calculation", "d": "Purchase price $900. Target book equity $500. Assets are written up by $150 and a new deferred tax liability of $60 is created. Existing goodwill is zero.", "pro": true, "cells": [["Adjusted net identifiable assets", 590, "500 + 150 − 60", 1], ["Goodwill created", 310, "900 − 590", 1]]}, {"id": "c38", "t": "Comps: median and implied value", "d": "Peer EV/EBITDA multiples: 8.2x, 9.5x, 10.1x, 11.4x, 12.0x. Target EBITDA is $75.", "pro": true, "cells": [["Median multiple (x)", 10.1, "Middle value", 0.1], ["Mean multiple (x)", 10.24, "Sum ÷ 5", 0.02], ["Implied EV at median", 757.5, "10.1 × 75", 1], ["Implied EV at mean", 768, "Mean × 75", 1]]}, {"id": "c39", "t": "Unlevered free cash flow bridge", "d": "EBIT $200. Tax rate 25%. D&A $40. Capex $50. Increase in net working capital $10.", "pro": true, "cells": [["NOPAT", 150, "200 × 75%", 1], ["Cash flow before reinvestment", 190, "150 + 40", 1], ["Unlevered free cash flow", 130, "190 − 50 − 10", 1]]}, {"id": "c40", "t": "Levered free cash flow", "d": "EBITDA $150. D&A $40. Interest $25. Tax rate 25%. Capex $30. No working capital change.", "pro": true, "cells": [["Pre-tax income", 85, "150 − 40 − 25", 0.1], ["Taxes", 21.25, "85 × 25%", 0.1], ["Levered free cash flow", 73.75, "150 − 25 − 21.25 − 30", 0.1], ["Cash conversion (% of EBITDA)", 49.17, "73.75 ÷ 150", 0.2]]}];
try{NEW.forEach(c=>{if(!CHAL.some(x=>x.id===c.id))CHAL.push(c)})}catch(e){console.error(e)}

const q$=s=>document.querySelector(s);
const nl=t=>esc(String(t||"")).replace(/\n/g,"<br>");
const INTERVALS=[1,3,7,14,30];
const ai=async(prompt,tier)=>{await samplePromise;if(!SAMPLE)throw new Error("signin");return SAMPLE.json(prompt,{modelTier:tier||"default"})};
const aiGate=(name)=>{if(!(window.MA_AUTH&&MA_AUTH.session)){toast("Make a free account to use "+name);window.maOpenAuth&&maOpenAuth("up");return false}return true};
const proGate=(why)=>{if(isPro())return true;upgrade(why);return false};

/* ---------- flashcards (free for everyone) ---------- */
function cardsFor(tid){const out=[];for(const tr of TRACKS){if(tid&&tr.id!==tid)continue;tr.levels.forEach(L=>L.q.forEach(q=>{if(q&&q[1]&&q[1][q[2]]!=null)out.push({k:qKey(q[0]),tr:tr.id,lv:L.n,q:q[0],a:q[1][q[2]],w:q[3]||""})}))}return out}
const fcState=()=>{S.fc=S.fc||{};S.fcs=S.fcs||{};return S.fc};
function deckInfo(tid){const st=fcState(),t=today(),cs=cardsFor(tid);let due=0,fresh=0;cs.forEach(c=>{const s=st[c.k];if(!s)fresh++;else if(s.d<=t)due++});return{n:cs.length,due,fresh}}
function flashHome(){
  const all=deckInfo(null);
  openPanel(`<div class="label">Flashcards</div><h2>${all.n.toLocaleString()} cards</h2><p class="sub">Every interview question as a card. Flip it, mark it, and missed cards come back after 1, 3, 7, 14 and 30 days.</p>
  <div class="opts">${[["",`All tracks`]].concat(TRACKS.map(t=>[t.id,t.name])).map(([id,nm])=>{const d=deckInfo(id||null);return `<button class="opt" data-deck="${id}"><span class="k">▸</span><span>${esc(nm)} <small style="opacity:.65">· ${d.n} cards · ${d.due} due · ${d.fresh} new</small></span></button>`}).join("")}</div>`);
  panel.querySelectorAll("[data-deck]").forEach(b=>b.onclick=()=>flashRun(b.dataset.deck||null))}
function flashRun(tid){
  const st=fcState(),t=today();let cs=cardsFor(tid);
  const due=cs.filter(c=>st[c.k]&&st[c.k].d<=t),fresh=cs.filter(c=>!st[c.k]);
  const shuf=a=>a.sort(()=>Math.random()-.5);
  const queue=shuf(due).slice(0,20).concat(shuf(fresh).slice(0,Math.max(0,20-Math.min(due.length,20))));
  if(!queue.length){openPanel(`<div class="label">Flashcards</div><h2>All caught up</h2><p class="sub">Nothing due in this deck. Come back tomorrow, or pick another track.</p><div class="actions"><button class="btn" id="fcBack">Pick another deck</button></div>`);q$("#fcBack").onclick=flashHome;return}
  let i=0,got=0;
  const draw=()=>{
    if(i>=queue.length){openPanel(`<div class="label">Flashcards</div><h2>${got} of ${queue.length} known</h2><p class="sub">${got===queue.length?"Clean sweep.":"Missed cards are scheduled to come back tomorrow."}</p><div class="actions"><button class="btn" id="fcMore">More cards</button><button class="ghost" id="fcDecks">Decks</button></div>`);q$("#fcMore").onclick=()=>flashRun(tid);q$("#fcDecks").onclick=flashHome;try{questEvt("review")}catch(e){}return}
    const c=queue[i];
    panel.innerHTML=`<button class="close" aria-label="Close">×</button><div class="q-meta"><span class="label">Flashcards · ${i+1}/${queue.length}</span></div><div class="vbar"><i style="width:${Math.round(i/queue.length*100)}%"></i></div><div class="label" style="margin-top:6px">${esc(c.lv)}</div><div class="q">${c.q}</div><div id="fcBack"></div><div class="actions" id="fcAct"><button class="btn" id="fcFlip">Show answer</button></div>`;
    bindClose();
    q$("#fcFlip").onclick=()=>{q$("#fcBack").innerHTML=`<div class="why"><b>${c.a}</b>${c.w?`<br>${c.w}`:""}</div>`;q$("#fcAct").innerHTML=`<button class="btn" id="fcOk">Got it</button><button class="ghost" id="fcNo">Missed it</button>`;q$("#fcOk").onclick=()=>mark(c,true);q$("#fcNo").onclick=()=>mark(c,false)};
  };
  const mark=(c,ok)=>{const s=st[c.k]||(st[c.k]={b:0,d:t});const x=S.fcs[c.k]||(S.fcs[c.k]={r:0,w:0});
    if(ok){x.r++;got++;s.b=Math.min(INTERVALS.length-1,(s.b||0)+1);s.d=addDaysKey(INTERVALS[s.b])}else{x.w++;s.b=0;s.d=addDaysKey(1)}
    s.seen=1;save();i++;draw()};
  draw()}

/* ---------- weak-concept report (Pro) ---------- */
function weakRows(){const qs=S.qstat||{},fs=S.fcs||{},rows=[];
  for(const tr of TRACKS)tr.levels.forEach(L=>{let qr=0,qw=0,fr=0,fw=0;L.q.forEach(q=>{const k=qKey(q[0]),a=qs[k],b=fs[k];if(a){qr+=a.r||0;qw+=a.w||0}if(b){fr+=b.r||0;fw+=b.w||0}});
    const n=qr+qw+fr+fw;if(n<3)return;const acc=(qr+fr)/n;
    rows.push({tr:tr.name,lv:L.n,qa:qr+qw?Math.round(qr/(qr+qw)*100):null,fa:fr+fw?Math.round(fr/(fr+fw)*100):null,n,acc,L})});
  return rows.sort((a,b)=>(a.acc-b.acc)||(b.n-a.n))}
function weakReport(){
  if(!proGate("The weak-concept report is part of Pro"))return;
  const rows=weakRows(),top=rows.slice(0,8),solved=Object.keys(S.models||{}).length,due=(typeof dueReviews==="function"?dueReviews().length:0);
  const tag=a=>a<60?"Weak":a<80?"Shaky":"Solid";
  openPanel(`<div class="label">Weak-concept report</div><h2>${top.length?"Where you're losing points":"Not enough data yet"}</h2>
   <p class="sub">${top.length?"Built from your quiz answers and flashcards, grouped by concept. Fix the top rows first.":"Answer a few quiz questions and flashcards, then come back. A concept shows up after 3 answers."}</p>
   ${top.length?`<div class="wk">${top.map(r=>{const p=Math.round(r.acc*100),col=p<60?"#e5484d":p<80?"#f5a524":"#30a46c";return `<div class="wk-r"><div class="wk-t"><b>${esc(r.lv)}</b><span>${esc(r.tr)} · ${r.n} answers · ${tag(p)}</span></div><div class="vbar big"><i style="width:${Math.max(4,p)}%;background:${col}"></i></div><em>${p}%</em></div>`}).join("")}</div>`:""}
   <p class="note">Modeling challenges solved: ${solved} of ${CHAL.length}. Review queue: ${due} due.</p>
   <div class="actions">${top.length?`<button class="btn" id="wkDrill">Drill my top 3</button>`:""}<button class="ghost" id="wkCards">Open flashcards</button></div>`);
  panel.classList.add("wide");
  const dr=q$("#wkDrill");if(dr)dr.onclick=()=>{const qs=[];top.slice(0,3).forEach(r=>r.L.q.forEach(q=>{const k=qKey(q[0]),a=(S.qstat||{})[k],b=(S.fcs||{})[k];if((a&&a.w)||(b&&b.w))qs.push(q)}));const pick=qs.sort(()=>Math.random()-.5).slice(0,10);if(pick.length<3){toast("Answer a few more questions first");return}quiz({title:"Weak spots",qs:pick,finish:c=>`<h2>${c} of ${pick.length} correct</h2><p>Reopen the report to see how these concepts moved.</p>`})};
  q$("#wkCards").onclick=flashHome}

/* ---------- networking CRM (Pro) ---------- */
const STAGES_N=["Reached out","Replied","Call booked","Call done","Thank-you sent","Referral / intro"];
const ncrm=()=>{S.ncrm=S.ncrm||[];return S.ncrm};
function crmHome(){
  if(!proGate("The networking CRM is part of Pro"))return;
  const t=today(),list=ncrm().slice().sort((a,b)=>(a.next||"9999").localeCompare(b.next||"9999"));
  openPanel(`<div class="label">Networking CRM</div><h2>${list.length} contact${list.length===1?"":"s"}</h2><p class="sub">Track who you've reached out to and when to follow up. Overdue follow-ups sit at the top.</p>
   <div class="actions"><button class="btn" id="ncAdd">Add contact</button></div>
   <div class="tbl-wrap"><table class="cmp"><thead><tr><th>Name</th><th>Stage</th><th>Follow up</th><th></th></tr></thead><tbody>${list.map(c=>`<tr><td><b>${esc(c.name)}</b><br><small style="opacity:.65">${esc([c.role,c.firm].filter(Boolean).join(" · "))}</small></td><td>${esc(c.stage)}</td><td>${c.next?(c.next<=t?`<b>Overdue · ${esc(c.next)}</b>`:esc(c.next)):"–"}</td><td><button class="ghost sm" data-ed="${c.id}">Open</button></td></tr>`).join("")||`<tr><td colspan="4">No contacts yet. Add the first alum or analyst you want to talk to.</td></tr>`}</tbody></table></div>`);
  panel.classList.add("wide");q$("#ncAdd").onclick=()=>crmEdit(null);panel.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>crmEdit(b.dataset.ed))}
function crmEdit(id){
  const c=id?ncrm().find(x=>x.id===id):{id:"n"+Date.now().toString(36),name:"",firm:"",role:"",stage:STAGES_N[0],next:addDaysKey(7),notes:""};if(!c)return;
  openPanel(`<div class="label">${id?"Edit contact":"New contact"}</div><h2>${id?esc(c.name):"Add contact"}</h2>
   <div class="sheet">${[["name","Name"],["firm","Firm"],["role","Role (e.g. Analyst, alum)"]].map(([k,l])=>`<div class="sh-row"><span class="sh-l">${l}</span><input class="sh-in" id="nc_${k}" value="${esc(c[k])}" autocomplete="off"></div>`).join("")}
   <div class="sh-row"><span class="sh-l">Stage</span><select class="sh-in" id="nc_stage">${STAGES_N.map(s=>`<option ${s===c.stage?"selected":""}>${s}</option>`).join("")}</select></div>
   <div class="sh-row"><span class="sh-l">Follow up on</span><input class="sh-in" type="date" id="nc_next" value="${esc(c.next||"")}"></div>
   <div class="sh-row"><span class="sh-l">Notes</span><input class="sh-in" id="nc_notes" value="${esc(c.notes)}" autocomplete="off"></div></div>
   <div class="actions"><button class="btn" id="ncSave">Save</button><button class="ghost" id="ncDraft">Draft a follow-up (AI)</button>${id?`<button class="ghost" id="ncDel">Delete</button>`:""}<button class="ghost" id="ncBack">Back</button></div><div id="ncOut"></div>`);
  const read=()=>{["name","firm","role","notes"].forEach(k=>c[k]=q$("#nc_"+k).value.trim());c.stage=q$("#nc_stage").value;c.next=q$("#nc_next").value};
  q$("#ncSave").onclick=()=>{read();if(!c.name){toast("Add a name first");return}const L=ncrm();if(!L.some(x=>x.id===c.id))L.push(c);save();crmHome()};
  q$("#ncBack").onclick=crmHome;
  const d=q$("#ncDel");if(d)d.onclick=()=>{S.ncrm=ncrm().filter(x=>x.id!==c.id);save();crmHome()};
  q$("#ncDraft").onclick=async()=>{read();if(!aiGate("AI drafts"))return;const out=q$("#ncOut");out.innerHTML=`<p class="note">Drafting…</p>`;
    try{const r=await ai(`Write a short, polite networking email from a college student recruiting for finance to ${c.name||"a contact"}${c.role?" ("+c.role+")":""}${c.firm?" at "+c.firm:""}. Current stage: ${c.stage}. Notes: ${c.notes||"none"}. Rules: under 110 words, no flattery, one clear ask (a 15-minute call, or a thank-you if the call is done). Do NOT invent shared experiences; use [brackets] for anything the student must fill in. Return JSON {"subject":string,"body":string}.`,"quick");
      out.innerHTML=`<div class="why"><b>${esc(r.subject||"")}</b><br>${nl(r.body||"")}</div>`}catch(e){out.innerHTML=`<p class="note">Couldn't draft that right now. Try again.</p>`}}}

/* ---------- AI banker coach (Pro) ---------- */
function coach(){
  if(!proGate("The AI banker coach is part of Pro"))return;
  openPanel(`<div class="label">AI banker coach</div><h2>Ask anything about recruiting</h2><p class="sub">An AI trained to coach finance recruiting: technicals, fit answers, how to prep a firm. It's AI, not a real banker, so double-check anything you'll quote in an interview.</p>
   <textarea class="sh-in" id="cqIn" rows="3" style="width:100%" placeholder="e.g. How do I explain why I want IB over consulting?"></textarea>
   <div class="actions"><button class="btn" id="cqGo">Ask</button></div><div id="cqOut"></div>`);
  const go=async()=>{const v=q$("#cqIn").value.trim();if(!v)return;if(!aiGate("the coach"))return;const out=q$("#cqOut");out.innerHTML=`<p class="note">Thinking…</p>`;
    try{const r=await ai(`You are an AI coach for college students recruiting in investment banking, private equity and related finance careers. Answer the question accurately and concisely (max 170 words), with numbers where they help. If you are unsure or it depends on the firm, say so. Never claim to be a human or to have worked on Wall Street. Question: ${v.slice(0,1200)}\nReturn JSON {"answer":string,"next":[string,string]}.`);
      out.innerHTML=`<div class="why">${nl(r.answer||"")}</div>${(r.next||[]).slice(0,2).map(n=>`<button class="ghost sm" data-nx="${esc(n)}" style="margin:6px 6px 0 0">${esc(n)}</button>`).join("")}`;
      out.querySelectorAll("[data-nx]").forEach(b=>b.onclick=()=>{q$("#cqIn").value=b.dataset.nx;go()})}catch(e){out.innerHTML=`<p class="note">The coach is unavailable right now. Try again in a minute.</p>`}};
  q$("#cqGo").onclick=go}

/* ---------- entry card ---------- */
if(!document.getElementById("kitCss")){const s=document.createElement("style");s.id="kitCss";s.textContent=".kit{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:14px 0}.kit button{text-align:left;border:1px solid rgba(128,128,128,.28);background:transparent;color:inherit;border-radius:12px;padding:12px;cursor:pointer;font:inherit}.kit button:hover{border-color:currentColor}.kit b{display:block}.kit span{font-size:.82em;opacity:.7}.vbar{height:6px;border-radius:99px;background:rgba(128,128,128,.2);overflow:hidden;margin:8px 0}.vbar.big{height:10px;margin:0}.vbar i{display:block;height:100%;border-radius:99px;background:#4f46e5;transition:width .4s}.wk-r{display:grid;grid-template-columns:1fr 38px;gap:2px 10px;align-items:center;margin:12px 0}.wk-t{grid-column:1/3;display:flex;justify-content:space-between;gap:10px}.wk-t span{font-size:.8em;opacity:.65}.wk-r em{font-style:normal;font-weight:700;text-align:right;grid-row:2;grid-column:2}.wk-r .vbar{grid-row:2;grid-column:1}.vrow{display:flex;gap:18px;flex-wrap:wrap;align-items:center;justify-content:space-around;margin:6px 0 14px}.vr{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:.8em;opacity:.95}.cbar{display:grid;grid-template-columns:120px 1fr 54px;gap:8px;align-items:center;margin:6px 0;font-size:.85em}.cbar .vbar{margin:0}.kit i{font-style:normal;font-size:.7em;border:1px solid currentColor;border-radius:99px;padding:0 6px;margin-left:6px;opacity:.7}";document.head.appendChild(s)}
function drawKit(){const w=q$("#weakCard");if(!w)return;let el=q$("#toolkitCard");if(!el){el=document.createElement("div");el.id="toolkitCard";w.after(el)}
  const P=isPro()?"":"<i>Pro</i>";
  el.innerHTML=`<div class="label">Toolkit</div><div class="kit"><button data-kit="fc"><b>Flashcards</b><span>Every question as a card, spaced repetition</span></button><button data-kit="wk"><b>Weak-concept report ${P}</b><span>What to fix first, from your quizzes and cards</span></button><button data-kit="crm"><b>Networking CRM ${P}</b><span>Contacts, follow-ups, AI email drafts</span></button><button data-kit="coach"><b>AI banker coach ${P}</b><span>Ask anything about recruiting</span></button></div>`;
  el.querySelectorAll("[data-kit]").forEach(b=>b.onclick=()=>({fc:flashHome,wk:weakReport,crm:crmHome,coach:coach})[b.dataset.kit]())}
try{const _rw=renderWeakCard;renderWeakCard=function(){_rw.apply(this,arguments);try{drawKit()}catch(e){console.error(e)}}}catch(e){console.error(e)}
window.MA_KIT={flashHome,weakReport,crmHome,coach};
try{renderWeakCard()}catch(e){}
})();
