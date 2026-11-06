/* Deal database: the most relevant deals announced in the last 12 months (Nov 2025 – Nov 2026), searchable.
   Values are as reported at announcement (equity value unless marked EV or "combined"). Each row lists its source.
   Fields: b buyer, t target, v USD billions (for sorting), d display value, m month (YYYY-MM), i industry, k kind, w why. */
(function(){
const S1="Intellizence, Nov 2025",S2="FactSet, Dec 2025",S3="Intellizence, Jan 2026",S4="Intellizence, Q1 2026",S5="Wall Street Horizon, 2026",S6="Healthcare Brew, 2026",S7="Intellizence, May 2026",S8="BSIC Summer Deal Recap 2026",S9="Intellizence, Jul 2026",S10="FactSet, Sep 2026",S11="M&A Prep The Wire, Oct–Nov 2026",S12="Dealroom, Oct 2026",S13="Yahoo Finance, Nov 2026";
const D=[
["SpaceX","xAI",250,"~$250B","2026-Q1","Tech","Strategic","Combines Starlink's satellite network with xAI's AI models, both controlled by Elon Musk. Value is press-reported.",S12],
["Marvell Technology","Lumentum",115,"~$115B","2026-11","Tech","Strategic","Adds optical networking parts used in AI data centers.",S13],
["Paramount","Warner Bros. Discovery",110,"$110B","2026","Media & Telecom","Strategic","Won a bidding war with Netflix for the owner of HBO, CNN and Warner Bros. studios.",S12],
["Equity Residential","AvalonBay",70,"~$70B combined","2026","Real Estate","Merger of equals","Combines two of the largest U.S. apartment landlords.",S12],
["NextEra Energy","Dominion Energy",67,"~$67B","2026-05","Energy & Power","Strategic","Creates one of the biggest regulated utilities as AI data centers drive power demand.",S7],
["SpaceX","Anysphere (Cursor)",60,"$60B","2026-06","Tech","Strategic","Gets the popular AI coding tool inside developers' daily workflow.",S8],
["Devon Energy","Coterra Energy",58,"~$58B combined","2026-02","Energy & Power","Merger of equals","All-stock shale merger across several U.S. basins for scale.",S4],
["Kimberly-Clark","Kenvue",48.7,"$48.7B","2025-11","Consumer","Strategic","Adds Tylenol, Listerine and Band-Aid to Huggies and Kleenex.",S1],
["McCormick","Unilever's food business",45,"$45B","2026-Q1","Consumer","Strategic","McCormick's biggest deal ever, adding brands like Hellmann's and Knorr.",S4],
["Intesa Sanpaolo","Monte dei Paschi di Siena",35.5,"€30.6B","2026-06","Financials","Strategic","A selective takeover in Italian banking consolidation.",S8],
["GIP (BlackRock) and EQT","AES Corporation",33.4,"$33.4B EV","2026-03","Energy & Power","Private equity","Infrastructure investors buy a big power producer as capital moves to energy-transition assets.",S4],
["Schneider Electric","PTC",22.6,"$22.6B","2026-10","Tech","Strategic","Adds industrial design and product software to Schneider's automation business.",S11],
["Corebridge Financial","Equitable Holdings",22,"~$22B","2026-Q1","Financials","Merger of equals","All-stock combination of two retirement and insurance companies.",S4],
["Fox Corporation","Roku",22,"~$22B EV","2026-06","Media & Telecom","Strategic","Pairs Fox's sports and news with Roku's streaming households.",S8],
["Abbott","Exact Sciences",21,"$21B","2025-11","Healthcare","Strategic","Adds Cologuard and cancer screening tests to Abbott's diagnostics.",S1],
["Fertitta Entertainment","Caesars Entertainment",17.6,"~$17.6B","2026-05","Consumer","Strategic","Combines casinos, hotels and restaurants under one loyalty program.",S7],
["Aon","USI Insurance Services",17,"$17B","2026-08","Financials","Strategic","Adds scale in U.S. middle-market insurance brokerage.",S8],
["DoorDash","Instacart (Maplebear)",17,"~$17B","2026-10","Tech","Strategic","Combines the biggest restaurant and grocery delivery apps in the U.S.",S11],
["Uber","Delivery Hero",14.8,"$14.8B","2026-07","Tech","Strategic","Expands Uber's food delivery into Delivery Hero's international markets.",S9],
["WDP","Argan",14.8,"$14.8B","2026-07","Real Estate","Strategic","Creates a larger European warehouse and logistics property platform.",S9],
["Boston Scientific","Penumbra",14.5,"$14.5B","2026-01","Healthcare","Strategic","Adds clot-removal devices for strokes and blood vessels.",S6],
["EQT","Intertek",14.4,"£10.7B EV","2026-06","Industrials","Private equity","Take-private of a testing and certification company at a 40% premium.",S8],
["Engie","UK Power Networks",14.2,"$14.2B","2026-Q1","Energy & Power","Strategic","Buys a major UK electricity distribution network from CK Infrastructure.",S4],
["Nuveen (TIAA)","Schroders",13.5,"$13.5B","2026-02","Financials","Strategic","Creates a larger global asset manager.",S4],
["SM Energy","Civitas Resources",12.8,"$12.8B","2025-11","Energy & Power","Strategic","Combines two shale producers in the Permian and DJ Basins.",S1],
["EQT Corp.","Range Resources",12.8,"~$12.8B","2026-10","Energy & Power","Strategic","Merges two big Appalachian natural gas producers.",S11],
["Santander","Webster Financial",12.2,"$12.2B","2026-02","Financials","Strategic","Grows Santander's U.S. banking footprint.",S4],
["EQT","Qiagen",12.1,"~$12.1B","2026-10","Healthcare","Private equity","Take-private of a lab testing and diagnostics company.",S11],
["NVIDIA","Hugging Face",11.9,"$11.9B","2026-09","Tech","Strategic","Secures the main hub where developers share open AI models.",S10],
["GE Aerospace","Consolidated Precision Products",11.8,"$11.8B","2026-09","Industrials","Strategic","Adds precision engine parts to secure GE's supply chain.",S10],
["Sun Pharmaceutical","Organon",11.75,"$11.75B","2026-04","Healthcare","Strategic","India's largest drugmaker buys a U.S. women's health and biosimilars company.",S6],
["Merck KGaA","Bio-Techne",11.3,"$11.3B EV","2026-06","Healthcare","Strategic","Adds life-science research and lab tools.",S8],
["IBM","Confluent",11,"$11B","2025-12","Tech","Strategic","Adds real-time data streaming software for AI.",S2],
["AbbVie","Apogee Therapeutics",10.9,"$10.9B","2026-06","Healthcare","Strategic","Adds long-acting antibody drugs for asthma and eczema.",S6],
["Zurich Insurance","Beazley",10.8,"£8.1B","2026-02","Financials","Strategic","Enters London specialty insurance, including cyber coverage.",S4],
["SGH and Steel Dynamics","BlueScope Steel",10.7,"$10.7B","2026-02","Materials","Strategic","Joint takeover of Australia's biggest steelmaker.",S5],
["GSK","Nuvalent",10.6,"$10.6B","2026-06","Healthcare","Strategic","Adds targeted lung-cancer drugs.",S6],
["Public Storage","National Storage Affiliates",10.5,"$10.5B","2026-Q1","Real Estate","Strategic","Adds about 1,100 self-storage properties.",S4],
["Clayton Dubilier & Rice","Sealed Air",10.3,"$10.3B","2025-11","Materials","Private equity","Take-private of the maker of Bubble Wrap and Cryovac packaging.",S1],
["Naver","Dunamu",10,"$10B","2025-11","Financials","Strategic","Brings Korea's Upbit crypto exchange into Naver's tech group.",S1],
["Danaher","Masimo",9.9,"$9.9B","2026-02","Healthcare","Strategic","Adds patient-monitoring devices like pulse oximeters.",S6],
["Eaton","Boyd Corporation",9.5,"$9.5B","2025-11","Industrials","Strategic","Adds cooling technology for AI data centers.",S1],
["AkzoNobel","Axalta Coating Systems",9.2,"$9.2B","2025-11","Materials","Merger of equals","Combines two big paint and coatings makers.",S1],
["Advent International and FedEx","InPost",9.2,"$9.2B","2026-02","Industrials","Private equity","Buys Europe's parcel-locker delivery network.",S5],
["GE Vernova","Trench Group",9,"~$9.0B","2026-10","Energy & Power","Strategic","Adds power-grid equipment from Triton Partners.",S11],
["Alimentation Couche-Tard","Żabka",8.7,"$8.7B","2026-07","Consumer","Strategic","Buys Poland's biggest convenience-store chain.",S9],
["Victory Capital","Janus Henderson",8.6,"$8.6B","2026-02","Financials","Strategic","Combines two asset managers.",S5],
["AMD","World Labs",8.2,"$8.2B","2026-09","Tech","Strategic","Adds an AI startup building 3D world models.",S10],
["ServiceNow","Armis",7.8,"$7.8B","2025-12","Tech","Strategic","Adds cybersecurity for connected devices.",S2],
["Gilead Sciences","Arcellx",7.8,"$7.8B","2026-04","Healthcare","Strategic","Adds a cell therapy for blood cancer.",S6],
["Apollo","easyJet",7.7,"£5.7B","2026-08","Consumer","Private equity","Take-private of the European budget airline.",S8],
["Thrive Holdings","ADT",7.6,"~$7.6B","2026-10","Consumer","Private equity","Takes the home security company private.",S11],
["Mitsubishi Corporation","Aethon Energy",7.5,"$7.5B","2026-01","Energy & Power","Strategic","Buys U.S. natural gas assets as power demand rises.",S3],
["Texas Instruments","Silicon Labs",7.5,"$7.5B","2026-02","Tech","Strategic","Adds wireless chips for connected devices.",S5],
["Permira and Warburg Pincus","Clearwater Analytics",7.1,"$7.1B","2025-12","Tech","Private equity","Take-private of investment accounting software.",S2],
["Eli Lilly","Kelonia Therapeutics",7,"$7B","2026-04","Healthcare","Strategic","Adds in-body gene therapy technology.",S6],
["Coeur Mining","New Gold",7,"$7B","2025-11","Materials","Strategic","Adds gold and silver mines.",S1],
["Merck","Terns Pharmaceuticals",6.7,"$6.7B","2026-03","Healthcare","Strategic","Adds drugs for obesity and leukemia.",S6],
["The Brink's Company","NCR Atleos",6.6,"$6.6B","2026-02","Industrials","Strategic","Combines cash logistics with ATM networks.",S5],
["Hg","OneStream",6.4,"$6.4B","2026-01","Tech","Private equity","Take-private of finance-planning software.",S3],
["Deutsche Börse","Allfunds",6.3,"$6.3B","2026-01","Financials","Strategic","Adds a European fund distribution platform.",S3],
["Long Lake Management","Amex Global Business Travel",6.3,"~$6.3B","2026-05","Consumer","Private equity","Buys a corporate travel platform to apply AI.",S7],
["Mubadala Capital","Clear Channel Outdoor",6.2,"$6.2B","2026-02","Media & Telecom","Private equity","Take-private of the billboard company.",S5],
["Kimmeridge","Ascent Resources (Utica)",6,"$6B","2025-12","Energy & Power","Private equity","Buys a big Ohio natural gas producer.",S2],
["Transocean","Valaris",5.8,"$5.8B","2026-02","Energy & Power","Strategic","Combines two offshore drilling companies.",S5],
["Intercontinental Exchange","MarketAxess",5.7,"$5.7B","2026-07","Financials","Strategic","Strengthens electronic bond trading.",S9],
["Biogen","Apellis Pharmaceuticals",5.6,"$5.6B","2026-05","Healthcare","Strategic","Adds treatments for eye and kidney diseases.",S6],
["ABB","Rotork",5.5,"$5.5B","2026-07","Industrials","Strategic","Adds valve automation to ABB's industrial business.",S9],
["Brookfield and CPPIB","LXP Industrial Trust",5.2,"$5.2B","2026-07","Real Estate","Private equity","Take-private of a U.S. warehouse landlord.",S9],
["Capital One","Brex",5.15,"$5.15B","2026-01","Financials","Strategic","Adds AI-driven corporate cards and expense software.",S3],
["Grant Thornton Advisors","CBIZ",5,"$5B","2026-07","Financials","Strategic","Grows Grant Thornton's U.S. accounting business.",S9],
["AMETEK","Indicor Instrumentation",5,"$5B","2026-05","Industrials","Strategic","Adds industrial instruments with recurring revenue.",S7],
["Lone Star Funds","ContiTech (from Continental)",4.6,"$4.6B","2026-07","Industrials","Private equity","Carve-out of Continental's industrial products unit.",S9],
["Sequence AI and DFO Management","The Baldwin Insurance Group",4.6,"$4.6B","2026-09","Financials","Private equity","Take-private of an insurance brokerage.",S10],
["Flex","EPC Power",4.4,"$4.4B","2026-09","Industrials","Strategic","Adds power conversion for energy storage and data centers.",S10],
["Bullish","Equiniti",4.2,"$4.2B","2026-05","Financials","Strategic","Adds shareholder services for tokenized securities.",S7],
["OCS Group","Mitie",4.17,"£3.1B","2026-07","Industrials","Strategic","Combines two UK facilities-management companies.",S9],
["Aquarian Holdings","Brighthouse Financial",4.1,"$4.1B","2025-11","Financials","Private equity","Buys a life insurance and annuities company.",S1],
["Vistra","Cogentrix Energy",4,"$4B","2026-01","Energy & Power","Strategic","Adds 10 gas power plants.",S3],
["Autodesk","MaintainX",3.6,"~$3.6B","2026-05","Tech","Strategic","Extends Autodesk into maintenance software.",S7],
["Doosan","SK Siltron",3.6,"~$3.6B","2026-05","Tech","Strategic","Adds semiconductor wafer production.",S7],
["Talen Energy","ECP gas plants",3.45,"$3.45B","2026-01","Energy & Power","Strategic","Adds 2.6 GW of gas power plants.",S3],
["Palo Alto Networks","Chronosphere",3.35,"$3.35B","2025-11","Tech","Strategic","Adds data monitoring for AI workloads.",S1],
["Blackstone and Canadian pensions","49.9% of Mitsubishi's LNG Canada unit",3.1,"$3.1B","2026-11","Energy & Power","Private equity","Buys a stake in a Canadian LNG export project.",S11],
["Hubbell","NSI Industries",3,"$3B","2026-05","Industrials","Strategic","Grows in electrical products for data centers.",S7],
["Parker Hannifin","CIRCOR Aerospace",2.6,"~$2.6B","2026-05","Industrials","Strategic","Adds flight-control and flow parts.",S7],
["Ares Capital","MidCap Financial Investment",2.6,"~$2.6B","2026-10","Financials","Strategic","Combines two private-credit lenders.",S11],
["Leidos","ENTRUST Solutions",2.4,"$2.4B","2026-01","Industrials","Strategic","Adds utility engineering services.",S3],
["Worthington Steel","Klöckner & Co",2.4,"$2.4B","2026-01","Materials","Strategic","Creates a bigger steel processing and distribution company.",S3],
["argenx","Forte Biosciences",2.2,"$2.2B","2026-07","Healthcare","Strategic","Adds immunology drug candidates.",S9],
["Guidewire","hyperexponential",2.1,"Up to $2.1B","2026-10","Tech","Strategic","Adds AI pricing software for insurers.",S11],
["Clorox","GOJO Industries (Purell)",2,"$2B+","2026-01","Consumer","Strategic","Adds Purell hand sanitizer.",S3],
["Ferring Pharmaceuticals","Gameto",1.38,"Up to ~$1.38B","2026-10","Healthcare","Strategic","Adds fertility technology.",S11],
["Ahold Delhaize","Tesco Czechia and Slovakia",1.34,"~€1.2B","2026-10","Consumer","Strategic","Buys Tesco's grocery stores in two countries.",S11]
];
const IND=["All",...[...new Set(D.map(x=>x[5]))].sort()],KIND=["All","Strategic","Private equity","Merger of equals"];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mon=m=>/^\d{4}-\d{2}$/.test(m)?new Date(m+"-15T12:00:00").toLocaleDateString("en-US",{month:"short",year:"numeric"}):/Q\d/.test(m)?m.slice(5)+" "+m.slice(0,4):m;
const css=`.ddb{margin:0 0 28px}.ddb-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0 12px}
.ddb-bar input{flex:1;min-width:200px;font:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink)}
.ddb-bar select{font:inherit;font-size:14px;padding:9px 10px;border:1px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink)}
.ddb-n{font-size:13px;color:var(--ink-2);margin-bottom:6px}
.ddb-t{width:100%;border-collapse:collapse;font-size:14px}.ddb-t th{text-align:left;font-size:12px;color:var(--ink-2);font-weight:600;padding:8px 6px;border-bottom:1px solid var(--rule);cursor:pointer;white-space:nowrap}
.ddb-t td{padding:9px 6px;border-bottom:1px solid var(--rule);vertical-align:top}.ddb-t tr.r{cursor:pointer}.ddb-t tr.r:hover td{background:color-mix(in srgb,var(--cobalt) 5%,transparent)}
.ddb-t .v{font-family:var(--mono);white-space:nowrap;text-align:right}.ddb-t .sm{color:var(--ink-2);font-size:12.5px}
.ddb-tag{display:inline-block;font-size:11px;padding:2px 7px;border-radius:99px;border:1px solid var(--rule);color:var(--ink-2);white-space:nowrap}
.ddb-more{margin-top:10px}.ddb .ddb-bar input{width:auto!important;flex:1 1 260px!important;margin:0!important}.ddb .ddb-bar select{width:auto!important;flex:0 0 auto!important;margin:0!important}.ddb .ddb-t th,.ddb .ddb-t td{text-align:left!important;text-transform:none!important;letter-spacing:0!important}.ddb .ddb-t th.vr,.ddb .ddb-t td.v{text-align:right!important}@media(max-width:620px){.ddb-t .hm{display:none}}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
let q="",ind="All",kind="All",sort="v",dir=-1,limit=25;
function rows(){const s=q.toLowerCase().trim();return D.filter(x=>(ind==="All"||x[5]===ind)&&(kind==="All"||x[6]===kind)&&(!s||(x[0]+" "+x[1]+" "+x[5]+" "+x[7]).toLowerCase().includes(s)))
  .sort((a,b)=>{const A=sort==="v"?a[2]:sort==="m"?a[4]:sort==="b"?a[0]:a[1],B=sort==="v"?b[2]:sort==="m"?b[4]:sort==="b"?b[0]:b[1];return (A>B?1:A<B?-1:0)*dir})}
function table(){const el=document.getElementById("ddbList");if(!el)return;const R=rows(),shown=R.slice(0,limit);
  el.innerHTML=`<div class="ddb-n">${R.length} deal${R.length===1?"":"s"}${q||ind!=="All"||kind!=="All"?" match":""} · tap a deal for details</div>
  ${R.length?`<table class="ddb-t"><thead><tr><th data-s="b">Buyer</th><th data-s="t">Target</th><th data-s="v" class="vr">Value ${sort==="v"?(dir<0?"↓":"↑"):""}</th><th data-s="m" class="hm">Announced ${sort==="m"?(dir<0?"↓":"↑"):""}</th><th class="hm">Industry</th></tr></thead><tbody>
  ${shown.map(x=>`<tr class="r" data-i="${D.indexOf(x)}" tabindex="0"><td><b>${esc(x[0])}</b></td><td>${esc(x[1])}</td><td class="v">${esc(x[3])}</td><td class="hm sm">${mon(x[4])}</td><td class="hm"><span class="ddb-tag">${esc(x[5])}</span></td></tr>`).join("")}</tbody></table>
  ${R.length>limit?`<div class="ddb-more"><button class="ghost" id="ddbMore">Show ${Math.min(25,R.length-limit)} more</button></div>`:""}`:`<p class="note">No deals match. Try a company name like "Netflix" or clear the filters.</p>`}`;
  el.querySelectorAll("th[data-s]").forEach(th=>th.onclick=()=>{const s=th.dataset.s;dir=sort===s?-dir:(s==="v"||s==="m"?-1:1);sort=s;table()});
  el.querySelectorAll("tr.r").forEach(tr=>{tr.onclick=()=>pop(D[+tr.dataset.i]);tr.onkeydown=e=>{if(e.key==="Enter")pop(D[+tr.dataset.i])}});
  const m=document.getElementById("ddbMore");if(m)m.onclick=()=>{limit+=25;table()}}
function pop(x){const html=`<div class="label">Deal database · ${mon(x[4])}</div><h2>${esc(x[0])} → ${esc(x[1])}</h2>
  <table class="ddb-t" style="margin:8px 0 14px"><tr><td class="sm">Value</td><td><b>${esc(x[3])}</b></td></tr><tr><td class="sm">Announced</td><td>${mon(x[4])}</td></tr><tr><td class="sm">Industry</td><td>${esc(x[5])}</td></tr><tr><td class="sm">Type</td><td>${esc(x[6])}</td></tr></table>
  <p style="font-size:15px;line-height:1.5"><b>Why it happened:</b> ${esc(x[7])}</p>
  <p class="note">Interview tip: be ready to say who bought whom, the price, and one reason why. Source: ${esc(x[8])}. Values as reported at announcement; deals can change or fall through.</p>`;
  try{openPanel(html)}catch(e){}}
function build(){const pane=document.querySelector('[data-pane="deals"]');if(!pane||document.getElementById("ddb"))return;
  const box=document.createElement("div");box.className="ddb deals-sec";box.id="ddb";
  box.innerHTML=`<div class="sec-head"><h2>Deal database</h2><span class="pill">${D.length} biggest deals · last 12 months</span></div>
   <div class="ddb-bar"><input id="ddbQ" type="search" placeholder="Search a company, industry or keyword" aria-label="Search deals">
   <select id="ddbI" aria-label="Industry">${IND.map(v=>`<option>${v}</option>`).join("")}</select><select id="ddbK" aria-label="Deal type">${KIND.map(v=>`<option>${v}</option>`).join("")}</select></div><div id="ddbList"></div>`;
  pane.insertBefore(box,pane.firstChild);
  document.getElementById("ddbQ").oninput=e=>{q=e.target.value;limit=25;table()};document.getElementById("ddbI").onchange=e=>{ind=e.target.value;limit=25;table()};document.getElementById("ddbK").onchange=e=>{kind=e.target.value;limit=25;table()};table()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();
