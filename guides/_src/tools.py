#!/usr/bin/env python3
"""Builds the free tools under /tools/ (same look as the guides). Run from the repo root:
python3 guides/_src/tools.py   (then python3 guides/_src/seo.py-style tags are added below)."""
import os, json, re, html, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
base = open(os.path.join(ROOT, "guides", "dcf-interview-questions", "index.html"), encoding="utf-8").read()
STYLE = base[base.index("<style>"):base.index("</style>") + 8]
FONTS = base[base.index('<link rel="preconnect"'):base.index("<style>")]
NUNITO = '<link rel="stylesheet" href="/fonts/fonts.css">'
TODAY = datetime.date.today().isoformat()
e = lambda s: html.escape(s, quote=True)
SITE = "https://mnaprep.com"
ICONS = ('<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml">'
         '<link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">'
         '<meta name="robots" content="max-image-preview:large"><link rel="alternate" type="application/rss+xml" title="M&amp;A Prep guides" href="/feed.xml">')

COLOR = open(os.path.join(ROOT, "guides", "_src", "color.css.html"), encoding="utf-8").read()
TOOL_CSS = """<style>
.tool{background:var(--sheet);border:1px solid var(--rule);border-radius:16px;padding:18px;margin:18px 0}
.tool label{display:block;font-size:13px;font-weight:600;color:var(--ink-2);margin:0 0 6px}
.tool select,.tool input{font:inherit;font-size:16px;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink);width:100%}
.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.btn{display:inline-block;border:0;cursor:pointer;background:var(--cobalt);color:#fff;font:inherit;font-weight:600;border-radius:10px;padding:12px 20px;margin-top:14px;text-decoration:none}
.ghost{background:transparent;color:var(--cobalt);border:1px solid var(--rule)}
.tl{list-style:none;padding:0;margin:14px 0 0}.tl li{position:relative;padding:0 0 16px 22px;border-left:2px solid var(--rule);margin-left:6px}
.tl li::before{content:"";position:absolute;left:-7px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--rule)}
.tl li.now::before{background:var(--cobalt)}.tl li.hot::before{background:#E0A526}.tl li.done{opacity:.55}
.tl b{display:block}.tl .when{font-family:"IBM Plex Mono",monospace;font-size:12.5px;color:var(--ink-2)}
.big{font-size:30px;font-weight:800;margin:4px 0}.muted{color:var(--ink-2);font-size:14px}
.q{margin:0 0 18px}.q p{font-weight:600;margin:0 0 8px}.opt{display:block;width:100%;text-align:left;font:inherit;font-size:15.5px;background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:10px;padding:10px 12px;margin:6px 0;cursor:pointer}
.opt.sel{border-color:var(--cobalt);box-shadow:0 0 0 1px var(--cobalt)}.opt.ok{border-color:var(--good);background:rgba(30,127,79,.12)}.opt.bad{border-color:#C33;background:rgba(204,51,51,.1)}
.why{font-size:14.5px;color:var(--ink-2);border-left:3px solid var(--good);padding-left:10px;margin-top:6px}
.bars{margin:12px 0 0}.bar{display:grid;grid-template-columns:120px 1fr 80px;gap:10px;align-items:center;margin:8px 0;font-size:14.5px}
.bar .t{height:16px;border-radius:6px;background:var(--rule);overflow:hidden}.bar .t i{display:block;height:100%;background:var(--cobalt);border-radius:6px}
.bar b{text-align:right;font-variant-numeric:tabular-nums}.seg{display:flex;flex-wrap:wrap;gap:6px}.seg button{font:inherit;font-size:14px;padding:7px 12px;border-radius:99px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);cursor:pointer}.seg button.on{background:var(--cobalt);color:#fff;border-color:var(--cobalt)}
@media(max-width:480px){.bar{grid-template-columns:92px 1fr 66px}}
</style>"""

def shell(slug, title, h1, desc, lede, body, faqs, script, kind="WebApplication"):
    url = f"{SITE}/tools/{slug}/" if slug else f"{SITE}/tools/"
    ld = [{"@context": "https://schema.org", "@type": kind, "name": h1, "description": desc, "url": url,
           **({"applicationCategory": "EducationalApplication", "operatingSystem": "Any", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}} if kind == "WebApplication" else {}),
           "publisher": {"@type": "Organization", "name": "M&A Prep", "url": SITE}},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "M&A Prep", "item": SITE + "/"},
              {"@type": "ListItem", "position": 2, "name": "Free tools", "item": SITE + "/tools/"}] + ([{"@type": "ListItem", "position": 3, "name": h1, "item": url}] if slug else [])}]
    if faqs:
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}} for q, a in faqs]})
    img = slug or "tools"
    t = f"{title} | M&A Prep"
    faq_html = "".join(f'<details><summary>{e(q)}</summary><div class="ans">{a}</div></details>' for q, a in faqs)
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(t)}</title><meta property="og:image" content="{SITE}/img/og/{img}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{SITE}/img/og/{img}.jpg">{ICONS}
<meta name="description" content="{e(desc)}"><link rel="canonical" href="{url}">
<meta property="og:title" content="{e(t)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:type" content="website"><meta property="og:site_name" content="M&amp;A Prep">
<meta name="theme-color" content="#13203B">
{FONTS}{STYLE}{TOOL_CSS}{COLOR}
{''.join(f'<script type="application/ld+json">{json.dumps(x)}</script>' for x in ld)}
{NUNITO}
</head><body>
<header class="top"><div class="wrap"><a class="brand" href="/">M<span>&amp;</span>A</a><a class="topcta" href="/">Train free</a></div></header>
<main class="wrap"><p class="crumb"><a href="/">M&amp;A Prep</a> › <a href="/tools/">Free tools</a></p><h1>{e(h1)}</h1><div class="lede">{''.join(f'<p>{x}</p>' for x in lede)}</div>
{body}
{('<h2>Common questions</h2>' + faq_html) if faqs else ''}
<div class="cta"><p>Practice real interview questions in 5-minute levels, free.</p><a href="/">Start training on M&amp;A Prep</a></div>
<h2>More free tools</h2><ul class="more"><li><a href="/tools/recruiting-timeline-calculator/">Recruiting timeline calculator</a></li><li><a href="/tools/superday-readiness-test/">Superday readiness test</a></li><li><a href="/tools/investment-banking-pay/">Investment banking pay by level</a></li><li><a href="/tools/embed/">Question of the day widget</a></li><li><a href="/deals/">M&amp;A deal database</a></li><li><a href="/guides/">All free guides</a></li></ul></main>
<footer><div class="wrap">M&amp;A Prep is a free, game-style way to train for investment banking, private equity, hedge fund, restructuring and consulting interviews. <a href="/">Start training</a>.</div></footer>
<script>{script}</script>
<script src="/js/sharecard.js" defer></script>
<script src="/js/hit.js" defer></script><script src="/js/grow.js" defer></script>
<script src="/js/email.js" defer></script>
</body></html>
"""

# ---------- 1. Recruiting timeline calculator ----------
T1_BODY = """<div class="tool"><div class="row">
<div><label for="gy">Your college graduation year</label><select id="gy"></select></div>
<div><label for="tg">What you're aiming for</label><select id="tg">
<option value="ib">Investment banking</option><option value="pe">Private equity (usually via banking first)</option>
<option value="st">Sales &amp; trading / markets</option><option value="am">Asset management / equity research</option>
<option value="mc">Consulting</option></select></div></div>
<button class="btn" id="go">Show my timeline</button>
<div id="out" aria-live="polite"></div></div>
<p class="muted">Typical timing for US summer internships based on how recent cycles have run. Every firm sets its own dates, so check each firm's careers page and set alerts.</p>"""

T1_JS = r"""
const $=s=>document.querySelector(s),M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now=new Date(),cy=now.getFullYear();
for(let y=cy;y<=cy+6;y++){const o=document.createElement("option");o.value=y;o.textContent=y+(y===cy+3||y===cy+4?"":"");$("#gy").appendChild(o)}
$("#gy").value=cy+3;
const d=(y,m)=>new Date(y,m,1),lab=(a,b)=>M[a.getMonth()]+" "+a.getFullYear()+(b?" – "+M[b.getMonth()]+" "+b.getFullYear():"");
function plan(G,t){const F=G-4; /* freshman fall year */
 const base=[
  [d(F,7),d(F+1,4),"Freshman year","Join 1–2 finance clubs, keep your GPA high (aim 3.5+), learn the three statements and basic valuation."],
  [d(F,8),d(F+1,3),"Early-insight programs","Many banks run programs for first- and second-years exploring finance. Applications often open in freshman fall and winter."]];
 const S={
  ib:[[d(F+1,4),d(F+1,8),"Get recruiting-ready","The summer after freshman year: finish technical prep, polish your resume and start coffee chats with alumni at target banks."],
      [d(F+1,9),d(F+2,5),"Main IB application window","Sophomore fall through spring: junior-summer IB applications, HireVues, interviews and Superdays. Recent cycles have opened as early as sophomore fall."],
      [d(G-1,5),d(G-1,7),"Junior summer internship","Your summer analyst internship. A strong summer usually ends with a full-time offer."]],
  pe:[[d(F+1,9),d(F+2,5),"Recruit for IB first","Most private equity associates spent 2 years in banking. Recruit for IB on the same timeline (sophomore year)."],
      [d(G-1,5),d(G-1,7),"Junior summer: IB internship","Do great here and get the full-time offer."],
      [d(G,6),d(G+1,11),"PE recruiting as a first-year analyst","\"On-cycle\" PE recruiting for analysts has often started within the first year in banking, sometimes just months after starting."]],
  st:[[d(F+1,10),d(F+2,6),"Markets application window","Sales &amp; trading applications often run sophomore fall through spring. Learn to pitch a trade and follow markets daily."],
      [d(G-1,5),d(G-1,7),"Junior summer internship","Rotations across desks; full-time offers usually follow."]],
  am:[[d(F+1,11),d(F+2,8),"AM / research window","Asset management and equity research programs often recruit sophomore winter through the summer before junior year. Have 1–2 stock pitches ready."],
      [d(G-1,5),d(G-1,7),"Junior summer internship","Often leads to a full-time offer."]],
  mc:[[d(F+2,5),d(F+2,7),"Top consulting firms apply","For junior-summer consulting internships, the biggest firms have opened applications around the summer before junior year."],
      [d(F+2,8),d(F+2,11),"Other consulting firms","Big 4 and other firms often recruit in junior fall. Practice case interviews weekly."],
      [d(G-1,5),d(G-1,7),"Junior summer internship","Usually leads to a full-time offer."]]};
 return base.concat(S[t]).sort((a,b)=>a[0]-b[0])}
function show(){const G=+$("#gy").value,t=$("#tg").value,P=plan(G,t),key=P.find(p=>/application window|apply|Recruit for IB/i.test(p[2]))||P[2];
 const months=Math.round((key[0]-now)/(30.44*864e5));
 const head=months>0?`<div class="big">${months} month${months===1?"":"s"}</div><p class="muted">until your main application window opens (${lab(key[0])}).</p>`
   :key[1]>now?`<div class="big">It's open now</div><p class="muted">Your main application window runs until about ${lab(key[1])}. Apply this week.</p>`
   :`<div class="big">Window has passed</div><p class="muted">Look for off-cycle roles, smaller firms, or the next cycle.</p>`;
 $("#out").innerHTML=head+`<ul class="tl">${P.map(p=>{const cls=p[1]<now?"done":(p[0]<=now&&now<=p[1])?"now":p===key?"hot":"";
   return `<li class="${cls}"><span class="when">${lab(p[0],p[1])}</span><b>${p[2]}</b>${p[3]}</li>`}).join("")}</ul>
   <p class="muted">Want alerts the day applications open? <a href="/">Track openings on M&amp;A Prep</a>.</p>`;
 try{history.replaceState(null,"","?y="+G+"&t="+t)}catch(e){}}
const q=new URLSearchParams(location.search);if(q.get("y"))$("#gy").value=q.get("y");if(q.get("t"))$("#tg").value=q.get("t");
$("#go").onclick=show;if(q.get("y"))show();
"""

T1_FAQ = [
 ("When should I start recruiting for investment banking?", "Freshman year for clubs and basics. The main applications for junior-summer internships now happen during sophomore year (recent cycles opened as early as sophomore fall), about 1.5–2 years before the internship."),
 ("Why is banking recruiting so early?", "Banks compete for the same students, so they keep moving dates earlier. That's why sophomores now interview for internships that start the summer after junior year."),
 ("Do these dates apply to every firm?", "No. They're typical timing. Each bank sets its own dates, so check careers pages and set alerts."),
]

# ---------- 2. Superday readiness test ----------
QS = [
 ("Depreciation goes up by $10 and the tax rate is 25%. What happens to cash at the end of the year (ignoring everything else)?", ["Down $10", "Down $7.50", "Up $2.50", "No change"], 2, "Net income falls $7.50, but you add back the $10 non-cash depreciation, so cash goes up $2.50 (the tax savings)."),
 ("To get from equity value to enterprise value, you usually…", ["Add cash, subtract debt", "Add debt, subtract cash", "Add both debt and cash", "Subtract both debt and cash"], 1, "Enterprise value = equity value + debt (and other claims like preferred stock) − cash."),
 ("A company borrows $100 and keeps it as cash. What happens to its enterprise value?", ["Up $100", "Down $100", "No change", "Up $200"], 2, "Debt goes up $100 and cash goes up $100, so they cancel out. Enterprise value doesn't change."),
 ("Which is usually cheaper for a company: debt or equity?", ["Equity, because there are no required payments", "Debt, because interest is tax-deductible and lenders get paid first", "They always cost the same", "It depends only on the stock price"], 1, "Lenders take less risk (paid first) and interest is tax-deductible, so debt is usually cheaper than equity."),
 ("Which is the Gordon Growth terminal value formula?", ["FCF × (1 + g) ÷ (WACC − g)", "FCF ÷ WACC × g", "EBITDA × exit multiple", "FCF × (WACC − g)"], 0, "Next year's free cash flow divided by (discount rate − growth rate). EBITDA × multiple is the other method, not Gordon Growth."),
 ("A PE firm buys a company and sells it for 2x its equity in 5 years, with no dividends. What's the IRR, roughly?", ["About 10%", "About 15%", "About 20%", "About 26%"], 1, "2x in 5 years is about a 15% IRR. (2x in 3 years is about 26%.)"),
 ("Buyer P/E is 20x, target P/E is 15x, and the deal is all stock with no synergies. Accretive or dilutive?", ["Accretive", "Dilutive", "Neither", "Can't tell without the share count"], 0, "The buyer pays with 'expensive' stock (5% earnings yield) for 'cheaper' earnings (6.7% yield), so EPS goes up: accretive."),
 ("A company is losing money. Which multiple makes the most sense?", ["P/E", "EV/EBITDA", "EV/Revenue", "Dividend yield"], 2, "With negative earnings, P/E and EV/EBITDA don't work, so you use revenue-based multiples."),
 ("When you calculate unlevered free cash flow, which do you NOT subtract?", ["Taxes on operating income", "Capital expenditures", "Increase in working capital", "Interest expense"], 3, "Unlevered free cash flow is before any payments to lenders, so interest is left out."),
 ("Where do you find retained earnings?", ["Income statement", "Balance sheet", "Cash flow statement", "Footnotes only"], 1, "Retained earnings sit in shareholders' equity on the balance sheet."),
 ("Quick math: what's 15% of 360?", ["36", "48", "54", "60"], 2, "10% is 36 and 5% is 18, so 36 + 18 = 54."),
 ("An interviewer asks you to walk through a recent deal. What should you lead with?", ["Your opinion on the CEO", "Who bought whom, the price, and why the deal makes sense", "The exact legal terms", "Which bank you think lost the pitch"], 1, "Lead with the basics: buyer, target, size or multiple, and the strategic reason. Then share your view."),
]
T2_BODY = """<div class="tool"><div id="qs"></div><p style="margin:14px 0 6px"><label for="sch"><b>Your school</b> (optional, to count toward the school board)</label></p><select id="sch" style="font:inherit;padding:9px 10px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink);max-width:100%"><option value="">Skip</option><option value="akron">Akron</option><option value="alabama-culverhouse">Alabama</option><option value="american-kogod">American (Kogod)</option><option value="amherst">Amherst</option><option value="appalachian-state">Appalachian State</option><option value="arizona-eller">Arizona</option><option value="arizona-state-wp-carey">Arizona State</option><option value="arkansas-walton">Arkansas</option><option value="auburn-harbert">Auburn</option><option value="babson">Babson</option><option value="baruch-zicklin">Baruch</option><option value="bates">Bates</option><option value="baylor-hankamer">Baylor</option><option value="belmont">Belmont</option><option value="bentley">Bentley</option><option value="binghamton">Binghamton</option><option value="boston-college">Boston College</option><option value="boston-university-questrom">Boston University</option><option value="bowdoin">Bowdoin</option><option value="brandeis">Brandeis</option><option value="brown">Brown</option><option value="bryant">Bryant</option><option value="bucknell">Bucknell</option><option value="butler">Butler</option><option value="byu">BYU</option><option value="cal-poly-slo-orfalea">Cal Poly San Luis Obispo</option><option value="cmu-tepper">Carnegie Mellon</option><option value="case-western-weatherhead">Case Western</option><option value="charlotte-belk">Charlotte</option><option value="cincinnati-lindner">Cincinnati</option><option value="claremont-mckenna">Claremont McKenna</option><option value="clemson">Clemson</option><option value="colby">Colby</option><option value="colgate">Colgate</option><option value="college-of-charleston">College of Charleston</option><option value="colorado-leeds">Colorado</option><option value="colorado-college">Colorado College</option><option value="columbia">Columbia</option><option value="cornell">Cornell</option><option value="creighton-heider">Creighton</option><option value="dartmouth">Dartmouth</option><option value="davidson">Davidson</option><option value="dayton">Dayton</option><option value="denison">Denison</option><option value="denver-daniels">Denver</option><option value="depaul-driehaus">DePaul</option><option value="depauw">DePauw</option><option value="dickinson">Dickinson</option><option value="drexel-lebow">Drexel</option><option value="duke">Duke</option><option value="duquesne">Duquesne</option><option value="elon-love">Elon</option><option value="emory-goizueta">Emory</option><option value="fairfield-dolan">Fairfield</option><option value="fiu">FIU</option><option value="florida">Florida</option><option value="florida-state">Florida State</option><option value="fordham-gabelli">Fordham</option><option value="franklin-marshall">Franklin & Marshall</option><option value="furman">Furman</option><option value="george-mason">George Mason</option><option value="george-washington">George Washington</option><option value="georgetown">Georgetown</option><option value="georgia-terry">Georgia</option><option value="georgia-state">Georgia State</option><option value="georgia-tech-scheller">Georgia Tech</option><option value="gettysburg">Gettysburg</option><option value="gonzaga">Gonzaga</option><option value="grand-valley-state">Grand Valley State</option><option value="grinnell">Grinnell</option><option value="hamilton">Hamilton</option><option value="hampden-sydney">Hampden-Sydney</option><option value="harvard">Harvard</option><option value="haverford">Haverford</option><option value="hillsdale">Hillsdale</option><option value="hofstra-zarb">Hofstra</option><option value="holy-cross">Holy Cross</option><option value="hope-college">Hope College</option><option value="houston-bauer">Houston</option><option value="howard">Howard</option><option value="illinois-gies">Illinois Gies</option><option value="indiana-kelley">Indiana Kelley</option><option value="iowa-tippie">Iowa</option><option value="iowa-state-ivy">Iowa State</option><option value="james-madison">James Madison</option><option value="john-carroll">John Carroll</option><option value="johns-hopkins">Johns Hopkins</option><option value="kansas">Kansas</option><option value="kent-state">Kent State</option><option value="kentucky-gatton">Kentucky</option><option value="kenyon">Kenyon</option><option value="lafayette">Lafayette</option><option value="lehigh">Lehigh</option><option value="loyola-chicago-quinlan">Loyola Chicago</option><option value="loyola-maryland-sellinger">Loyola Maryland</option><option value="loyola-marymount">Loyola Marymount</option><option value="lsu-ourso">LSU</option><option value="macalester">Macalester</option><option value="manhattan-college">Manhattan College</option><option value="marist">Marist</option><option value="marquette">Marquette</option><option value="maryland-smith">Maryland</option><option value="miami-herbert">Miami</option><option value="miami-university">Miami University</option><option value="michigan-ross">Michigan Ross</option><option value="michigan-state-broad">Michigan State</option><option value="middlebury">Middlebury</option><option value="minnesota-carlson">Minnesota</option><option value="missouri-trulaske">Missouri</option><option value="mit">MIT</option><option value="morehouse">Morehouse</option><option value="nc-state-poole">NC State</option><option value="nebraska">Nebraska</option><option value="northeastern-damore-mckim">Northeastern</option><option value="northwestern">Northwestern</option><option value="notre-dame">Notre Dame</option><option value="nyu-stern">NYU Stern</option><option value="ohio-state">Ohio State</option><option value="ohio-university">Ohio University</option><option value="oklahoma-price">Oklahoma</option><option value="oklahoma-state-spears">Oklahoma State</option><option value="ole-miss">Ole Miss</option><option value="oregon-lundquist">Oregon</option><option value="pace-lubin">Pace</option><option value="penn-state">Penn State</option><option value="pepperdine">Pepperdine</option><option value="pitt">Pitt</option><option value="pomona">Pomona</option><option value="princeton">Princeton</option><option value="providence-college">Providence College</option><option value="purdue">Purdue</option><option value="quinnipiac">Quinnipiac</option><option value="rhodes">Rhodes</option><option value="rice">Rice</option><option value="richmond-robins">Richmond</option><option value="rochester">Rochester</option><option value="rollins">Rollins</option><option value="rpi-lally">RPI</option><option value="rutgers">Rutgers</option><option value="sacred-heart">Sacred Heart</option><option value="saint-josephs-haub">Saint Joseph's</option><option value="saint-louis-chaifetz">Saint Louis University</option><option value="samford">Samford</option><option value="san-diego-state-fowler">San Diego State</option><option value="santa-clara-leavey">Santa Clara</option><option value="seton-hall-stillman">Seton Hall</option><option value="sewanee">Sewanee</option><option value="siena">Siena</option><option value="skidmore">Skidmore</option><option value="smu-cox">SMU</option><option value="south-carolina-darla-moore">South Carolina</option><option value="south-florida-muma">South Florida</option><option value="spelman">Spelman</option><option value="st-johns-tobin">St. John's</option><option value="stanford">Stanford</option><option value="stetson">Stetson</option><option value="stevens">Stevens Institute of Technology</option><option value="suny-geneseo">SUNY Geneseo</option><option value="swarthmore">Swarthmore</option><option value="syracuse-whitman">Syracuse</option><option value="tcnj">TCNJ</option><option value="tcu-neeley">TCU</option><option value="temple-fox">Temple</option><option value="tennessee-haslam">Tennessee</option><option value="texas-am">Texas A&M</option><option value="texas-tech-rawls">Texas Tech</option><option value="toledo">Toledo</option><option value="trinity-college">Trinity College</option><option value="trinity-university">Trinity University</option><option value="tufts">Tufts</option><option value="tulane-freeman">Tulane</option><option value="berkeley-haas">UC Berkeley</option><option value="uc-davis">UC Davis</option><option value="uc-irvine-merage">UC Irvine</option><option value="uc-san-diego">UC San Diego</option><option value="uc-santa-barbara">UC Santa Barbara</option><option value="ucf">UCF</option><option value="uchicago">UChicago</option><option value="ucla">UCLA</option><option value="uconn">UConn</option><option value="umass-isenberg">UMass Amherst</option><option value="unc-kenan-flagler">UNC</option><option value="unh-paul">UNH</option><option value="union-college">Union College</option><option value="buffalo">University at Buffalo</option><option value="uri">URI</option><option value="usc-marshall">USC</option><option value="ut-austin">UT Austin</option><option value="utah-eccles">Utah</option><option value="uva-mcintire">UVA</option><option value="uvm-grossman">UVM</option><option value="vanderbilt">Vanderbilt</option><option value="vassar">Vassar</option><option value="villanova">Villanova</option><option value="virginia-tech-pamplin">Virginia Tech</option><option value="wabash">Wabash</option><option value="wake-forest">Wake Forest</option><option value="washington-foster">Washington</option><option value="washington-and-lee">Washington and Lee</option><option value="washu-olin">WashU</option><option value="wesleyan">Wesleyan</option><option value="western-michigan-haworth">Western Michigan</option><option value="wharton">Wharton</option><option value="wheaton-illinois">Wheaton (IL)</option><option value="william-and-mary-mason">William & Mary</option><option value="williams-college">Williams College</option><option value="wisconsin">Wisconsin</option><option value="wofford">Wofford</option><option value="xavier">Xavier</option><option value="yale">Yale</option></select><p style="margin:14px 0 0"><button class="btn" id="grade">See my score</button></p><div id="res" aria-live="polite"></div></div><h2>School leaderboard</h2><div class="card" id="board"><p class="muted">Loading…</p></div>"""
T2_JS = "const QS=" + json.dumps(QS) + r""";
const $=s=>document.querySelector(s),pick={};
$("#qs").innerHTML=QS.map((q,i)=>`<div class="q"><p>${i+1}. ${q[0]}</p>${q[1].map((o,j)=>`<button class="opt" data-q="${i}" data-o="${j}">${o}</button>`).join("")}<div class="why" id="w${i}" hidden></div></div>`).join("");
$("#qs").onclick=ev=>{const b=ev.target.closest(".opt");if(!b||$("#qs").dataset.done)return;const i=+b.dataset.q;pick[i]=+b.dataset.o;
 document.querySelectorAll(`.opt[data-q="${i}"]`).forEach(x=>x.classList.toggle("sel",x===b))};
$("#grade").onclick=()=>{const n=Object.keys(pick).length;if(n<QS.length&&!confirm(`You've answered ${n} of ${QS.length}. Grade anyway?`))return;
 let s=0;QS.forEach((q,i)=>{const ok=pick[i]===q[2];if(ok)s++;
  document.querySelectorAll(`.opt[data-q="${i}"]`).forEach(x=>{const j=+x.dataset.o;if(j===q[2])x.classList.add("ok");else if(j===pick[i])x.classList.add("bad")});
  const w=$("#w"+i);w.hidden=false;w.textContent=(ok?"Right. ":"Not quite. ")+q[3]});
 $("#qs").dataset.done=1;
 const tier=s>=11?["Superday ready","You'd hold your own in a final round. Keep it sharp with timed practice."]:s>=8?["Close","Solid base. Tighten the misses and practice explaining answers out loud."]:s>=5?["Getting there","You know the ideas. Drill accounting and valuation until the answers are automatic."]:["Start with the basics","Begin with the three statements and enterprise value, then come back."];
 const txt=`I scored ${s}/${QS.length} on the Superday readiness test: ${tier[0]}. Try it: https://mnaprep.com/tools/superday-readiness-test/`;
 $("#res").innerHTML=`<div class="big">${s} / ${QS.length}</div><p><b>${tier[0]}.</b> ${tier[1]}</p><a class="btn" href="/">Practice 1,000+ more questions free</a> <button class="btn ghost" id="share">Share my score</button>`;
 $("#share").onclick=async()=>{const b=$("#share");try{if(window.shareCard){b.textContent="Making your card…";const r=await shareCard({kicker:"Superday readiness test",big:`${s}/${QS.length}`,title:tier[0],sub:"Think you can beat me? Take the free 3-minute test.",short:"/superday",path:"/tools/superday-readiness-test/",file:`superday-score-${s}-of-${QS.length}.png`,text:txt});b.textContent=r==="downloaded"?"Saved! Post it to your story":"Share my score";return}if(navigator.share)await navigator.share({text:txt});else{await navigator.clipboard.writeText(txt);b.textContent="Copied!"}}catch(e){b.textContent="Share my score"}};
 sendScore(s);$("#res").scrollIntoView({behavior:"smooth",block:"center"})};

const NAMES={};document.querySelectorAll("#sch option").forEach(o=>{if(o.value)NAMES[o.value]=o.textContent});
const vid=()=>{try{return localStorage.getItem("ma-vid")||""}catch(e){return""}};
async function loadBoard(mine){const el=$("#board");try{const r=await fetch("/.netlify/functions/school-score");const d=await r.json();
 if(!d.top.length){const need=d.min;el.innerHTML=`<p>No school has ${need}+ scores yet. Pick your school above and take the test to help yours get on the board.</p>`+note();return}
 el.innerHTML=`<table><thead><tr><th>#</th><th>School</th><th>Avg score (out of ${d.total})</th><th>Test takers</th></tr></thead><tbody>`+d.top.map((o,i)=>`<tr${o.school===mine?' style="font-weight:700"':""}><td>${i+1}</td><td>${NAMES[o.school]||o.school}</td><td>${o.avg}</td><td>${o.n}</td></tr>`).join("")+`</tbody></table>`+
 (mine&&d.ranked.indexOf(mine)>9?`<p>Your school is #${d.ranked.indexOf(mine)+1} of ${d.ranked.length} ranked.</p>`:"")+(mine&&d.counts[mine]&&d.counts[mine]<d.min?`<p>${NAMES[mine]} has ${d.counts[mine]} of the ${d.min} scores it needs to be ranked. Share the test with classmates.</p>`:"")+note()}
 catch(e){el.innerHTML="<p>The board isn't available right now. Try again later.</p>"}}
const note=()=>`<p class="muted" style="font-size:13.5px">Self-reported and unverified: each person's first attempt counts once, and a school needs ${5} scores to be ranked. For verified .edu school boards see the <a href="/#series">National Collegiate Series</a>.</p>`;
async function sendScore(s){const sc=$("#sch").value;let mine=sc;
 try{const done=localStorage.getItem("ma-sdscore");
  if(sc&&!done&&vid()){await fetch("/.netlify/functions/school-score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({school:sc,score:s,v:vid()})});localStorage.setItem("ma-sdscore","1")}}catch(e){}
 loadBoard(mine)}
loadBoard("");
"""
T2_FAQ = [
 ("What is a Superday?", "The final round of investment banking recruiting: several back-to-back interviews in one day, usually 3–6, with bankers from analyst to managing director. See the <a href=\"/guides/superday-guide/\">full Superday guide</a>."),
 ("What questions come up in a Superday?", "A mix of technicals (accounting, enterprise value, valuation, DCF, M&amp;A and LBOs), fit questions (your story, why banking, why this firm) and sometimes quick math or a deal discussion."),
 ("How do I get better fast?", "Practice out loud every day for a couple of weeks, focusing on the topics you miss. Explaining clearly matters as much as knowing the answer."),
]

# ---------- 3. IB pay by level ----------
# Prospect Rock Partners 2025 IB Compensation Report (866 responses collected Q1 2026, covering 2025 pay), as published in their summary article.
PAY = [
 ["Analyst 1", {"all": 160}],
 ["Associate 1", {"bb": 280, "eb": 400}],
 ["Associate 2", {"bb": 339, "mm": 340}],
 ["Associate 3", {"bb": 450, "mm": 410}],
 ["VP 1", {"all": 525}],
 ["VP 2", {"bb": 580, "eb": 660, "mm": 500}],
 ["Exec. Director", {"bb": 878, "eb": 788}],
 ["MD (1–3 yrs)", {"bb": 1200, "eb": 1325}],
 ["MD (4+ yrs)", {"all": 1100, "bb": 1600, "eb": 1600}],
]
T3_BODY = """<div class="tool"><label>Bank type</label><div class="seg" id="seg">
<button data-k="bb" class="on">Bulge bracket</button><button data-k="eb">Elite boutique</button><button data-k="mm">Middle market</button></div>
<div class="bars" id="bars"></div>
<p class="muted" id="note"></p></div>
<h2>The numbers</h2><div class="tbl"><table><thead><tr><th>Level</th><th>Bulge bracket</th><th>Elite boutique</th><th>Middle market</th><th>All banks</th></tr></thead><tbody id="tb"></tbody></table></div>
<p class="muted">Total yearly pay (salary + bonus) for 2025 in US dollars, from the <a href="https://prospectrockpartners.com/prospect-rock-partners-2025-ib-compensation-report/" rel="nofollow">Prospect Rock Partners 2025 IB Compensation Report</a> (866 survey responses collected in early 2026). Figures are survey medians or reported data points; "—" means the public summary didn't report it. "All banks" for VP 1 is the New York median. Real offers vary by bank, city, group and year.</p>"""
T3_JS = "const PAY=" + json.dumps(PAY) + r""";
const $=s=>document.querySelector(s),f=v=>v>=1000?"$"+(v/1000).toFixed(v%1000?2:1).replace(/0$/,"")+"M":"$"+v+"K";
const N={bb:"bulge bracket",eb:"elite boutique",mm:"middle market"};
function draw(k){const rows=PAY.map(([l,o])=>[l,o[k]!=null?o[k]:o.all,o[k]==null&&o.all!=null]).filter(r=>r[1]!=null);
 const mx=Math.max(...rows.map(r=>r[1]));
 $("#bars").innerHTML=rows.map(r=>`<div class="bar"><span>${r[0]}${r[2]?"*":""}</span><span class="t"><i style="width:${(r[1]/mx*100).toFixed(1)}%"></i></span><b>${f(r[1])}</b></div>`).join("");
 const miss=PAY.filter(([l,o])=>o[k]==null&&o.all==null).map(p=>p[0]);
 $("#note").textContent=(rows.some(r=>r[2])?"* All-bank figure (the survey summary didn't break it out for "+N[k]+"). ":"")+(miss.length?"Not reported for "+N[k]+": "+miss.join(", ")+".":"");
 document.querySelectorAll("#seg button").forEach(b=>b.classList.toggle("on",b.dataset.k===k))}
$("#seg").onclick=e=>{const b=e.target.closest("button");if(b)draw(b.dataset.k)};draw("bb");
$("#tb").innerHTML=PAY.map(([l,o])=>`<tr><td>${l}</td>${["bb","eb","mm","all"].map(k=>`<td>${o[k]!=null?f(o[k]):"—"}</td>`).join("")}</tr>`).join("");
"""
T3_FAQ = [
 ("How much do first-year investment banking analysts make?", "The survey's median total pay for first-year analysts in 2025 was about $160K (salary plus bonus). Pay varies by bank, city and group."),
 ("Why does pay jump so much at associate and above?", "Bonuses become a much bigger share of pay as bankers take on more responsibility for deals and clients."),
 ("Do elite boutiques pay more than bulge brackets?", "Often at some levels, per this survey (for example Associate 1 and VP 2), but not at every level. Compare actual offers rather than averages."),
]


EXTRA = {
 "recruiting-timeline-calculator": """<h2>How investment banking recruiting works, year by year</h2>
<p>Most students land a full-time investment banking job through a <b>junior-summer internship</b>. Banks hire their summer analysts early, often a year and a half before the internship starts, so the real work happens in your first two years of college.</p>
<h3>Freshman year: build the base</h3>
<p>Join one or two finance clubs, keep your GPA high (many banks screen at 3.5), and learn accounting basics: how the income statement, balance sheet and cash flow statement connect. Apply to early-insight and diversity programs. Some of them feed straight into internship interviews.</p>
<h3>Sophomore year: the main window</h3>
<p>Applications for junior-summer internships at many large banks open during sophomore year. That's when you send applications, do online assessments and HireVues, and go to first rounds and Superdays. Networking with alumni before applications open matters a lot, because a referral often decides who gets an interview.</p>
<h3>Junior summer: the internship</h3>
<p>You work 10 weeks as a summer analyst. Strong interns usually get a return offer for a full-time analyst job after graduation.</p>
<h3>Missed the window?</h3>
<p>You still have options: smaller banks and boutiques that recruit later, off-cycle internships, a related role (Big 4 transaction services, valuation, corporate banking) and lateral moves, or a master's in finance.</p>""",
 "superday-readiness-test": """<h2>What a Superday is</h2>
<p>A <b>Superday</b> is the final round of investment banking interviews. You usually have several back-to-back interviews in one day with analysts, associates, VPs and sometimes managing directors. Offers often come within days.</p>
<h3>What they ask</h3>
<ul><li><b>Fit and behavioral:</b> walk me through your resume, why banking, why this bank, tell me about a time you worked on a team.</li>
<li><b>Accounting:</b> how the three statements link, and what happens when depreciation or working capital changes.</li>
<li><b>Valuation:</b> enterprise value vs. equity value, comparable companies, precedent transactions and the DCF.</li>
<li><b>LBOs and M&amp;A:</b> why private equity uses debt, what drives returns, and accretion/dilution basics.</li>
<li><b>Markets and deals:</b> a recent deal you followed and what you think of it.</li></ul>
<h3>How to use this test</h3>
<p>Take it once cold, read every explanation, then take it again a few days later. If you score under 9 of 12, spend your time on the topics you missed before you spend it on rare edge cases. Interviewers care much more about clean, confident answers to the core questions than about obscure ones.</p>""",
 "investment-banking-pay": """<h2>How investment banking pay works</h2>
<p>Banker pay has two parts: a <b>base salary</b> paid through the year and a <b>year-end bonus</b> based on your performance, your group and how the bank did. Bonuses make up a bigger share of pay as you get more senior.</p>
<h3>The levels</h3>
<ul><li><b>Analyst</b> (usually 2–3 years, straight out of college): builds models, decks and research.</li>
<li><b>Associate</b> (after analyst or an MBA): checks the analysts' work and manages the process.</li>
<li><b>Vice president</b>: runs deals day to day and talks with clients.</li>
<li><b>Director / managing director</b>: brings in clients and deals. Pay depends heavily on fees generated.</li></ul>
<h3>Why pay differs between banks</h3>
<p>Bulge-bracket banks (the largest global banks), elite boutiques (advisory-focused firms) and middle-market banks pay differently. Elite boutiques often pay at or above bulge brackets because their fees come from advisory work. Location matters too: New York pay is usually the highest in the U.S.</p>
<h3>Is the pay worth it?</h3>
<p>Hours are long, often 70+ a week as an analyst. Many people treat the first two years as training that leads to private equity, hedge funds, corporate development or startups.</p>""",
}

TOOLS = [
 ("recruiting-timeline-calculator", "Investment Banking Recruiting Timeline Calculator", "Recruiting timeline calculator",
  "Enter your graduation year and goal to see exactly when investment banking, PE, consulting and markets internship applications open for you, with a month-by-month plan.",
  ["Enter your graduation year and what you're aiming for. You'll get a month-by-month plan and a countdown to your main application window.",
   "Banking recruiting now runs about 1.5–2 years ahead of the internship, so most students are surprised how soon it starts."],
  T1_BODY, T1_FAQ, T1_JS),
 ("superday-readiness-test", "Superday Readiness Test: 12 Investment Banking Interview Questions", "Superday readiness test",
  "Are you ready for an investment banking Superday? Take a free 12-question test on accounting, valuation, LBOs, M&A and fit, with instant explanations and a score.",
  ["12 real-style questions from investment banking final rounds: accounting, enterprise value, valuation, LBOs, M&amp;A, quick math and a deal question.",
   "Answer them all, then see your score and why each answer is right."],
  T2_BODY, T2_FAQ, T2_JS),
 ("investment-banking-pay", "Investment Banking Pay by Level (2025 Survey Data)", "Investment banking pay by level",
  "What investment bankers earn at every level, from first-year analyst to managing director, by bank type, based on 2025 survey data. Interactive chart.",
  ["How much investment bankers make at each level, from first-year analyst to managing director, and how bulge brackets, elite boutiques and middle-market banks compare.",
   "Numbers are total pay (salary + bonus) from a 2025 survey of 866 bankers."],
  T3_BODY, T3_FAQ, T3_JS),
]


# ---------- 4. Embeddable question of the day (backlinks from club and blog sites) ----------
EMBED_JS = r"""/* M&A Prep: finance interview question of the day. Embed: <div id="mnaprep-qotd"></div><script src="https://mnaprep.com/embed/q.js" async></script> */
(function(){var Q=__QS__;var el=document.getElementById("mnaprep-qotd");if(!el){el=document.createElement("div");var s=document.currentScript;s&&s.parentNode.insertBefore(el,s)}
var day=Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5),q=Q[day%Q.length];var root=el.attachShadow?el.attachShadow({mode:"open"}):el;
var esc=function(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
root.innerHTML='<style>.c{font:15px/1.5 system-ui,-apple-system,sans-serif;max-width:520px;border:1px solid #D3D9E4;border-radius:14px;padding:16px 18px;background:#fff;color:#13203B}.k{font-size:11px;letter-spacing:.1em;font-weight:700;color:#2448D8;margin:0 0 6px}.q{font-weight:700;font-size:16px;margin:0 0 10px}.o{display:block;width:100%;text-align:left;font:inherit;border:1px solid #D3D9E4;border-radius:9px;background:#F4F6FB;color:#13203B;padding:8px 10px;margin:5px 0;cursor:pointer}.o.y{border-color:#1E7F4F;background:#E7F4EC}.o.n{border-color:#C33;background:#FBEAEA}.w{font-size:13.5px;color:#4A5672;margin:8px 0 0}.f{font-size:12px;margin:12px 0 0;color:#4A5672}.f a{color:#2448D8;font-weight:600;text-decoration:none}</style>'+
'<div class="c"><p class="k">FINANCE INTERVIEW QUESTION OF THE DAY</p><p class="q">'+esc(q[0])+'</p>'+q[1].map(function(o,i){return '<button class="o" data-i="'+i+'">'+esc(o)+'</button>'}).join("")+'<p class="w" hidden></p><p class="f">New question every day · <a href="https://mnaprep.com/?utm_source=embed&utm_medium=widget" target="_blank" rel="noopener">Practice 1,000+ more free on M&amp;A Prep →</a></p></div>';
var done=false;root.querySelectorAll(".o").forEach(function(b){b.onclick=function(){if(done)return;done=true;var i=+b.dataset.i;root.querySelectorAll(".o").forEach(function(x){if(+x.dataset.i===q[2])x.classList.add("y");else if(x===b)x.classList.add("n")});var w=root.querySelector(".w");w.hidden=false;w.textContent=(i===q[2]?"Correct! ":"Not quite. ")+q[3]}})})();
"""
EXTRA_QS = [
 ("What's the main reason a company's EV/EBITDA multiple might be higher than its peers'?", ["Faster expected growth or higher margins", "It has more cash", "It pays a bigger dividend", "Its stock trades on more exchanges"], 0, "Investors pay more for each dollar of EBITDA when they expect faster growth, higher margins or lower risk."),
 ("In an LBO, which of these usually boosts returns the most?", ["Paying a higher purchase price", "Using more debt (with the same exit)", "Holding cash on the balance sheet", "Lowering EBITDA"], 1, "More debt means less equity up front, so the same exit value produces a bigger return on that equity (with more risk)."),
 ("Revenue grows 10% and costs stay flat. What happens to profit margin?", ["It falls", "It stays the same", "It rises", "It depends on taxes only"], 2, "If costs don't change and revenue rises, more of each sales dollar is profit, so the margin goes up."),
 ("What does a 'pitch book' do?", ["Tracks a banker's hours", "Pitches the bank's ideas and valuation to a client", "Lists a company's employees", "Files taxes for the deal"], 1, "A pitch book is the presentation a bank uses to win business: market view, valuation and deal ideas."),
]
EMBED_BODY = """<div class="tool"><p class="label">Live preview</p><div id="mnaprep-qotd"></div><script src="/embed/q.js" async></script></div>
<h2>Add it to your site</h2><p>Copy this into any page (club website, Notion site, blog, newsletter page). It shows a new finance interview question every day.</p>
<div class="tool"><textarea id="code" readonly rows="4" style="width:100%;font:13px/1.5 'IBM Plex Mono',monospace;padding:10px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink)">&lt;div id="mnaprep-qotd"&gt;&lt;/div&gt;
&lt;script src="https://mnaprep.com/embed/q.js" async&gt;&lt;/script&gt;
&lt;p style="font-size:12px"&gt;Free investment banking interview practice from &lt;a href="https://mnaprep.com/"&gt;M&amp;amp;A Prep&lt;/a&gt;&lt;/p&gt;</textarea>
<button class="btn" id="cp">Copy code</button></div>
<p class="muted">Free to use. No sign-up, no tracking cookies. Works on any site that allows HTML or embeds.</p>"""
EMBED_JS_PAGE = r"""document.getElementById("cp").onclick=async function(){const t=document.getElementById("code");try{await navigator.clipboard.writeText(t.value);this.textContent="Copied!"}catch(e){t.select()}};"""
TOOLS.append(("embed", "Free Finance Interview Question of the Day Widget", "Question of the day widget",
  "Add a free finance interview question of the day to your club website or blog. One line of code, a new investment banking question every day.",
  ["A free widget that shows a new investment banking interview question every day, with the answer explained.",
   "Perfect for finance club websites, Notion pages and newsletters. Copy one snippet and you're done."],
  EMBED_BODY, [("Is the widget free?", "Yes. It's free to embed anywhere, with no sign-up."), ("Does it change every day?", "Yes, it rotates to a new question each day.")], EMBED_JS_PAGE))
os.makedirs(os.path.join(ROOT, "embed"), exist_ok=True)
open(os.path.join(ROOT, "embed", "q.js"), "w", encoding="utf-8").write(EMBED_JS.replace("__QS__", json.dumps(QS + EXTRA_QS)))

os.makedirs(os.path.join(ROOT, "tools"), exist_ok=True)
for slug, title, h1, desc, lede, body, faqs, js in TOOLS:
    body = body + EXTRA.get(slug, '')
    d = os.path.join(ROOT, "tools", slug); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(shell(slug, title, h1, desc, lede, body, faqs, js)); print("tool", slug)
CAL_CARD = ('<div class="card"><h3>Earnings + internship deadline calendar</h3><p style="margin:0 0 8px;color:var(--ink-2);font-size:15px">Add earnings dates, market events and finance internship deadlines to your own calendar. It updates automatically.</p>'
  '<a class="btn" style="margin-top:4px" href="https://calendar.google.com/calendar/render?cid=webcal://mnaprep.com/calendar.ics" target="_blank" rel="noopener">Add to Google Calendar</a> '
  '<a class="btn ghost" style="margin-top:4px" href="webcal://mnaprep.com/calendar.ics">Apple / Outlook</a></div>'
  '<div class="card"><h3><a href="/deals/">M&amp;A deal database</a></h3><p style="margin:0;color:var(--ink-2);font-size:15px">The biggest deals of the last 12 months, searchable, with why each happened.</p></div>')
cards = CAL_CARD + "".join(f'<div class="card"><h3><a href="/tools/{s}/">{e(h)}</a></h3><p style="margin:0;color:var(--ink-2);font-size:15px">{e(d)}</p></div>' for s, t, h, d, *_ in TOOLS)
open(os.path.join(ROOT, "tools", "index.html"), "w", encoding="utf-8").write(shell("", "Free Finance Recruiting Tools", "Free finance recruiting tools",
  "Free tools for students recruiting for investment banking, private equity and consulting: a recruiting timeline calculator, a Superday readiness test and IB pay by level.",
  ["Free tools to plan your recruiting, test yourself and know what the job pays."], cards, [], "", kind="CollectionPage")); print("tools index")
