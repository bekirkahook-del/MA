#!/usr/bin/env python3
"""Adds deeper sections to short guides (Nov 19, 2026 crawl: these pages had under 300 words).
Inserts the blocks before "Common questions" on each built page. Safe to run again: each page is
marked with <!--expand--> and skipped once done. Run from the repo root: python3 guides/_src/expand.py
Content is general, textbook finance: no made-up statistics, firms' internal numbers or quotes."""
import os, re, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
e = lambda s: html.escape(html.unescape(s), quote=True)

def block(b):
    k = b[0]
    if k == "p": return f"<p>{b[1]}</p>"
    if k == "h2": return f"<h2>{e(b[1])}</h2>"
    if k == "card":
        body = "<ul>" + "".join(f"<li>{x}</li>" for x in b[2]) + "</ul>" if isinstance(b[2], list) else f'<p style="margin:0">{b[2]}</p>'
        return f'<div class="card"><h3>{b[1]}</h3>{body}</div>'
    if k == "table":
        head = "".join(f"<th>{e(x)}</th>" for x in b[1])
        rows = "".join("<tr>" + "".join(f"<td>{x}</td>" for x in r) + "</tr>" for r in b[2])
        return f'<div class="tbl"><table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table></div>'
    raise ValueError(k)

X = {
"what-is-ebitda": [
 ("h2", "EBITDA vs. EBIT vs. net income"),
 ("table", ["Measure", "What it leaves out", "Best for"], [
   ["Net income", "Nothing: it's the bottom line", "Earnings per share and P/E ratios"],
   ["EBIT (operating income)", "Interest and taxes", "Comparing operating profit when asset needs are similar"],
   ["EBITDA", "Interest, taxes, depreciation and amortization", "Comparing core profits across companies with different debt and asset bases"]]),
 ("h2", "Where EBITDA shows up in banking"),
 ("card", "Three places you'll use it", [
   "<b>EV/EBITDA multiples</b> in comparable companies and precedent transactions.",
   "<b>Leverage</b>: lenders size debt as a multiple of EBITDA, so it drives how much an LBO can borrow.",
   "<b>Adjusted EBITDA</b>: companies add back one-time costs. Always ask what was added back and whether it will really go away."]),
 ("p", "Interview tip: when you say EBITDA is a proxy for cash flow, add that it ignores capital expenditures and working capital. That one sentence shows you understand its limits."),
],
"free-cash-flow-explained": [
 ("h2", "Unlevered vs. levered free cash flow"),
 ("table", ["Type", "Formula (simplified)", "Who it belongs to", "Used in"], [
   ["Unlevered FCF", "EBIT × (1 − tax rate) + D&A − capex − increase in working capital", "All investors (debt and equity)", "DCF valued with WACC → enterprise value"],
   ["Levered FCF", "Unlevered FCF − after-tax interest − debt repayments", "Equity holders only", "Equity value directly; LBO cash available to pay down debt"]]),
 ("h2", "How each line moves free cash flow"),
 ("card", "Quick logic", [
   "Higher capex lowers FCF today but should support growth later.",
   "Growing working capital (more inventory, more receivables) uses cash, so FCF falls.",
   "Depreciation is added back because it's a non-cash expense, but it still lowers taxes."]),
 ("p", "Interview tip: if asked which cash flow to use in a DCF, say unlevered FCF discounted at WACC gives enterprise value. Then subtract net debt to get equity value."),
],
"wacc-explained": [
 ("h2", "Where each input comes from"),
 ("table", ["Input", "Usual source", "Note"], [
   ["Cost of equity", "CAPM: risk-free rate + beta × equity risk premium", "The biggest and most debated input"],
   ["Risk-free rate", "Long-term government bond yield", "Match the currency of the cash flows"],
   ["Beta", "Re-levered average of comparable companies", "Unlever peers' betas, then re-lever at the target's capital structure"],
   ["Cost of debt", "Yield on the company's bonds or similar-rated debt", "Use it after tax: × (1 − tax rate)"],
   ["Weights", "Target or market-value mix of debt and equity", "Use market values, not book values"]]),
 ("h2", "What moves WACC"),
 ("card", "Directional answers interviewers want", [
   "Higher interest rates raise both the cost of debt and the risk-free rate, so WACC rises and DCF value falls.",
   "Adding some debt usually lowers WACC because debt is cheaper and interest is tax-deductible.",
   "Too much debt raises the risk of distress, which pushes both the cost of debt and the cost of equity up."]),
],
"valuation-multiples": [
 ("h2", "Picking the right multiple"),
 ("table", ["Multiple", "Use it when", "Watch out for"], [
   ["EV/EBITDA", "Most mature, profitable companies", "Capital-heavy businesses where capex matters a lot"],
   ["EV/Revenue", "Fast-growing or unprofitable companies", "Says nothing about margins"],
   ["P/E", "Banks, insurers and stable earners", "Affected by debt levels and one-time items"],
   ["P/B (price to book)", "Banks and other balance-sheet businesses", "Less useful for asset-light companies"]]),
 ("h2", "Match the numerator and denominator"),
 ("p", "Enterprise value pairs with metrics that belong to all investors, like revenue, EBITDA and EBIT. Equity value pairs with metrics that belong only to shareholders, like net income. Mixing them, for example EV/net income, is a classic interview trap."),
 ("card", "How bankers use multiples", [
   "Comparable companies: what similar public companies trade at today.",
   "Precedent transactions: what buyers paid for similar companies, usually higher because of the control premium.",
   "Both feed the football field chart next to the DCF."]),
],
"what-is-private-equity": [
 ("h2", "How a private equity fund works"),
 ("card", "The basic structure", [
   "<b>General partners (GPs)</b> run the fund and pick the investments.",
   "<b>Limited partners (LPs)</b>, such as pension funds and endowments, supply most of the money.",
   "Funds usually invest over several years, then sell the companies and return the money.",
   "GPs typically earn a management fee plus a share of the profits, called carried interest."]),
 ("h2", "How PE firms make money on a deal"),
 ("table", ["Lever", "What it means"], [
   ["Debt paydown", "The company's cash flow repays the acquisition debt, so the equity's share of value grows"],
   ["EBITDA growth", "Higher revenue or better margins raise the company's value"],
   ["Multiple expansion", "Selling at a higher valuation multiple than the purchase multiple"]]),
 ("p", "These three levers are the heart of an LBO. If you can explain them with a simple example, you can handle most PE interview basics."),
],
"what-is-a-hedge-fund": [
 ("h2", "Common hedge fund strategies"),
 ("table", ["Strategy", "The basic idea"], [
   ["Long/short equity", "Buy stocks expected to rise and short stocks expected to fall"],
   ["Global macro", "Bet on interest rates, currencies and commodities based on the economy"],
   ["Event-driven", "Trade around mergers, bankruptcies and other corporate events"],
   ["Quantitative", "Use models and data to find patterns and trade systematically"],
   ["Credit", "Invest in corporate bonds and loans, including distressed debt"]]),
 ("h2", "Hedge funds vs. mutual funds"),
 ("card", "Key differences", [
   "Hedge funds can short, use leverage and trade almost anything; mutual funds face tighter rules.",
   "Hedge funds usually take money only from wealthy individuals and institutions.",
   "Hedge funds typically charge a management fee plus a performance fee."]),
 ("p", "Interview tip: have one stock pitch ready, long or short, with a clear thesis, a valuation view and a catalyst."),
],
"private-equity-vs-investment-banking": [
 ("h2", "Day to day: advising vs. investing"),
 ("table", ["", "Investment banking", "Private equity"], [
   ["Main job", "Advise companies on deals and raise capital", "Buy companies, improve them and sell them"],
   ["Typical work", "Pitch books, models, deal process management", "Screening deals, diligence, LBO models, portfolio monitoring"],
   ["Paid for", "Closing transactions (fees)", "Investment returns (fees and carried interest)"],
   ["Mindset", "Get the deal done for the client", "Would I put money into this?"]]),
 ("h2", "The usual path"),
 ("p", "Many PE associates start as investment banking analysts, then recruit for private equity after one to three years. Banking teaches modeling, deal process and how to work with clients, which is why PE firms hire from it."),
 ("card", "If you want PE eventually", [
   "Pick a banking group with lots of M&A or leveraged finance deals.",
   "Get very comfortable with LBO models and with talking about deals you've worked on.",
   "Start learning how PE firms think: returns, risks and value creation."]),
],
"corporate-banking-vs-investment-banking": [
 ("h2", "What each team actually does"),
 ("table", ["", "Corporate banking", "Investment banking"], [
   ["Main product", "Loans, credit lines and cash management", "M&A advice, stock and bond offerings"],
   ["Relationship", "Long-term lender to the company", "Adviser on specific transactions"],
   ["Core skill", "Credit analysis: can the company repay?", "Valuation and deal execution"],
   ["Pace", "Steadier, more predictable", "Deal-driven and usually more intense"]]),
 ("h2", "How they work together"),
 ("p", "Big banks often lend to a company through corporate banking and then win its M&A or capital markets work through investment banking. Lending relationships can open doors to advisory mandates."),
 ("card", "Which one fits you?", [
   "Choose corporate banking if you like credit, steady hours and long client relationships.",
   "Choose investment banking if you want deal experience and options like private equity later."]),
],
"investment-banking-groups-explained": [
 ("h2", "Coverage vs. product groups"),
 ("table", ["Type", "Focus", "Examples"], [
   ["Industry (coverage)", "Know one industry deeply and its companies", "Technology, healthcare, consumer, industrials, financial institutions"],
   ["Product", "Execute one type of transaction across industries", "M&A, leveraged finance, equity capital markets, debt capital markets, restructuring"]]),
 ("p", "Coverage bankers build relationships and pitch ideas. Product bankers bring the technical expertise to execute. On most deals they work together."),
 ("h2", "How to choose a group"),
 ("card", "Questions to ask yourself", [
   "Which industry do you actually like reading about?",
   "Do you want broad deal exposure (M&A) or deep technical skills (leveraged finance, restructuring)?",
   "Where do people in that group go next: private equity, hedge funds or corporate roles?"]),
],
"what-do-investment-banking-analysts-do": [
 ("h2", "A typical week"),
 ("card", "Where analyst time goes", [
   "Updating financial models and building valuations (DCF, comps, LBO).",
   "Making and fixing slides for pitch books and client presentations.",
   "Researching companies and industries.",
   "Managing data rooms and diligence lists on live deals.",
   "Turning comments from associates and VPs quickly and accurately."]),
 ("h2", "Analyst vs. associate vs. VP"),
 ("table", ["Level", "Main focus"], [
   ["Analyst", "Models, slides and research"],
   ["Associate", "Checks the analyst's work and manages the work stream"],
   ["Vice president", "Runs deals day to day and talks with clients"],
   ["Director / MD", "Wins clients and new business"]]),
 ("p", "What separates strong analysts: attention to detail, fast turnaround and a clear sense of what the deal team needs next."),
],
"investment-banking-hours": [
 ("h2", "Why the hours are long"),
 ("card", "What drives the workload", [
   "Clients and deal deadlines set the schedule, not the bank.",
   "Work moves down the chain: comments from senior bankers often arrive late in the day.",
   "Live deals bring sudden spikes, like a bid deadline or a signing."]),
 ("h2", "How to manage it"),
 ("card", "Habits that help analysts", [
   "Get fast at Excel and PowerPoint so routine work takes less time.",
   "Keep a running list of open items and confirm deadlines early.",
   "Protect sleep and exercise when things are slow; busy weeks will come.",
   "Ask about a group's culture and staffing during recruiting. Hours vary a lot by group and bank."]),
 ("p", "Many banks have added protected weekend time and other policies in recent years. Ask current analysts how they work in practice."),
],
"investment-banking-cover-letter": [
 ("h2", "A simple structure"),
 ("table", ["Paragraph", "What to say"], [
   ["Opening", "Who you are, the role you're applying for, and any connection to the bank"],
   ["Why banking", "One or two specific reasons, tied to something you've done"],
   ["Why you", "Two experiences that show work ethic, numbers and teamwork"],
   ["Close", "Thank them and say you'd welcome a conversation"]]),
 ("h2", "Mistakes to avoid"),
 ("card", "Common problems", [
   "Repeating your resume line by line.",
   "Generic praise of the bank that could apply to any firm.",
   "Typos or the wrong bank name. Reread every letter before sending.",
   "Going over one page. Shorter is better."]),
],
"investment-banking-resume": [
 ("h2", "Writing bullets that stand out"),
 ("card", "A simple formula", [
   "Action verb + what you did + the result, with a number when you have one.",
   "Example pattern: \"Built a model of X that helped Y decide Z.\"",
   "Cut filler words like \"responsible for\" and \"helped with\"."]),
 ("h2", "Final checks before you apply"),
 ("card", "Checklist", [
   "One page, consistent fonts, dates aligned on the right.",
   "No typos. Have a friend read it too.",
   "Save as a PDF named with your full name.",
   "Be ready to talk about every line in an interview."]),
],
"non-target-investment-banking": [
 ("h2", "Where non-target students find openings"),
 ("card", "Places to look", [
   "Middle-market banks and boutiques, which often recruit from more schools.",
   "Regional offices of larger banks.",
   "Diversity and early-insight programs, which can lead to internships.",
   "Adjacent roles first, such as valuation, corporate finance or Big 4 transaction services, then switching."]),
 ("h2", "Networking that works"),
 ("card", "A steady routine", [
   "Find alumni at banks on LinkedIn and send short, specific messages.",
   "Ask for 15-minute calls, prepare good questions and send a thank-you note.",
   "Keep a simple tracker of who you talked to and when to follow up."]),
 ("p", "Being technically sharp matters even more without a school pipeline. Interviewers need to see that you can do the job on day one."),
],
"finance-internships-for-freshmen": [
 ("h2", "What counts as good freshman experience"),
 ("card", "Options that help later", [
   "Early-insight or diversity programs at banks.",
   "Internships at small firms: wealth management, local investment firms or startups.",
   "Finance roles in student-managed funds or investment clubs.",
   "Any job where you work with numbers or customers and can show results."]),
 ("h2", "How to use freshman year well"),
 ("card", "Simple plan", [
   "Keep your GPA strong; it filters resumes later.",
   "Learn accounting and valuation basics.",
   "Start talking to upperclassmen and alumni about their paths.",
   "Write down what you learn so you can tell a clear story in interviews."]),
],
"investment-banking-for-high-school-students": [
 ("h2", "What you can do now"),
 ("card", "Good starting points", [
   "Learn how the stock market and companies work; follow business news.",
   "Join or start an investment or business club.",
   "Try a simple stock pitch: what the company does, why you like it, what could go wrong.",
   "Build basic Excel skills."]),
 ("h2", "Choosing a college with finance in mind"),
 ("card", "Things to look at", [
   "Strong finance or economics programs and active finance clubs.",
   "Where graduates work: check career reports and LinkedIn.",
   "Location: schools near financial centers can make networking easier."]),
 ("p", "No need to rush. Good grades, curiosity and a few real experiences put you in a strong spot for college recruiting."),
],
"equity-research-interview-questions": [
 ("h2", "What equity research interviews test"),
 ("card", "Main topics", [
   "A stock pitch with a clear thesis, valuation and catalysts.",
   "Accounting and how the three statements connect.",
   "Valuation: multiples, DCF basics and why a stock looks cheap or expensive.",
   "Writing: many teams give a short writing or modeling test."]),
 ("h2", "Building a good stock pitch"),
 ("table", ["Part", "What to cover"], [
   ["Thesis", "Two or three reasons the market is mispricing the stock"],
   ["Valuation", "Your price target and the method behind it"],
   ["Catalysts", "Events that could make the market agree with you"],
   ["Risks", "What would prove you wrong"]]),
],
"sales-and-trading-interview-questions": [
 ("h2", "What S&T interviews focus on"),
 ("card", "Main topics", [
   "Markets knowledge: where major indexes, rates and commodities are and why they moved.",
   "A trade idea or stock pitch you can defend.",
   "Quick mental math and probability questions.",
   "Fit: why sales vs. trading, and why this desk."]),
 ("h2", "Sales vs. trading"),
 ("table", ["", "Sales", "Trading"], [
   ["Main job", "Build relationships with clients and bring them ideas", "Price and execute trades and manage risk"],
   ["Key skills", "Communication, market knowledge, client focus", "Quick decisions, math, risk management"]]),
 ("p", "Read the markets news every morning before interviews. Interviewers often ask what happened in markets today."),
],
}

done = 0
for slug, blocks in X.items():
    p = os.path.join(ROOT, "guides", slug, "index.html")
    s = open(p, encoding="utf-8").read()
    if "<!--expand-->" in s:
        continue
    anchor = "<h2>Common questions</h2>"
    if anchor not in s:
        print("no anchor:", slug); continue
    s = s.replace(anchor, "<!--expand-->" + "".join(block(b) for b in blocks) + anchor, 1)
    open(p, "w", encoding="utf-8").write(s); done += 1
print("expanded", done, "pages")
