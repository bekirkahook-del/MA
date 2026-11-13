#!/usr/bin/env python3
"""Builds the second batch of free tools (calculators, drills, quiz, email generator) WITHOUT touching
the first four tools. Run from the repo root: python3 guides/_src/tools2.py
Reuses the page shell from tools.py (only its header part is executed, so tools.py's pages aren't rewritten).
Also: adds cards to /tools/, refreshes the "More free tools" list on every tool page, and adds sitemap URLs."""
import os, re, json
SRC = os.path.dirname(os.path.abspath(__file__))
code = open(os.path.join(SRC, "tools.py"), encoding="utf-8").read()
exec(code[:code.index("# ---------- 1.")])  # defines ROOT, shell(), e(), SITE, TOOL_CSS ...

CSS = """<style>
.kp{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:14px 0}
.kp div{background:var(--paper);border:1px solid var(--rule);border-radius:12px;padding:10px 12px}
.kp b{display:block;font-size:22px;font-variant-numeric:tabular-nums;line-height:1.2}.kp span{font-size:12.5px;color:var(--ink-2)}
.kp .main{border-color:var(--cobalt);background:color-mix(in srgb,var(--cobalt) 10%,var(--sheet))}
.steps{margin:10px 0 0;padding-left:20px;font-size:15px}.steps li{margin:4px 0}
.warn{color:#C33;font-size:14px;font-weight:600}
.qq{font-size:26px;font-weight:800;margin:10px 0;font-variant-numeric:tabular-nums}
.out pre{white-space:pre-wrap;font:14.5px/1.55 "IBM Plex Sans",system-ui,sans-serif;background:var(--paper);border:1px solid var(--rule);border-radius:10px;padding:12px;margin:6px 0}
td.hi{background:color-mix(in srgb,var(--cobalt) 16%,var(--sheet));font-weight:700}
.tool textarea{font:inherit;font-size:15px;width:100%;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink)}
.small{font-size:13px;color:var(--ink-2)}
</style>"""

# Shared JS helpers (prepended to every tool script)
H = r"""
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const num=id=>{const v=parseFloat(String($(id).value).replace(/[,$%x\s]/g,''));return isFinite(v)?v:0};
const money=(v,d=1)=>(v<0?'-$':'$')+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:d});
const M=(v,d=1)=>money(v,d)+'M';
const pct=(v,d=1)=>(v*100).toFixed(d)+'%';
const xx=v=>v.toFixed(2)+'x';
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
async function shareIt(btn,card,txt,label){try{if(window.shareCard){btn.textContent="Making your card…";const r=await shareCard(card);btn.textContent=r==="downloaded"?"Saved! Post it to your story":label;return}
 if(navigator.share)await navigator.share({text:txt});else{await navigator.clipboard.writeText(txt);btn.textContent="Copied!"}}catch(e){btn.textContent=label}}
function live(ids,fn){ids.forEach(i=>{const el=$(i);el&&el.addEventListener('input',fn)});fn()}
function inp(id,label,val,hint){return `<div><label for="${id}">${label}</label><input id="${id}" inputmode="decimal" value="${val}">${hint?`<span class="small">${hint}</span>`:''}</div>`}
"""

def fields(rows):
    """rows: list of (id, label, default, hint)"""
    return '<div class="row">' + "".join(
        f'<div><label for="{i}">{l}</label><input id="{i}" inputmode="decimal" value="{v}">' + (f'<span class="small">{h}</span>' if h else '') + '</div>'
        for i, l, v, h in rows) + '</div>'

KEEP = {"finance-career-quiz", "mental-math-test", "lbo-calculator"}
TOOLS = []
def tool(slug, title, h1, desc, lede, body, faqs, js, extra="", short=None):
    if slug not in KEEP: return
    TOOLS.append(dict(slug=slug, title=title, h1=h1, desc=desc, lede=lede, body=CSS + body + extra, faqs=faqs, js=H + js, short=short))

# ---------------------------------------------------------------- 1. Mental math test
tool("mental-math-test", "Finance Mental Math Test: 60-Second Interview Drill", "60-second finance mental math test",
 "How fast is your mental math? A free 60-second drill with the kind of math finance interviewers ask: multiplication, percentages and growth rates. Get a score and share it.",
 ["Interviewers at banks and trading firms love quick math with no calculator. This drill gives you 60 seconds of it.",
  "Type the answer and press Enter. Wrong answers show the right one, then you move on."],
 """<div class="tool"><div id="start"><p class="label">Pick a mode</p><div class="seg" id="mode"><button data-m="all" class="on">Mixed</button><button data-m="mul">Multiply</button><button data-m="pct">Percent of</button><button data-m="gr">Growth %</button><button data-m="div">Divide</button></div>
<button class="btn" id="go">Start the 60-second test</button></div>
<div id="play" hidden><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="big" id="clock">60</div><div class="muted" id="sc">0 right</div></div>
<div class="qq" id="q"></div><input id="a" inputmode="decimal" autocomplete="off" placeholder="Answer, then Enter" aria-label="Your answer"><p class="muted" id="fb">Blank + Enter skips.</p></div>
<div id="done" hidden></div></div>""",
 [("What kind of math comes up in finance interviews?", "Mostly quick multiplication, percentages, growth rates and rough division, for example 15% of 360 or how much revenue grew from $80M to $100M. Sales and trading interviews push speed the hardest."),
  ("How do I get faster?", "Do a short drill every day, learn shortcuts (like 15% = 10% + half of 10%) and say your steps out loud. See the <a href=\"/guides/mental-math-finance-interviews/\">mental math guide</a>."),
  ("Is this like a trading firm math test?", "It's similar in spirit (timed, no calculator) but simpler. Some trading firms use longer 80-question tests in 8 minutes.")],
 r"""
let mode='all',score=0,tries=0,cur=null,t0=0,timer=null,locked=false;
$$('#mode button').forEach(b=>b.onclick=()=>{$$('#mode button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m});
const gcd=(a,b)=>b?gcd(b,a%b):a;
function gen(){const m=mode==='all'?pick(['mul','mul','pct','pct','gr','div']):mode;
 if(m==='mul'){const a=rnd(12,49),b=rnd(3,19);return{q:`${a} × ${b}`,a:a*b}}
 if(m==='div'){const b=rnd(3,16),c=rnd(6,40);return{q:`${b*c} ÷ ${b}`,a:c}}
 if(m==='pct'){const p=pick([5,10,15,20,25,30,40,60,75,12.5]);const step=p===12.5?8:100/gcd(p,100);const n=step*rnd(2,Math.max(3,Math.floor(400/step)));return{q:`${p}% of ${n}`,a:n*p/100}}
 for(;;){const a=pick([20,40,50,60,80,120,150,200,250,400]),p=pick([10,20,25,50,75,-10,-20,-25,-50]);const b=a*(1+p/100);if(Number.isInteger(b))return{q:`$${a}M → $${b}M. Growth %?`,a:p,unit:'%'}}}
function next(){cur=gen();$('#q').textContent=cur.q;$('#a').value='';$('#a').focus()}
function end(){clearInterval(timer);$('#play').hidden=true;const acc=tries?score/tries:0;
 const tier=score>=18?['Trading-desk fast','You could handle a trading firm math test.']:score>=12?['Superday ready','Fast and accurate. Keep it sharp.']:score>=7?['Getting there','Daily 5-minute drills will get you to Superday speed.']:['Warming up','Learn the shortcuts in the guide below, then try again.'];
 $('#done').hidden=false;$('#done').innerHTML=`<div class="big">${score} right</div><p class="muted">${tries} tried · ${Math.round(acc*100)}% accuracy · ${tier[0]}</p><p>${tier[1]}</p><button class="btn" id="again">Try again</button> <button class="btn ghost" id="sh">Share my score</button>`;
 $('#again').onclick=startGame;const txt=`I got ${score} right in the 60-second finance mental math test. Beat me: https://mnaprep.com/tools/mental-math-test/`;
 $('#sh').onclick=()=>shareIt($('#sh'),{kicker:"60-SECOND MENTAL MATH",big:String(score),title:score===1?"right answer in 60 seconds":"right answers in 60 seconds",sub:"No calculator. Can you beat it?",path:"/tools/mental-math-test/",file:`mental-math-${score}.png`,text:txt},txt,"Share my score")}
function startGame(){score=0;tries=0;$('#sc').textContent='0 right';$('#start').hidden=true;$('#done').hidden=true;$('#play').hidden=false;$('#fb').textContent='Blank + Enter skips.';t0=Date.now();
 timer=setInterval(()=>{const left=60-Math.floor((Date.now()-t0)/1000);$('#clock').textContent=Math.max(0,left);if(left<=0)end()},200);next()}
$('#go').onclick=startGame;
$('#a').addEventListener('keydown',ev=>{if(ev.key!=='Enter'||locked)return;const raw=$('#a').value.replace(/[,$%\s]/g,'');
 if(raw===''){$('#fb').textContent=`Skipped: ${cur.q} = ${cur.a}${cur.unit||''}`;next();return}
 tries++;const v=parseFloat(raw);if(Math.abs(v-cur.a)<0.01){score++;$('#sc').textContent=score+' right';$('#fb').textContent='✓ Correct';next()}
 else{$('#fb').textContent=`✗ ${cur.q} = ${cur.a}${cur.unit||''}`;locked=true;setTimeout(()=>{locked=false;next()},700)}});
""",
 """<h2>Shortcuts that make this easy</h2><ul><li><b>Percentages:</b> 15% = 10% + half of 10%. 15% of 360 = 36 + 18 = 54.</li>
<li><b>Flip it:</b> x% of y = y% of x. 4% of 75 = 75% of 4 = 3.</li>
<li><b>Round and fix:</b> 17 × 24 = 17 × 25 − 17 = 425 − 17 = 408.</li>
<li><b>Growth:</b> (new − old) ÷ old. $80M → $100M is 20 ÷ 80 = 25%.</li></ul>""", short="math")

# ---------------------------------------------------------------- 2. Paper LBO practice
tool("paper-lbo-practice", "Paper LBO Practice Problems (Free, With Answers)", "Paper LBO practice",
 "Practice paper LBOs like the ones in private equity interviews. Get a new problem every time, solve for MOIC and IRR in your head, then see the step-by-step answer.",
 ["A paper LBO is a mini leveraged buyout you solve with a pen in a few minutes. It's a classic private equity interview question.",
  "Solve for the money-on-money multiple (MOIC) and the IRR, then check your work."],
 """<div class="tool"><div id="prob"></div>
<div class="row" style="margin-top:12px"><div><label for="g1">Your MOIC (e.g. 2.5)</label><input id="g1" inputmode="decimal" placeholder="x"></div><div><label for="g2">Your IRR % (e.g. 20)</label><input id="g2" inputmode="decimal" placeholder="%"></div></div>
<button class="btn" id="chk">Check my answer</button> <button class="btn ghost" id="new">New problem</button>
<div id="res" aria-live="polite"></div><p class="muted" id="streak"></p></div>""",
 [("What's a paper LBO?", "A simplified leveraged buyout you solve without Excel: buy a company with some debt, grow it, pay down debt, sell it, and work out the return on the equity you put in."),
  ("What IRR does a 2x or 3x return mean?", "Over 5 years: 2x ≈ 15%, 2.5x ≈ 20%, 3x ≈ 25%. Over 3 years: 2x ≈ 26%. Memorize these, they come up constantly."),
  ("How long do I get in an interview?", "Usually a few minutes for a simple one like this. Longer paper LBOs with a full income statement can take 15–30 minutes.")],
 r"""
let P,streak=0;
function make(){const E0=pick([50,80,100,120,150,200]),m=pick([8,9,10,11,12]),d=pick([4,5,6].filter(x=>x<=m-3)),g=pick([1.25,1.4,1.5,1.6,2]),Y=pick([3,5,5,5]);
 const ev=E0*m,debt=E0*d,eq=ev-debt,E5=E0*g,pay=Math.min(debt,Math.round(rnd(1,Math.ceil(debt/50))*50*0.6/50)*50);
 const xev=E5*m,left=debt-pay,xeq=xev-left,moic=xeq/eq,irr=Math.pow(moic,1/Y)-1;P={E0,m,d,E5,Y,ev,debt,eq,pay,xev,left,xeq,moic,irr};
 $('#prob').innerHTML=`<p class="label">The deal</p><ul class="steps"><li>A PE firm buys a company with <b>$${E0}M EBITDA</b> at <b>${m}x EBITDA</b>.</li><li>It funds the deal with <b>${d}x EBITDA of debt</b>; the rest is equity.</li><li>Over <b>${Y} years</b>, EBITDA grows to <b>$${E5}M</b> and the company pays down <b>$${pay}M</b> of debt.</li><li>It sells at the same <b>${m}x</b> multiple.</li></ul><p><b>What are the MOIC and the IRR?</b></p>`;
 $('#res').innerHTML='';$('#g1').value='';$('#g2').value=''}
function check(){const a=parseFloat($('#g1').value),b=parseFloat($('#g2').value);const okM=Math.abs(a-P.moic)<=0.15,okI=Math.abs(b-P.irr*100)<=3;
 if(okM&&okI)streak++;else streak=0;$('#streak').textContent=streak?`Streak: ${streak} in a row 🔥`:'';
 $('#res').innerHTML=`<div class="kp"><div class="main"><span>MOIC</span><b>${P.moic.toFixed(2)}x</b>${isNaN(a)?'':okM?'✓ you got it':'✗ you said '+a+'x'}</div><div class="main"><span>IRR</span><b>${(P.irr*100).toFixed(1)}%</b>${isNaN(b)?'':okI?'✓ within 3%':'✗ you said '+b+'%'}</div></div>
 <ol class="steps"><li>Purchase price: $${P.E0}M × ${P.m} = <b>$${P.ev}M</b></li><li>Debt: $${P.E0}M × ${P.d} = $${P.debt}M, so equity = $${P.ev}M − $${P.debt}M = <b>$${P.eq}M</b></li>
 <li>Exit value: $${P.E5}M × ${P.m} = <b>$${P.xev}M</b></li><li>Debt left: $${P.debt}M − $${P.pay}M = $${P.left}M, so exit equity = <b>$${P.xeq}M</b></li>
 <li>MOIC = $${P.xeq}M ÷ $${P.eq}M = <b>${P.moic.toFixed(2)}x</b></li><li>IRR = ${P.moic.toFixed(2)}^(1/${P.Y}) − 1 = <b>${(P.irr*100).toFixed(1)}%</b>. Shortcut: over 5 years 2x ≈ 15%, 2.5x ≈ 20%, 3x ≈ 25%.</li></ol>`}
$('#chk').onclick=check;$('#new').onclick=make;make();
""",
 """<h2>How to solve any paper LBO</h2><ol><li>Purchase price = EBITDA × entry multiple.</li><li>Equity = purchase price − debt.</li><li>Exit value = future EBITDA × exit multiple.</li><li>Exit equity = exit value − debt left (plus any cash built up).</li><li>MOIC = exit equity ÷ starting equity. Turn it into an IRR with the shortcuts.</li></ol>
<p>Want the full walkthrough? Read <a href="/guides/what-is-an-lbo/">what an LBO is</a>, the <a href="/guides/lbo-interview-questions/">LBO interview questions</a> and the <a href="/guides/irr-moic-cheat-sheet/">IRR and MOIC cheat sheet</a>.</p>""", short="paperlbo")

# ---------------------------------------------------------------- 3. LBO calculator
tool("lbo-calculator", "LBO Calculator: IRR, MOIC and Returns Breakdown", "LBO calculator",
 "Free LBO calculator. Enter EBITDA, entry and exit multiples, leverage and growth to get the IRR, MOIC and a breakdown of where the returns come from.",
 ["Model a simple leveraged buyout in seconds. Change any input and the returns update live.",
  "The breakdown shows how much of the gain came from EBITDA growth, multiple expansion and paying down debt, which is exactly how PE interviewers want you to think."],
 """<div class="tool">""" + fields([("e0", "EBITDA today ($M)", "100", ""), ("em", "Entry multiple (x EBITDA)", "10", ""), ("xm", "Exit multiple (x EBITDA)", "10", ""),
   ("lev", "Debt (x EBITDA)", "5", ""), ("gr", "EBITDA growth per year (%)", "8", ""), ("yr", "Years held", "5", ""),
   ("fc", "Free cash flow to pay debt (% of EBITDA)", "40", "after interest, taxes and capex")]) + """
<div id="out" aria-live="polite"></div></div>""",
 [("What's a good LBO return?", "Private equity firms often target an IRR around 20% or more and roughly 2–3x their money over 5 years, but targets vary by firm, deal size and market."),
  ("Why does more debt raise returns?", "Debt means the firm puts in less equity. If the business grows, the whole gain goes to that smaller equity check, so the percentage return is higher. The trade-off is more risk if things go wrong."),
  ("What does this calculator leave out?", "Fees, interest rate details, taxes on the exit, dividends and management equity. It's built for learning and quick checks, not for a real deal model.")],
 r"""
function calc(){const E0=num('#e0'),em=num('#em'),xm=num('#xm'),lev=num('#lev'),g=num('#gr')/100,Y=Math.max(1,Math.round(num('#yr'))),fc=num('#fc')/100;
 const ev=E0*em,D0=Math.min(E0*lev,ev),eq=ev-D0;let D=D0,cash=0,E=E0,rows='';
 for(let t=1;t<=Y;t++){E=E*(1+g);const f=E*fc;const pay=Math.min(D,f);D-=pay;cash+=f-pay;rows+=`<tr><td>Year ${t}</td><td>${M(E)}</td><td>${M(f)}</td><td>${M(D)}</td></tr>`}
 const xev=E*xm,xeq=xev-D+cash;if(eq<=0){$('#out').innerHTML='<p class="warn">Debt can\'t be bigger than the purchase price. Lower the debt multiple.</p>';return}
 const moic=xeq/eq,irr=moic>0?Math.pow(moic,1/Y)-1:-1;
 const gG=(E-E0)*em,gM=(xm-em)*E,gD=(D0-D)+cash,tot=gG+gM+gD,mx=Math.max(...[gG,gM,gD].map(Math.abs),1);
 const bar=(l,v)=>`<div class="bar"><span>${l}</span><div class="t"><i style="width:${Math.abs(v)/mx*100}%;${v<0?'background:#C33':''}"></i></div><b>${M(v,0)}</b></div>`;
 $('#out').innerHTML=`<div class="kp"><div class="main"><span>IRR</span><b>${pct(irr)}</b></div><div class="main"><span>MOIC</span><b>${xx(moic)}</b></div><div><span>Purchase price</span><b>${M(ev,0)}</b></div><div><span>Equity in</span><b>${M(eq,0)}</b></div><div><span>Exit value</span><b>${M(xev,0)}</b></div><div><span>Equity out</span><b>${M(xeq,0)}</b></div></div>
 <p class="label">Where the ${M(tot,0)} gain came from</p><div class="bars">${bar('EBITDA growth',gG)}${bar('Multiple change',gM)}${bar('Debt paydown',gD)}</div>
 <div class="tbl" style="margin-top:14px"><table><thead><tr><th>Year</th><th>EBITDA</th><th>Cash to debt</th><th>Debt left</th></tr></thead><tbody><tr><td>Today</td><td>${M(E0)}</td><td>–</td><td>${M(D0)}</td></tr>${rows}</tbody></table></div>`}
live(['#e0','#em','#xm','#lev','#gr','#yr','#fc'],calc);
""",
 """<h2>The three drivers of LBO returns</h2><p><b>EBITDA growth</b> (the business earns more), <b>multiple expansion</b> (someone pays a higher multiple when you sell) and <b>debt paydown</b> (cash flow shrinks the debt, so more of the exit value belongs to equity). Interviewers often ask which one matters most in a given deal. Try setting the exit multiple equal to the entry multiple to see returns without multiple expansion.</p>
<p>Learn to do it by hand: <a href="/guides/what-is-an-lbo/">what is an LBO</a>, <a href="/guides/lbo-interview-questions/">LBO interview questions</a> and the <a href="/guides/irr-moic-cheat-sheet/">IRR and MOIC cheat sheet</a>.</p>""", short="lbo")

# ---------------------------------------------------------------- 4. DCF calculator
tool("dcf-calculator", "DCF Calculator: Free Discounted Cash Flow Valuation", "DCF calculator",
 "Free DCF calculator. Enter free cash flow, growth, WACC and terminal growth to get enterprise value, equity value, share price and a sensitivity table.",
 ["Value a company with a simple 5-year discounted cash flow. Results and the sensitivity table update as you type.",
  "Use it to check interview math or to see how much the answer swings when WACC or terminal growth moves a little."],
 """<div class="tool">""" + fields([("f0", "Free cash flow last year ($M)", "100", ""), ("g", "FCF growth, years 1–5 (%)", "10", ""), ("w", "Discount rate / WACC (%)", "9", ""),
   ("tg", "Terminal growth (%)", "2.5", "long-run growth, usually 2–3%"), ("nd", "Net debt ($M)", "200", "debt minus cash"), ("sh", "Diluted shares (M)", "50", "")]) + """
<div id="out" aria-live="polite"></div></div>""",
 [("What is a DCF?", "A discounted cash flow values a company as the present value of the cash it will produce: a few years of forecast cash flows plus a terminal value for everything after, all discounted at the WACC."),
  ("Why is most of the value in the terminal value?", "Because it captures every year after the forecast. It's common for 60–80% of a DCF's value to come from the terminal value, which is why small changes in WACC or terminal growth move the answer so much."),
  ("Why must WACC be above terminal growth?", "The perpetuity formula divides by (WACC − growth). If growth is equal or higher, the value would be infinite, which makes no sense.")],
 r"""
function dcf(F0,g,w,tg){let pv=0,F=F0;for(let t=1;t<=5;t++){F*=1+g;pv+=F/Math.pow(1+w,t)}const tv=F*(1+tg)/(w-tg),ptv=tv/Math.pow(1+w,5);return{pv,tv,ptv,ev:pv+ptv,F5:F}}
function calc(){const F0=num('#f0'),g=num('#g')/100,w=num('#w')/100,tg=num('#tg')/100,nd=num('#nd'),sh=num('#sh');
 if(w<=tg){$('#out').innerHTML='<p class="warn">WACC has to be higher than terminal growth.</p>';return}
 const r=dcf(F0,g,w,tg),eqv=r.ev-nd,px=sh>0?eqv/sh:0;let rows='';let F=F0;
 for(let t=1;t<=5;t++){F*=1+g;rows+=`<tr><td>Year ${t}</td><td>${M(F)}</td><td>${(1/Math.pow(1+w,t)).toFixed(3)}</td><td>${M(F/Math.pow(1+w,t))}</td></tr>`}
 const ws=[-1,-.5,0,.5,1].map(d=>w+d/100),gs=[-1,-.5,0,.5,1].map(d=>tg+d/100);
 const sens=`<table><thead><tr><th>WACC ↓ / g →</th>${gs.map(x=>`<th>${(x*100).toFixed(1)}%</th>`).join('')}</tr></thead><tbody>${ws.map((wi,i)=>`<tr><td>${(wi*100).toFixed(1)}%</td>${gs.map((gi,j)=>`<td class="${i===2&&j===2?'hi':''}">${wi>gi&&sh>0?money((dcf(F0,g,wi,gi).ev-nd)/sh,2):'–'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 $('#out').innerHTML=`<div class="kp"><div class="main"><span>Share price</span><b>${money(px,2)}</b></div><div><span>Enterprise value</span><b>${M(r.ev,0)}</b></div><div><span>Equity value</span><b>${M(eqv,0)}</b></div><div><span>Terminal value share of EV</span><b>${pct(r.ptv/r.ev,0)}</b></div></div>
 <div class="tbl"><table><thead><tr><th>Year</th><th>FCF</th><th>Discount factor</th><th>Present value</th></tr></thead><tbody>${rows}<tr><td>Terminal value</td><td>${M(r.tv,0)}</td><td>${(1/Math.pow(1+w,5)).toFixed(3)}</td><td>${M(r.ptv,0)}</td></tr></tbody></table></div>
 <p class="label" style="margin-top:16px">Share price sensitivity</p><div class="tbl">${sens}</div>`}
live(['#f0','#g','#w','#tg','#nd','#sh'],calc);
""",
 """<h2>The formulas</h2><ul><li>Present value of each year: FCF ÷ (1 + WACC)<sup>year</sup></li><li>Terminal value (Gordon growth): FCF<sub>5</sub> × (1 + g) ÷ (WACC − g)</li><li>Enterprise value = sum of present values + present value of terminal value</li><li>Equity value = enterprise value − net debt; share price = equity value ÷ diluted shares</li></ul>
<p>More: <a href="/guides/dcf-interview-questions/">DCF interview questions</a>, <a href="/guides/free-cash-flow-explained/">free cash flow explained</a> and the <a href="/tools/wacc-calculator/">WACC calculator</a>.</p>""", short="dcf")

# ---------------------------------------------------------------- 5. WACC calculator
tool("wacc-calculator", "WACC Calculator (With CAPM Cost of Equity)", "WACC calculator",
 "Free WACC calculator. Enter the equity and debt mix, beta, risk-free rate, equity risk premium, cost of debt and tax rate to get the cost of equity and WACC with every step shown.",
 ["The weighted average cost of capital (WACC) is the discount rate in a DCF. This calculator works it out step by step, with the cost of equity from CAPM.",
  "The numbers filled in are an example. Swap in your own."],
 """<div class="tool">""" + fields([("ev", "Market value of equity ($M)", "800", ""), ("dv", "Market value of debt ($M)", "200", ""), ("rf", "Risk-free rate (%)", "4", "e.g. 10-year Treasury yield"),
   ("b", "Beta", "1.1", ""), ("erp", "Equity risk premium (%)", "5.5", ""), ("kd", "Pre-tax cost of debt (%)", "6", ""), ("t", "Tax rate (%)", "25", "")]) + """
<div id="out" aria-live="polite"></div></div>""",
 [("What is WACC?", "The average return a company has to pay its investors, weighted by how much of its funding is equity versus debt. It's the discount rate for a company's free cash flow in a DCF."),
  ("Why is debt cheaper than equity?", "Lenders get paid first and interest is tax-deductible, so the after-tax cost of debt is usually well below the cost of equity."),
  ("Does more debt always lower WACC?", "At first, yes, because you swap expensive equity for cheaper debt. Past a point the risk of default rises, so both the cost of debt and the cost of equity go up.")],
 r"""
function calc(){const E=num('#ev'),D=num('#dv'),rf=num('#rf')/100,b=num('#b'),erp=num('#erp')/100,kd=num('#kd')/100,t=num('#t')/100,V=E+D;
 if(V<=0){$('#out').innerHTML='';return}const ke=rf+b*erp,akd=kd*(1-t),we=E/V,wd=D/V,w=we*ke+wd*akd;
 $('#out').innerHTML=`<div class="kp"><div class="main"><span>WACC</span><b>${pct(w,2)}</b></div><div><span>Cost of equity</span><b>${pct(ke,2)}</b></div><div><span>After-tax cost of debt</span><b>${pct(akd,2)}</b></div><div><span>Equity / debt weight</span><b>${pct(we,0)} / ${pct(wd,0)}</b></div></div>
 <ol class="steps"><li>Cost of equity (CAPM) = ${pct(rf,2)} + ${b} × ${pct(erp,2)} = <b>${pct(ke,2)}</b></li><li>After-tax cost of debt = ${pct(kd,2)} × (1 − ${pct(t,0)}) = <b>${pct(akd,2)}</b></li>
 <li>Weights: equity ${M(E,0)} ÷ ${M(V,0)} = ${pct(we,1)}, debt ${pct(wd,1)}</li><li>WACC = ${pct(we,1)} × ${pct(ke,2)} + ${pct(wd,1)} × ${pct(akd,2)} = <b>${pct(w,2)}</b></li></ol>`}
live(['#ev','#dv','#rf','#b','#erp','#kd','#t'],calc);
""",
 """<p>Read <a href="/guides/wacc-explained/">WACC explained</a> for the interview version, then plug your WACC into the <a href="/tools/dcf-calculator/">DCF calculator</a>.</p>""", short="wacc")

# ---------------------------------------------------------------- 6. Accretion / dilution
tool("accretion-dilution-calculator", "Accretion / Dilution Calculator (Merger Model)", "Accretion / dilution calculator",
 "Free merger model calculator. See whether an acquisition is accretive or dilutive to EPS based on price, funding mix (stock, cash, debt), interest rates and synergies.",
 ["Will a deal raise or lower the buyer's earnings per share? Enter the deal and see the pro forma EPS, accretion or dilution, and the synergies needed to break even.",
  "Dollar amounts are in millions; shares in millions."],
 """<div class="tool"><p class="label">Buyer</p>""" + fields([("ap", "Buyer share price ($)", "50", ""), ("as", "Buyer shares (M)", "100", ""), ("ani", "Buyer net income ($M)", "300", "")]) + """
<p class="label" style="margin-top:14px">Target and deal</p>""" + fields([("pp", "Purchase price for target equity ($M)", "1000", ""), ("tni", "Target net income ($M)", "60", ""), ("syn", "Pre-tax synergies ($M/yr)", "0", "")]) + """
<p class="label" style="margin-top:14px">How it's paid for (%)</p>""" + fields([("ps", "Stock (%)", "50", ""), ("pc", "Cash on hand (%)", "25", ""), ("pd", "New debt (%)", "25", "")]) + fields([("rd", "Interest rate on new debt (%)", "7", ""), ("rc", "Interest earned on cash (%)", "4", "income you give up"), ("tx", "Tax rate (%)", "25", "")]) + """
<div id="out" aria-live="polite"></div></div>""",
 [("What does accretive mean?", "The buyer's earnings per share go up after the deal. Dilutive means EPS goes down."),
  ("Quick rule for all-stock deals?", "If the buyer's P/E is higher than the P/E it's paying for the target, the deal is accretive (before synergies). The buyer is using 'expensive' stock to buy 'cheaper' earnings."),
  ("Is a dilutive deal always bad?", "No. A deal can be dilutive in year one and still create value long term through growth or synergies. EPS impact is one test, not the whole story.")],
 r"""
function calc(){const ap=num('#ap'),as=num('#as'),ani=num('#ani'),pp=num('#pp'),tni=num('#tni'),syn=num('#syn'),s=num('#ps')/100,c=num('#pc')/100,d=num('#pd')/100,rd=num('#rd')/100,rc=num('#rc')/100,t=num('#tx')/100;
 const sum=s+c+d;if(Math.abs(sum-1)>0.001){$('#out').innerHTML=`<p class="warn">Stock + cash + debt adds up to ${Math.round(sum*100)}%. Make it 100%.</p>`;return}
 if(ap<=0||as<=0){$('#out').innerHTML='';return}
 const eps0=ani/as,newSh=pp*s/ap,cost=(pp*d*rd+pp*c*rc)*(1-t),ni=ani+tni+syn*(1-t)-cost,eps1=ni/(as+newSh),acc=eps1/eps0-1;
 const be=Math.max(0,(eps0*(as+newSh)-ani-tni+cost)/(1-t)),peB=ap/eps0,peT=tni>0?pp/tni:Infinity;
 $('#out').innerHTML=`<div class="kp"><div class="main"><span>${acc>=0?'Accretive':'Dilutive'}</span><b style="color:${acc>=0?'var(--good)':'#C33'}">${acc>=0?'+':''}${pct(acc)}</b></div><div><span>Buyer EPS today</span><b>${money(eps0,2)}</b></div><div><span>Pro forma EPS</span><b>${money(eps1,2)}</b></div><div><span>New shares issued</span><b>${newSh.toFixed(1)}M</b></div><div><span>Break-even synergies</span><b>${M(be,0)}</b></div></div>
 <ol class="steps"><li>New shares = ${M(pp*s,0)} of stock ÷ ${money(ap,2)} = ${newSh.toFixed(1)}M</li><li>After-tax cost of cash and debt = (${M(pp*d,0)} × ${pct(rd)} + ${M(pp*c,0)} × ${pct(rc)}) × (1 − ${pct(t,0)}) = ${M(cost)}</li>
 <li>Pro forma net income = ${M(ani,0)} + ${M(tni,0)} + after-tax synergies ${M(syn*(1-t))} − ${M(cost)} = ${M(ni)}</li><li>Pro forma EPS = ${M(ni)} ÷ ${(as+newSh).toFixed(1)}M shares = <b>${money(eps1,2)}</b></li></ol>
 <p class="muted">P/E check: buyer trades at ${peB.toFixed(1)}x, paying ${isFinite(peT)?peT.toFixed(1)+'x':'n/a'} for the target's earnings.</p>`}
live(['#ap','#as','#ani','#pp','#tni','#syn','#ps','#pc','#pd','#rd','#rc','#tx'],calc);
""",
 """<p>Learn the interview version in <a href="/guides/merger-model-accretion-dilution/">merger model and accretion/dilution</a>.</p>""", short="accretion")

# ---------------------------------------------------------------- 7. Enterprise value calculator
tool("enterprise-value-calculator", "Enterprise Value Calculator (With Diluted Shares)", "Enterprise value calculator",
 "Free enterprise value calculator. Go from share price to equity value to enterprise value, with diluted shares from the treasury stock method and an EV/EBITDA multiple.",
 ["Build the bridge from share price to enterprise value the way bankers do, including options with the treasury stock method.",
  "Dollar amounts are in millions except the share and strike prices."],
 """<div class="tool">""" + fields([("px", "Share price ($)", "40", ""), ("bs", "Basic shares (M)", "100", ""), ("op", "Options outstanding (M)", "5", ""), ("ks", "Average strike price ($)", "25", ""),
   ("debt", "Total debt ($M)", "500", ""), ("pref", "Preferred stock ($M)", "0", ""), ("mi", "Minority interest ($M)", "0", ""), ("cash", "Cash ($M)", "300", ""), ("eb", "EBITDA ($M, optional)", "150", "")]) + """
<div id="out" aria-live="polite"></div></div>""",
 [("Why add debt and subtract cash?", "Enterprise value is the value of the whole business to all investors. A buyer takes on the debt (so it adds to the cost) and gets the cash (so it reduces the cost)."),
  ("What's the treasury stock method?", "In-the-money options are assumed to be exercised. The company uses the exercise money to buy back shares at today's price, so only the net new shares count."),
  ("Equity value or enterprise value for multiples?", "Match the numerator and denominator: EV goes with metrics for all investors (revenue, EBITDA); equity value goes with metrics for shareholders only (net income, so P/E).")],
 r"""
function calc(){const px=num('#px'),bs=num('#bs'),op=num('#op'),ks=num('#ks'),debt=num('#debt'),pref=num('#pref'),mi=num('#mi'),cash=num('#cash'),eb=num('#eb');
 const itm=px>ks&&px>0,net=itm?op-op*ks/px:0,dil=bs+net,eqv=px*dil,ev=eqv+debt+pref+mi-cash;
 const mx=Math.max(eqv,ev,debt,cash,1),bar=(l,v,c)=>`<div class="bar"><span>${l}</span><div class="t"><i style="width:${Math.abs(v)/mx*100}%;${c?'background:'+c:''}"></i></div><b>${M(v,0)}</b></div>`;
 $('#out').innerHTML=`<div class="kp"><div class="main"><span>Enterprise value</span><b>${M(ev,0)}</b></div><div><span>Equity value</span><b>${M(eqv,0)}</b></div><div><span>Diluted shares</span><b>${dil.toFixed(2)}M</b></div>${eb>0?`<div><span>EV / EBITDA</span><b>${(ev/eb).toFixed(1)}x</b></div>`:''}</div>
 <ol class="steps"><li>Options: ${itm?`in the money. ${op}M × ${money(ks,2)} = ${M(op*ks)} buys back ${(op*ks/px).toFixed(2)}M shares, so net new shares = <b>${net.toFixed(2)}M</b>`:'out of the money, so they add no shares'}</li>
 <li>Equity value = ${money(px,2)} × ${dil.toFixed(2)}M = <b>${M(eqv,0)}</b></li><li>EV = ${M(eqv,0)} + debt ${M(debt,0)} + preferred ${M(pref,0)} + minority ${M(mi,0)} − cash ${M(cash,0)} = <b>${M(ev,0)}</b></li></ol>
 <div class="bars">${bar('Equity value',eqv)}${bar('+ Debt etc.',debt+pref+mi,'var(--c-amber)')}${bar('− Cash',-cash,'var(--c-green)')}${bar('= EV',ev,'var(--c-violet)')}</div>`}
live(['#px','#bs','#op','#ks','#debt','#pref','#mi','#cash','#eb'],calc);
""",
 """<p>Go deeper with <a href="/guides/enterprise-value-vs-equity-value/">enterprise value vs. equity value</a> and <a href="/guides/valuation-multiples/">valuation multiples</a>.</p>""", short="ev")

# ---------------------------------------------------------------- 8. Investing / compound interest calculator
tool("compound-interest-calculator", "Compound Interest Calculator: What Your Money Could Grow To", "Compound interest calculator",
 "Free compound interest calculator for students. See what a starting amount plus monthly investing could grow to, and how much waiting 10 years costs you.",
 ["See how much your money could grow if you invest a little every month, and what happens if you wait.",
  "The return is an example, not a promise. Real investments go up and down, and past returns don't guarantee future ones."],
 """<div class="tool">""" + fields([("p0", "Starting amount ($)", "1000", ""), ("mc", "Monthly investment ($)", "200", ""), ("r", "Yearly return (%)", "7", "example only"), ("yr", "Years", "40", "")]) + """
<div id="out" aria-live="polite"></div></div>""",
 [("How does compound interest work?", "You earn returns on your money and on the returns you already earned. Over long periods the growth on growth becomes bigger than what you put in."),
  ("What's the rule of 72?", "Divide 72 by the yearly return to estimate how many years it takes to double. At 8% a year, money roughly doubles in 9 years."),
  ("Is this financial advice?", "No. It's a math tool for learning. Returns aren't guaranteed and this ignores taxes, fees and inflation.")],
 r"""
function fv(P,C,r,y){const i=r/12,n=Math.round(y*12);return i?P*Math.pow(1+i,n)+C*(Math.pow(1+i,n)-1)/i:P+C*n}
function calc(){const P=num('#p0'),C=num('#mc'),r=num('#r')/100,Y=Math.max(1,Math.min(70,Math.round(num('#yr'))));
 const F=fv(P,C,r,Y),put=P+C*12*Y,late=Y>10?fv(P,C,r,Y-10):null,mx=Math.max(F,1);let bars='';
 for(let y=5;y<=Y;y+=5){const v=fv(P,C,r,y),p=P+C*12*y;bars+=`<div class="bar"><span>Year ${y}</span><div class="t"><i style="width:${v/mx*100}%"></i></div><b>${money(v,0)}</b></div>`}
 $('#out').innerHTML=`<div class="kp"><div class="main"><span>After ${Y} years</span><b>${money(F,0)}</b></div><div><span>You put in</span><b>${money(put,0)}</b></div><div><span>Growth</span><b>${money(F-put,0)}</b></div>${r>0?`<div><span>Doubles about every</span><b>${(72/(r*100)).toFixed(1)} yrs</b></div>`:''}</div>
 ${late!==null?`<p><b>Wait 10 years</b> and invest for ${Y-10} years instead: <b>${money(late,0)}</b>. Starting now is worth <b>${money(F-late,0)}</b> more.</p>`:''}<div class="bars">${bars}</div>`}
live(['#p0','#mc','#r','#yr'],calc);
""",
 """<p class="muted">Contributions are added monthly and returns compound monthly. Not financial advice.</p>""", short="compound")

# ---------------------------------------------------------------- 9. Career quiz
QZ = [
 ("It's 9pm and you're still working. What are you doing?", [("Perfecting a model and a pitch deck for a big client", {"ib": 2, "pe": 1}), ("Watching markets react to breaking news", {"mk": 2}), ("Digging into one company's earnings to decide if the stock is cheap", {"er": 2, "mk": 1}), ("Prepping slides to solve a client's business problem", {"mc": 2}), ("Wait, it's 9pm? I logged off at 6", {"cf": 2})]),
 ("Pick the compliment you'd love most:", [("\"You never miss a detail.\"", {"ib": 2}), ("\"You make fast calls under pressure.\"", {"mk": 2}), ("\"You spotted that before anyone else.\"", {"er": 1, "vc": 1, "mk": 1}), ("\"You explain things so clearly.\"", {"mc": 2, "cf": 1}), ("\"You'd make a great owner of a business.\"", {"pe": 2})]),
 ("Which sounds most fun?", [("Helping two companies merge", {"ib": 2}), ("Buying a company, fixing it up and selling it", {"pe": 2}), ("Betting on whether a stock goes up or down", {"mk": 2, "er": 1}), ("Meeting startup founders with crazy ideas", {"vc": 2}), ("Planning the budget for a company you love", {"cf": 2})]),
 ("How do you feel about long hours early in your career?", [("Fine if it pays off big later", {"ib": 2, "pe": 1}), ("OK in bursts, but I want my weekends", {"mc": 1, "er": 1, "mk": 1}), ("I want hours tied to market hours", {"mk": 2}), ("Hard pass, I want balance", {"cf": 2})]),
 ("What do you like reading?", [("Deal news: who's buying who", {"ib": 2, "pe": 1}), ("Market updates and economic data", {"mk": 2}), ("Company earnings reports", {"er": 2}), ("Startup and tech news", {"vc": 2}), ("Business books about strategy", {"mc": 2})]),
 ("In a group project you usually…", [("Build the spreadsheet everyone relies on", {"ib": 1, "pe": 1, "cf": 1}), ("Make the final call when the group is stuck", {"mk": 1, "pe": 1}), ("Do the research and find the key insight", {"er": 2}), ("Run the meeting and present", {"mc": 2}), ("Pitch the boldest idea", {"vc": 2})]),
 ("Pick a game:", [("Chess", {"pe": 1, "ib": 1}), ("Poker", {"mk": 2}), ("Fantasy football with a spreadsheet", {"er": 2}), ("Monopoly", {"pe": 1, "vc": 1}), ("A puzzle you solve with friends", {"mc": 2})]),
 ("Where do you want to be in 10 years?", [("Running deals and advising CEOs", {"ib": 2}), ("Investing the firm's money in whole companies", {"pe": 2}), ("Managing a portfolio or running a desk", {"mk": 1, "er": 1}), ("Backing the next big startup", {"vc": 2}), ("CFO or a leader inside one company", {"cf": 2, "mc": 1})]),
]
CAREERS = {
 "ib": ("Investment banking", "You like big deals, detail and high stakes. Bankers advise companies on mergers, acquisitions and raising money.", "Most people start as a summer analyst in junior year, then become a full-time analyst.", [("Recruiting timeline", "/tools/recruiting-timeline-calculator/"), ("What IB analysts do", "/guides/what-do-investment-banking-analysts-do/"), ("IB interview questions", "/guides/investment-banking-interview-questions/")]),
 "pe": ("Private equity", "You think like an owner. PE firms buy whole companies, improve them and sell them years later.", "Most associates spend 2 years in investment banking first, then recruit for PE.", [("What is private equity?", "/guides/what-is-private-equity/"), ("LBO calculator", "/tools/lbo-calculator/"), ("PE interview questions", "/guides/private-equity-interview-questions/")]),
 "mk": ("Sales & trading / hedge funds", "You like speed, markets and making calls under pressure. Traders and investors bet on where prices are going.", "Banks hire sales &amp; trading interns; some hedge funds hire straight from college, many hire after a few years elsewhere.", [("S&T interview questions", "/guides/sales-and-trading-interview-questions/"), ("60-second mental math test", "/tools/mental-math-test/"), ("What is a hedge fund?", "/guides/what-is-a-hedge-fund/")]),
 "er": ("Equity research / asset management", "You love digging into one company until you know it better than anyone. Analysts decide which stocks are worth owning.", "Recruiting often runs sophomore winter through the summer before junior year. Have a stock pitch ready.", [("How to pitch a stock", "/guides/how-to-pitch-a-stock-interview/"), ("ER interview questions", "/guides/equity-research-interview-questions/"), ("DCF interview questions", "/guides/dcf-interview-questions/")]),
 "mc": ("Consulting", "You like solving business problems and explaining them clearly. Consultants help companies fix strategy and operations.", "Top firms have recruited for junior-summer internships around the summer before junior year.", [("Case interview guide", "/guides/consulting-case-interview/"), ("Market sizing questions", "/guides/market-sizing-questions/")]),
 "vc": ("Venture capital", "You're drawn to bold ideas and founders. VCs invest in young startups hoping a few become huge.", "Few VC jobs hire straight from college; many come from banking, consulting, startups or tech first.", [("Coffee chat questions", "/guides/coffee-chat-questions/"), ("Tell me about yourself", "/guides/tell-me-about-yourself-finance/")]),
 "cf": ("Corporate finance", "You want finance skills with more balance. Corporate finance teams plan budgets and big decisions inside one company.", "Many companies run finance rotational programs that hire seniors in the fall.", [("Free cash flow explained", "/guides/free-cash-flow-explained/"), ("What is EBITDA?", "/guides/what-is-ebitda/")]),
}
tool("finance-career-quiz", "Which Finance Career Fits You? (Free 8-Question Quiz)", "Which finance career fits you?",
 "Take a free 8-question quiz to see which finance career fits you best: investment banking, private equity, trading, equity research, consulting, venture capital or corporate finance.",
 ["8 quick questions about how you like to work. You'll get your best-fit finance career, your runner-up and where to start.",
  "Just for fun and direction. Talk to people in each field before you decide."],
 """<div class="tool"><div id="qz"></div><button class="btn" id="see">See my result</button><div id="out" aria-live="polite"></div></div>""",
 [("Is this quiz scientific?", "No. It's a fun way to point you toward careers to learn more about. Coffee chats with people in each field are the best way to decide."),
  ("Can I switch paths later?", "Yes. Lots of people move from banking to private equity, from consulting to corporate roles, or from any of them to startups.")],
 "const QZ=" + json.dumps(QZ) + ";const CAR=" + json.dumps(CAREERS) + r""";
$('#qz').innerHTML=QZ.map((q,i)=>`<div class="q"><p>${i+1}. ${q[0]}</p>${q[1].map((o,j)=>`<button class="opt" data-q="${i}" data-o="${j}">${o[0]}</button>`).join('')}</div>`).join('');
const ans={};$$('#qz .opt').forEach(b=>b.onclick=()=>{$$(`#qz .opt[data-q="${b.dataset.q}"]`).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');ans[b.dataset.q]=+b.dataset.o});
$('#see').onclick=()=>{const n=Object.keys(ans).length;if(n<QZ.length){$('#out').innerHTML=`<p class="warn">Answer all ${QZ.length} questions (${n} done).</p>`;return}
 const sc={};for(const k in CAR)sc[k]=0;QZ.forEach((q,i)=>{const w=q[1][ans[i]][1];for(const k in w)sc[k]+=w[k]});
 const top=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]),c=CAR[top[0]],r2=CAR[top[1]];
 $('#out').innerHTML=`<p class="label" style="margin-top:16px">Your best fit</p><div class="big">${c[0]}</div><p>${c[1]}</p><p class="muted">${c[2]}</p><ul class="more">${c[3].map(l=>`<li><a href="${l[1]}">${l[0]}</a></li>`).join('')}</ul><p>Runner-up: <b>${r2[0]}</b>.</p><button class="btn ghost" id="sh">Share my result</button>`;
 const txt=`My best-fit finance career is ${c[0].replace('&amp;','&')}. Find yours: https://mnaprep.com/tools/finance-career-quiz/`;
 $('#sh').onclick=()=>shareIt($('#sh'),{kicker:"WHICH FINANCE CAREER FITS YOU?",big:"🎯",title:c[0].replace('&amp;','&'),sub:"Take the free 8-question quiz",path:"/tools/finance-career-quiz/",file:"my-finance-career.png",text:txt},txt,"Share my result");
 $('#out').scrollIntoView({behavior:'smooth',block:'start'})};
""", short="quiz")

# ---------------------------------------------------------------- 10. Networking email generator
tool("networking-email-generator", "Finance Networking Email Generator (Cold Email + LinkedIn Templates)", "Networking email generator",
 "Free cold email generator for finance students. Fill in a few details and get a networking email, a LinkedIn note, a follow-up and a thank-you note for coffee chats.",
 ["Networking is how most students get their first interview in finance. Fill this in and get four ready-to-edit messages.",
  "Always add one real, specific detail. That's what gets replies."],
 """<div class="tool"><div class="row">
<div><label for="yn">Your first name</label><input id="yn" value="Alex"></div><div><label for="ys">Your school</label><input id="ys" value="Ohio State"></div>
<div><label for="yy">Your year</label><select id="yy"><option>freshman</option><option selected>sophomore</option><option>junior</option><option>senior</option></select></div>
<div><label for="tn">Their first name</label><input id="tn" value="Jordan"></div><div><label for="tf">Their firm</label><input id="tf" value="Goldman Sachs"></div><div><label for="tgp">Their group or role (optional)</label><input id="tgp" value="industrials group"></div>
<div><label for="cn">How you're connected</label><select id="cn"><option value="alum">They went to my school</option><option value="club">Same club or org</option><option value="town">Same hometown</option><option value="none">No connection</option></select></div>
<div><label for="go">What you're interested in</label><select id="go"><option value="investment banking">Investment banking</option><option value="private equity">Private equity</option><option value="sales and trading">Sales &amp; trading</option><option value="equity research">Equity research</option><option value="consulting">Consulting</option></select></div></div>
<label for="sp" style="margin-top:12px">One specific thing about them (optional)</label><input id="sp" placeholder="e.g. a deal their group worked on, or a post they wrote">
<div class="out" id="out"></div></div>""",
 [("How long should a networking email be?", "Short: 4–6 sentences. Who you are, how you found them, one specific reason you're reaching out, and a small ask (15 minutes)."),
  ("What if they don't reply?", "Send one polite follow-up after about a week. If there's still no reply, move on. Lots of people are just busy."),
  ("What do I ask on the call?", "See the <a href=\"/guides/coffee-chat-questions/\">coffee chat questions</a> guide.")],
 r"""
const ids=['#yn','#ys','#yy','#tn','#tf','#tgp','#cn','#go','#sp'];
function v(i){return $(i).value.trim()}
function gen(){const yn=v('#yn')||'[Your name]',ys=v('#ys')||'[School]',yy=v('#yy'),tn=v('#tn')||'[Name]',tf=v('#tf')||'[Firm]',gp=v('#tgp'),cn=v('#cn'),go=v('#go'),sp=v('#sp');
 const where=gp?`${gp} at ${tf}`:tf,hook={alum:`I saw you're a fellow ${ys} alum`,club:`I saw we were both part of the same club`,town:`I noticed we're from the same hometown`,none:`I came across your profile while learning about ${tf}`}[cn];
 const spec=sp?` I was especially interested in ${sp}.`:'';
 const email=`Subject: ${ys} ${yy} interested in ${go}\n\nHi ${tn},\n\nMy name is ${yn}, and I'm a ${yy} at ${ys} interested in ${go}. ${hook}, and I'd love to hear about your path to the ${where}.${spec}\n\nWould you have 15 minutes for a quick call in the next couple of weeks? I'm happy to work around your schedule.\n\nThank you,\n${yn}`;
 const li=`Hi ${tn}, I'm a ${yy} at ${ys} interested in ${go}. ${hook.replace(/^I /,'I ')} and would love to learn about your experience at ${tf}. Open to a quick chat? Thanks, ${yn}`;
 const fu=`Subject: Re: ${ys} ${yy} interested in ${go}\n\nHi ${tn},\n\nI wanted to follow up on my note from last week. I know you're busy, so even 10 minutes would mean a lot. If now isn't a good time, no worries at all.\n\nThanks again,\n${yn}`;
 const ty=`Subject: Thank you\n\nHi ${tn},\n\nThank you for taking the time to talk today. I really appreciated your advice on [one specific thing they said], and I'm going to [what you'll do with it].\n\nI'll keep you posted on how recruiting goes. Thanks again!\n\nBest,\n${yn}`;
 const box=(t,s,n)=>`<p class="label" style="margin-top:16px">${t}${n?` <span class="small">(${s.length} characters)</span>`:''}</p><pre>${s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre><button class="btn ghost cp" data-t="${encodeURIComponent(s)}">Copy</button>`;
 $('#out').innerHTML=box('Cold email',email)+box('LinkedIn connection note',li,1)+box('Follow-up (after about a week)',fu)+box('Thank-you note (same day as the call)',ty);
 $$('.cp').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(decodeURIComponent(b.dataset.t));b.textContent='Copied!'}catch(e){}})}
ids.forEach(i=>$(i).addEventListener('input',gen));gen();
""",
 """<h2>Tips that get replies</h2><ul><li>Email alumni first. Shared schools get the highest reply rates.</li><li>Send Tuesday–Thursday mornings.</li><li>Ask for 15 minutes, not a job or a referral.</li><li>Keep a simple tracker: name, firm, date sent, follow-up date, notes.</li></ul>
<p>Next: <a href="/guides/coffee-chat-questions/">coffee chat questions</a> and <a href="/guides/tell-me-about-yourself-finance/">tell me about yourself</a>.</p>""", short="email")

# ---------------------------------------------------------------- write pages
for t in TOOLS:
    d = os.path.join(ROOT, "tools", t["slug"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(
        shell(t["slug"], t["title"], t["h1"], t["desc"], t["lede"], t["body"], t["faqs"], t["js"])); print("tool", t["slug"])

# "More free tools" list on every tool page (old + new)
MORE = [("recruiting-timeline-calculator", "Recruiting timeline calculator"), ("finance-career-quiz", "Which finance career fits you?"), ("mental-math-test", "60-second mental math test"),
        ("superday-readiness-test", "Superday readiness test"), ("paper-lbo-practice", "Paper LBO practice"), ("lbo-calculator", "LBO calculator"), ("dcf-calculator", "DCF calculator"),
        ("networking-email-generator", "Networking email generator"), ("investment-banking-pay", "Investment banking pay by level")]
MORE = [m for m in MORE if m[0] in KEEP or os.path.isdir(os.path.join(ROOT, "tools", m[0]))]
more_html = '<h2>More free tools</h2><ul class="more">' + "".join(f'<li><a href="/tools/{s}/">{h}</a></li>' for s, h in MORE) + '<li><a href="/tools/">All free tools</a></li><li><a href="/deals/">M&amp;A deal database</a></li></ul>'
for d in os.listdir(os.path.join(ROOT, "tools")):
    f = os.path.join(ROOT, "tools", d, "index.html")
    if not os.path.isfile(f): continue
    s = open(f, encoding="utf-8").read(); s2 = re.sub(r'<h2>More free tools</h2><ul class="more">.*?</ul>', more_html, s, flags=re.S)
    if s2 != s: open(f, "w", encoding="utf-8").write(s2)

# cards on /tools/ (grouped), inserted before the CTA; idempotent via markers
GROUPS = [("Practice and quizzes", ["finance-career-quiz", "mental-math-test", "paper-lbo-practice"]),
          ("Calculators", ["lbo-calculator", "dcf-calculator", "wacc-calculator", "accretion-dilution-calculator", "enterprise-value-calculator", "compound-interest-calculator"]),
          ("Networking", ["networking-email-generator"])]
by = {t["slug"]: t for t in TOOLS}
GROUPS = [(g, [x for x in ss if x in by]) for g, ss in GROUPS if any(x in by for x in ss)]
cards = "<!--tools2-->" + "".join(f'<h2>{g}</h2>' + "".join(f'<div class="card"><h3><a href="/tools/{s}/">{e(by[s]["h1"])}</a></h3><p style="margin:0;color:var(--ink-2);font-size:15px">{e(by[s]["desc"])}</p></div>' for s in ss) for g, ss in GROUPS) + "<!--/tools2-->"
fi = os.path.join(ROOT, "tools", "index.html"); s = open(fi, encoding="utf-8").read()
s = re.sub(r"<!--tools2-->.*?<!--/tools2-->", "", s, flags=re.S).replace('<div class="cta">', cards + '<div class="cta">', 1)
s = s.replace("a recruiting timeline calculator, a Superday readiness test and IB pay by level.", "an LBO calculator, a 60-second mental math test, a finance career quiz and more.")
open(fi, "w", encoding="utf-8").write(s); print("tools index updated")

# sitemap
sm = os.path.join(ROOT, "sitemap.xml"); s = open(sm, encoding="utf-8").read()
for t in TOOLS:
    loc = f"{SITE}/tools/{t['slug']}/"
    if loc not in s:
        s = s.replace("</urlset>", f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>")
open(sm, "w", encoding="utf-8").write(s); print("sitemap:", s.count("<url>"))

# short links
nt = os.path.join(ROOT, "netlify.toml"); s = open(nt, encoding="utf-8").read()
for t in TOOLS:
    if t["short"] and f'from = "/{t["short"]}"' not in s:
        s = s.replace('[[redirects]]\n  from = "/superday"', f'[[redirects]]\n  from = "/{t["short"]}"\n  to = "/tools/{t["slug"]}/"\n  status = 301\n\n[[redirects]]\n  from = "/superday"', 1)
open(nt, "w", encoding="utf-8").write(s); print("short links done")
