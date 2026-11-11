#!/usr/bin/env python3
"""Builds the free lead magnet: "50 Investment Banking Interview Questions" (HTML -> PDF via cheatsheet.js)
and the /cheat-sheet/ landing page. Run from repo root: python3 guides/_src/cheatsheet.py && node guides/_src/cheatsheet.js"""
import os, html
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
e = html.escape

Q = [
("Accounting", [
 ("Walk me through the 3 financial statements.", "The income statement shows revenue down to net income over a period. The balance sheet is a snapshot of assets, liabilities and equity at one date (assets = liabilities + equity). The cash flow statement starts with net income, adjusts for non-cash items and working capital, then adds investing and financing cash flows to get the change in cash."),
 ("How do the 3 statements link?", "Net income flows to the top of the cash flow statement and into retained earnings. The ending cash on the cash flow statement becomes cash on the balance sheet. Changes in balance sheet items (working capital, PP&E, debt) show up on the cash flow statement."),
 ("Depreciation goes up by $10. Walk me through the 3 statements (25% tax rate).", "Income statement: pre-tax income falls $10, net income falls $7.50. Cash flow: net income -$7.50, add back $10 depreciation, so cash is up $2.50. Balance sheet: cash +$2.50, PP&E -$10, so assets -$7.50; retained earnings -$7.50, so it balances."),
 ("If you could use only one statement to judge a company, which would you pick?", "Usually the cash flow statement: it shows how much cash the business actually generates, which is harder to dress up than earnings."),
 ("What is working capital?", "Current operating assets minus current operating liabilities (like receivables and inventory minus payables). An increase uses cash; a decrease frees up cash."),
 ("Inventory goes up by $20, paid in cash. What happens?", "No change on the income statement. Cash flow: -$20 in working capital, so cash is down $20. Balance sheet: inventory +$20, cash -$20. Assets are unchanged."),
 ("A company buys $100 of equipment with debt. What happens on day one?", "No income statement change. Cash flow: -$100 capex (investing) and +$100 debt (financing), net zero. Balance sheet: PP&E +$100, debt +$100."),
 ("What is deferred revenue?", "Cash collected before the service is delivered. It's a liability until the company earns it, then it moves to revenue."),
 ("Why do we add back depreciation on the cash flow statement?", "It's a non-cash expense: it lowered net income but no cash left the business that year."),
 ("What is goodwill?", "The amount an acquirer pays above the fair value of the target's identifiable net assets. It sits on the balance sheet and is tested for impairment, not amortized (under US GAAP for public companies)."),
 ("What's the difference between capex and opex?", "Capex buys long-lived assets and is spread over time through depreciation. Opex is expensed right away on the income statement."),
 ("Where do you find retained earnings?", "In shareholders' equity on the balance sheet. It grows with net income and shrinks with dividends."),
]),
("Enterprise value & equity value", [
 ("What's the difference between enterprise value and equity value?", "Equity value is what the shareholders own (share price x diluted shares). Enterprise value is the value of the core business to all investors: equity value + debt + preferred + minority interest - cash."),
 ("Why do you subtract cash to get enterprise value?", "Cash isn't part of the core operating business, and a buyer could use it to pay down the price. EV measures the operating business alone."),
 ("A company raises $100 of debt and keeps it as cash. What happens to EV?", "Nothing. Debt +$100 and cash +$100 cancel out. Equity value is also unchanged."),
 ("Can equity value be negative? Can EV?", "Equity value can't go below zero for a public company (share price can't be negative). EV can be negative if a company holds more cash than its market cap plus debt."),
 ("Which multiples use EV, and which use equity value?", "Match the numerator and denominator: EV goes with metrics before interest (EV/Revenue, EV/EBITDA, EV/EBIT). Equity value goes with metrics after interest (P/E, price/book)."),
 ("What is the treasury stock method?", "A way to count diluted shares: assume in-the-money options are exercised, and the company uses the exercise cash to buy back shares at the current price. Only the net new shares are added."),
 ("Why is EV/EBITDA more common than P/E?", "It isn't affected by capital structure (debt vs. equity) or tax and depreciation differences, so it's better for comparing companies."),
 ("Two companies have the same EBITDA. Why could their EVs differ?", "Different growth, margins, risk, capital needs (capex), or industry. The market pays more for faster, steadier, less capital-hungry businesses."),
]),
("Valuation & DCF", [
 ("What are the main ways to value a company?", "Comparable companies (trading comps), precedent transactions, and a DCF. LBO analysis is often used too, to show what a financial buyer could pay."),
 ("Which valuation method usually gives the highest value?", "Precedent transactions, because buyers pay a control premium. A DCF can also come out high since it depends heavily on assumptions."),
 ("Walk me through a DCF.", "Project unlevered free cash flow for about 5-10 years. Calculate a terminal value (Gordon Growth or exit multiple). Discount the cash flows and terminal value back at WACC. That sum is enterprise value; subtract net debt to get equity value, then divide by diluted shares for a per-share value."),
 ("How do you calculate unlevered free cash flow?", "EBIT x (1 - tax rate) + depreciation & amortization - capex - increase in net working capital."),
 ("What is WACC?", "The weighted average cost of capital: the blended return required by debt and equity holders. WACC = cost of equity x % equity + after-tax cost of debt x % debt."),
 ("How do you calculate the cost of equity?", "Usually with CAPM: risk-free rate + beta x equity risk premium."),
 ("Why is debt usually cheaper than equity?", "Lenders get paid first (less risk) and interest is tax-deductible."),
 ("What are the two ways to get terminal value?", "Gordon Growth: final-year FCF x (1 + g) / (WACC - g). Exit multiple: final-year EBITDA x an EV/EBITDA multiple from comps."),
 ("What happens to a DCF value if WACC goes up?", "Value goes down: future cash flows are discounted more heavily."),
 ("Why can't the terminal growth rate be higher than long-term GDP growth?", "A company can't grow faster than the whole economy forever. Most models use about 2-3%."),
 ("What's the most important assumption in a DCF?", "Usually the terminal value assumptions (growth rate or exit multiple), since terminal value is often well over half of the total value."),
 ("A company is losing money. How would you value it?", "Use revenue-based multiples (EV/Revenue) or a DCF that projects when it becomes profitable. P/E and EV/EBITDA don't work with negative earnings."),
]),
("LBOs", [
 ("Walk me through a basic LBO.", "A PE firm buys a company using a lot of debt and some equity. The company's cash flow pays down debt over about 3-7 years. The firm sells (exits) at the end, and its return comes from EBITDA growth, debt paydown and any change in the multiple."),
 ("Why use debt in an LBO?", "Debt is cheaper than equity and reduces how much the PE firm has to put in, which boosts its returns (IRR)."),
 ("What makes a good LBO candidate?", "Stable, predictable cash flow, low capex needs, a strong market position, room to cut costs or grow, and a reasonable price."),
 ("Roughly what IRR is 2x your money in 5 years? In 3 years?", "About 15% for 2x in 5 years, and about 26% for 2x in 3 years."),
 ("What are the main drivers of LBO returns?", "Buying at a good price, growing EBITDA, paying down debt, and selling at a higher multiple."),
 ("Paper LBO: buy at $100M EBITDA x 10 = $1B, 60% debt. EBITDA grows to $150M in 5 years, exit at 10x, debt paid down to $400M. What's the MOIC?", "Equity in = $400M. Exit EV = $1.5B, minus $400M debt = $1.1B equity out. MOIC = 1.1 / 0.4 = 2.75x (roughly a 22-23% IRR)."),
 ("What's the difference between IRR and MOIC?", "MOIC is how many times you multiplied your money. IRR is the annual return, so it also accounts for how long it took."),
 ("Why might a PE firm pay a dividend recap?", "To return cash to investors early by adding debt, which raises IRR even before an exit."),
]),
("M&A", [
 ("Why would a company buy another company?", "To grow faster, enter new markets or products, gain technology or talent, cut costs through synergies, or remove a competitor."),
 ("What makes a deal accretive or dilutive?", "If the buyer's EPS goes up after the deal, it's accretive; if it goes down, it's dilutive. Quick check for all-stock deals: if the buyer's P/E is higher than the target's (at the price paid), it's accretive."),
 ("Buyer P/E 20x, target P/E 15x, all-stock deal, no synergies. Accretive or dilutive?", "Accretive. The buyer uses 'expensive' stock (5% earnings yield) to buy 'cheaper' earnings (6.7% yield)."),
 ("What are synergies?", "Extra value from combining two companies: cost synergies (cutting overlap) and revenue synergies (selling more together). Cost synergies are easier to count on."),
 ("Cash, stock or debt: what's the cheapest way to pay?", "Usually cash on hand (lowest after-tax cost), then new debt, then stock. Stock is usually the most expensive because of the buyer's cost of equity."),
]),
("Fit & behavioral", [
 ("Walk me through your resume.", "60-90 seconds: where you're from and study, the 2-3 experiences that led you to finance, what you learned, and why you're interviewing for this role now. End on why banking."),
 ("Why investment banking?", "Give 2-3 specific reasons tied to your own experience (the steep learning curve, working on live deals, the people you've met), plus how it fits your long-term goals."),
 ("Why our bank?", "Name a recent deal, a group you want, and a person you spoke with there. Be specific; generic praise doesn't count."),
 ("Tell me about a time you worked on a team under pressure.", "Use STAR: Situation, Task, Action, Result. Focus on what you did and end with a number or clear outcome."),
 ("Walk me through a recent deal.", "Who bought whom, the price or multiple, why it makes sense strategically, and one thing you'd watch (risk or what you think of it)."),
]),
]
assert sum(len(x[1]) for x in Q) == 50, sum(len(x[1]) for x in Q)

def pdf_html():
    sec, n = "", 0
    for cat, items in Q:
        rows = ""
        for q, a in items:
            n += 1; rows += f'<div class="q"><div class="qn">{n}</div><div><b>{e(q)}</b><p>{e(a)}</p></div></div>'
        sec += f'<section><h2>{e(cat)} <span>{len(items)}</span></h2>{rows}</section>'
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>50 Investment Banking Interview Questions | M&amp;A Prep</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>@page{{size:Letter;margin:0.55in 0.6in 0.65in}}@page:first{{margin:0}}body{{font:10.5pt/1.45 'IBM Plex Sans',sans-serif;color:#13203B;margin:0}}
.cover{{height:11in;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;break-after:page;background:linear-gradient(135deg,#0F172A,#1E2B5C);color:#fff;padding:0 0.9in;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.cover .k{{font:500 11pt 'IBM Plex Mono',monospace;color:#8EA8FF;letter-spacing:.12em}}.cover h1{{font:800 46pt/1.05 Archivo,sans-serif;margin:14px 0 18px}}
.cover p{{font-size:14pt;color:#CBD5E1;max-width:5.4in}}.cover .u{{margin-top:40px;align-self:flex-start;display:inline-block;background:#2448D8;border-radius:30px;padding:10px 26px;font-weight:600;font-size:14pt}}
h2{{font:800 17pt Archivo,sans-serif;border-bottom:2px solid #2448D8;padding-bottom:4px;margin:18px 0 8px;break-after:avoid}}h2 span{{font:500 10pt 'IBM Plex Mono';color:#4A5672}}
.q{{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #E3E8F0;break-inside:avoid}}.qn{{font:500 10pt 'IBM Plex Mono';color:#2448D8;min-width:22px}}.q p{{margin:2px 0 0;color:#36425E}}
.end{{margin-top:22px;padding:16px 18px;border-radius:12px;background:#EEF1FD;break-inside:avoid}}.end b{{font-size:13pt}}
</style></head><body>
<div class="cover"><div class="k">FREE CHEAT SHEET · M&amp;A PREP</div><h1>50 Investment Banking Interview Questions</h1>
<p>The accounting, valuation, LBO, M&amp;A and fit questions that come up again and again, each with a short, clear answer you can say out loud.</p><div class="u">mnaprep.com</div></div>
{sec}<div class="end"><b>Reading isn't enough. Say them out loud.</b><br>Practice these as timed, game-style levels with 1,000+ more questions, free at <b>mnaprep.com</b>. Test yourself with the 12-question Superday readiness test: <b>mnaprep.com/superday</b>.</div>
</body></html>"""

os.makedirs(os.path.join(ROOT, "cheat-sheet"), exist_ok=True)
open(os.path.join(ROOT, "guides", "_src", "cheatsheet.print.html"), "w", encoding="utf-8").write(pdf_html())

preview = "".join(f"<li>{e(q)}</li>" for q, _ in Q[2][1][:3] + Q[0][1][2:3] + Q[3][1][5:6])
PAGE = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>50 Investment Banking Interview Questions (Free PDF Cheat Sheet) | M&amp;A Prep</title>
<meta name="description" content="Free PDF: the 50 investment banking interview questions that come up most, with short answers. Accounting, EV, DCF, LBO, M&amp;A and fit questions.">
<link rel="canonical" href="https://mnaprep.com/cheat-sheet/"><meta property="og:title" content="50 Investment Banking Interview Questions (Free PDF)">
<meta property="og:description" content="The accounting, valuation, LBO, M&amp;A and fit questions that come up again and again, with short answers."><meta property="og:url" content="https://mnaprep.com/cheat-sheet/"><meta property="og:type" content="website">
<meta name="theme-color" content="#13203B">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap">
<style>:root{{--paper:#EEF1F5;--sheet:#fff;--ink:#13203B;--ink-2:#4A5672;--rule:#D3D9E4;--cobalt:#2448D8}}*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 'IBM Plex Sans',system-ui,sans-serif}}a{{color:var(--cobalt)}}
.top{{background:var(--sheet);border-bottom:1px solid var(--rule)}}.wrap{{max-width:760px;margin:0 auto;padding:0 18px}}.top .wrap{{display:flex;justify-content:space-between;align-items:center;height:60px}}
.brand{{font:900 24px Nunito,Archivo,sans-serif;color:var(--ink);text-decoration:none}}.brand span{{color:var(--cobalt)}}.topcta{{background:var(--cobalt);color:#fff;text-decoration:none;font-weight:600;border-radius:22px;padding:8px 16px;font-size:14px}}
.hero{{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:center;padding:38px 0 10px}}@media(max-width:700px){{.hero{{grid-template-columns:1fr}}.cov{{max-width:260px;margin:0 auto}}}}
.k{{font:500 12px 'IBM Plex Mono',monospace;letter-spacing:.12em;color:var(--cobalt)}}h1{{font:800 clamp(30px,6vw,42px)/1.08 Archivo,sans-serif;margin:8px 0 12px}}
.cov{{aspect-ratio:8.5/11;border-radius:10px;background:linear-gradient(135deg,#0F172A,#1E2B5C);color:#fff;padding:26px 22px;box-shadow:0 18px 40px rgba(19,32,59,.25);transform:rotate(2deg)}}
.cov small{{font:500 10px 'IBM Plex Mono';color:#8EA8FF;letter-spacing:.1em}}.cov b{{display:block;font:800 26px/1.08 Archivo;margin:10px 0}}.cov i{{font-style:normal;font-size:12px;color:#CBD5E1}}
.box{{background:var(--sheet);border:1px solid var(--rule);border-radius:14px;padding:18px 20px;margin:18px 0}}form{{display:flex;gap:8px;flex-wrap:wrap}}
input[type=email]{{flex:1;min-width:210px;font:inherit;padding:12px;border:1px solid var(--rule);border-radius:10px;background:var(--paper)}}button,.dl{{font:inherit;font-weight:600;padding:12px 20px;border:0;border-radius:10px;background:var(--cobalt);color:#fff;cursor:pointer;text-decoration:none;display:inline-block}}
.hp{{position:absolute;left:-9999px}}.msg{{font-size:14px;color:var(--ink-2);margin-top:8px}}ul.in{{columns:2;gap:24px;padding-left:18px}}@media(max-width:600px){{ul.in{{columns:1}}}}
.cats{{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}}@media(max-width:600px){{.cats{{grid-template-columns:repeat(2,1fr)}}}}.cats div{{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:12px;text-align:center}}.cats b{{display:block;font:800 26px Archivo;color:var(--cobalt)}}
footer{{border-top:1px solid var(--rule);margin-top:40px;padding:22px 0 40px;font-size:14px;color:var(--ink-2)}}</style></head><body>
<header class="top"><div class="wrap"><a class="brand" href="/">M<span>&amp;</span>A</a><a class="topcta" href="/">Train free</a></div></header>
<main class="wrap"><div class="hero"><div><div class="k">FREE PDF CHEAT SHEET</div><h1>50 investment banking interview questions, answered</h1>
<p>The questions that come up again and again in IB interviews, each with a short answer you can say out loud. 8 pages. Free.</p>
<div class="box" id="get"><form id="f" novalidate><input type="email" name="email" placeholder="you@school.edu" autocomplete="email" aria-label="Email address" required><input class="hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><button>Send me the PDF</button></form>
<div class="msg" role="status">We'll also send one free interview question every Sunday. Unsubscribe anytime.</div></div></div>
<div class="cov"><small>FREE CHEAT SHEET · M&amp;A PREP</small><b>50 Investment Banking Interview Questions</b><i>Accounting · EV · DCF · LBO · M&amp;A · Fit</i></div></div>
<h2>What's inside</h2><div class="cats">{''.join(f'<div><b>{len(i)}</b>{e(c)}</div>' for c, i in Q)}</div>
<h2>A few of the questions</h2><ul class="in">{preview}</ul>
<p>Want to practice instead of just read? <a href="/">Train with 1,000+ questions as 5-minute levels</a> or take the <a href="/tools/superday-readiness-test/">Superday readiness test</a>.</p></main>
<footer><div class="wrap">M&amp;A Prep is a free, game-style way to train for investment banking, private equity, hedge fund, restructuring and consulting interviews. <a href="/">Start training</a>.</div></footer>
<script>
const f=document.getElementById("f"),m=document.querySelector("#get .msg"),PDF="/cheat-sheet/50-investment-banking-interview-questions.pdf";
const ok=()=>{{document.getElementById("get").innerHTML='<div class="k">IT\\'S YOURS ✓</div><p style="margin:6px 0 12px">We also emailed you the link so you have it later.</p><a class="dl" href="'+PDF+'" download>Download the PDF</a>'}};
try{{if(localStorage.getItem("ma-cs")==="1")ok()}}catch(e){{}}
f.onsubmit=async ev=>{{ev.preventDefault();const email=f.email.value.trim();if(!/^[^\\s@]+@[^\\s@]+\\.[a-z]{{2,}}$/i.test(email)){{m.textContent="Please enter a valid email.";return}}
 const b=f.querySelector("button");b.disabled=true;b.textContent="Sending…";
 try{{const r=await fetch("/.netlify/functions/subscribe",{{method:"POST",headers:{{"Content-Type":"application/json"}},body:JSON.stringify({{email,hp:f.hp.value,src:"cheatsheet"}})}});const j=await r.json().catch(()=>({{}}));
  if(r.ok){{try{{localStorage.setItem("ma-cs","1");localStorage.setItem("ma-sub","1")}}catch(x){{}}ok()}}else{{m.textContent=j.error||"Something went wrong. Try again.";b.disabled=false;b.textContent="Send me the PDF"}}}}
 catch(x){{m.textContent="Network error. Try again.";b.disabled=false;b.textContent="Send me the PDF"}}}};
</script>
<script src="/js/hit.js" defer></script></body></html>"""
open(os.path.join(ROOT, "cheat-sheet", "index.html"), "w", encoding="utf-8").write(PAGE)
print("cheat sheet page + print html written")
