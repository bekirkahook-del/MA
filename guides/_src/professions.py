#!/usr/bin/env python3
"""Builds "<school>-<profession>" guides (private equity, hedge funds, consulting, sales & trading) for every school
that already has an investment banking guide. Reuses each school's sourced club/program cards and source links, and the
profession facts already published in the site's own guides (no new numbers). Idempotent.
Run from anywhere: python3 guides/_src/professions.py   (then run seo.py)"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
src = open(os.path.join(HERE, "build.py"), encoding="utf-8").read()
exec(src[:src.index("for p in PAGES:")])          # block(), page(), STYLE, TODAY, e, ROOT, G, PAGES ...
from schools import SCHOOLS, CTA
from schools2 import SCHOOLS2
from schools3 import SCHOOLS3
from schools4 import SCHOOLS4
from banks import BANKS
SCHOOLS = SCHOOLS + SCHOOLS2 + SCHOOLS3 + SCHOOLS4
PAGES.extend(SCHOOLS + BANKS)

def L(slug, text): return f'<a href="/guides/{slug}/">{text}</a>'

PROFS = [
 dict(key="private-equity", label="Private equity", noun="private equity", index_id="pe-by-school",
  index_h2="Private equity by school", core="private-equity-interview-questions",
  lede=lambda n: ["A private equity (PE) firm raises money from big investors, uses it to buy companies, usually owns each one for about 3 to 7 years, and sells it for a profit. Most people get in by starting in investment banking for about 2 years, then interviewing for PE associate jobs.",
                  f"So the path from {n} usually runs through banking first. The clubs and programs below come from our {n} guide, and the steps and interview topics come from our PE guides."],
  steps=[["Freshman–sophomore year", "Join a finance club, learn accounting and valuation basics, and keep your GPA high."],
         ["Sophomore–junior year", "Recruit for an investment banking internship. This is the usual first step toward PE."],
         ["Analyst years (about 2)", "Work on deals in banking and build modeling skills."],
         ["PE associate recruiting", "Interview for associate roles at funds: paper LBOs, modeling tests, case studies and \"would you invest?\"."]],
  topics_h="What PE interviews test", topics=[
   "How a fund works: general partners (GPs), limited partners (LPs), the \"2 and 20\" fees, carry and the hurdle.",
   "Paper LBOs and timed modeling tests, including IRR vs. MOIC. MOIC is total money back divided by money in; IRR is the annualized return that accounts for timing.",
   "Investment judgment: the market, business quality, returns (entry price, leverage, value-creation plan, exit) and what could go wrong.",
   "A case study or \"pick a public company you'd take private\" question."],
  faqs=lambda n: [(f"Can I get into private equity from {n}?", f"Most people start in investment banking for about 2 years and then interview for PE associate jobs, so the first goal is a banking internship. See the {n} IB guide linked above for the clubs and programs that feed that step."),
                  ("Is private equity the same as venture capital?", "No. Venture capital invests in young startups. PE usually buys established, profitable companies."),
                  ("What is a leveraged buyout?", "An LBO is when a PE firm buys a company using a lot of borrowed money. More in " + L("what-is-an-lbo", "what is an LBO") + ".")],
  links=[("private-equity-interview-questions", "Private equity interview questions"), ("what-is-private-equity", "What is private equity?"), ("what-is-an-lbo", "What is an LBO?"), ("irr-moic-cheat-sheet", "IRR and MOIC cheat sheet")],
  related=["private-equity-interview-questions", "what-is-private-equity", "private-equity-vs-investment-banking"]),
 dict(key="hedge-funds", label="Hedge funds", noun="hedge funds", index_id="hf-by-school",
  index_h2="Hedge funds by school", core="hedge-fund-interview-questions-stock-pitch",
  lede=lambda n: ["A hedge fund pools money from wealthy people and institutions and tries to earn strong returns in any market, up or down. Common ways in are investment banking, equity research or trading, and being able to pitch a stock well is key.",
                  f"The clubs and programs below come from our {n} guide; the pitch structure and interview topics come from our hedge fund guides."],
  steps=[["Early on", "Join an investing or finance club and start following markets daily."],
         ["Build the pitch", "Write up a stock pitch: long or short with a price target, 2–3 thesis points, your variant view, a catalyst, valuation and risks."],
         ["Get a feeder role", "Investment banking, equity research or trading are the common paths in."],
         ["Interview", "Pitch a stock, defend it under follow-ups and show you know where markets are today."]],
  topics_h="What hedge fund interviews test", topics=[
   "Your stock pitch: the call (long or short with a price target), two or three thesis points, why the market is wrong (your variant view), a catalyst and valuation.",
   "Risk follow-ups: what would make you wrong, how you'd size the position, and what you'd do if it fell 20%.",
   "Markets knowledge: current levels and what's driving them, plus how rate changes affect stocks and bonds.",
   "Basics like stock vs. bond, long vs. short and the main strategies (long/short equity, global macro, event-driven, quant)."],
  faqs=lambda n: [(f"How do I get a hedge fund job from {n}?", "Common paths are investment banking, equity research or trading, and a strong stock pitch is key. Start with the clubs and programs above, then practice pitching out loud."),
                  ("How do hedge funds make money?", "They charge a management fee on the money they run and keep a share of the profits they make for investors."),
                  ("What's the difference between a hedge fund and a mutual fund?", "Mutual funds are open to everyone and mostly buy stocks and bonds. Hedge funds are for wealthy investors and use more strategies, like shorting and leverage.")],
  links=[("hedge-fund-interview-questions-stock-pitch", "Hedge fund interview questions and stock pitch"), ("what-is-a-hedge-fund", "What is a hedge fund?"), ("how-to-pitch-a-stock-interview", "How to pitch a stock"), ("equity-research-interview-questions", "Equity research interview questions")],
  related=["hedge-fund-interview-questions-stock-pitch", "what-is-a-hedge-fund", "how-to-pitch-a-stock-interview"]),
 dict(key="consulting", label="Consulting", noun="consulting", index_id="consulting-by-school",
  index_h2="Consulting by school", core="consulting-case-interview",
  lede=lambda n: ["Consulting firms like McKinsey, BCG and Bain use case interviews to see how you think. You get a business problem, ask clarifying questions, lay out a structure, work through data and math, then give a recommendation.",
                  f"The clubs and programs below come from our {n} guide; the case approach comes from our consulting guides."],
  steps=[["Learn the format", "A case is a business problem, clarifying questions, a structure, data and math, then a recommendation."],
         ["Practice structures", "Use MECE (mutually exclusive, collectively exhaustive) structures, like profit = revenue − costs."],
         ["Practice math and sizing", "Talk through case math out loud and do market sizing (guesstimate) questions top-down or bottom-up."],
         ["Prepare your fit story", "Have specific answers to \"Why consulting?\" and the usual behavioral questions."]],
  topics_h="What consulting interviews test", topics=[
   "Case structure: MECE frameworks such as profitability and market entry.",
   "Case math done quickly and out loud.",
   "A clear recommendation: answer first, then reasons, risks and next steps.",
   "Fit: specific reasons for consulting (variety of problems, learning fast, impact), tied to your own experience, plus a firm-specific reason."],
  faqs=lambda n: [(f"How do I prepare for consulting recruiting at {n}?", "Practice cases out loud with a partner, learn MECE structures and case math, and prepare a specific \"Why consulting?\" answer. The clubs and programs above are a good place to find practice partners."),
                  ("What is a MECE structure?", "MECE means mutually exclusive, collectively exhaustive: your categories don't overlap and together they cover the whole problem."),
                  ("How should I end a case?", "Give the answer first, then the reasons, the risks and next steps.")],
  links=[("consulting-case-interview", "Consulting case interviews"), ("market-sizing-questions", "Market sizing questions"), ("behavioral-interview-questions-finance", "Behavioral and fit questions"), ("mental-math-finance-interviews", "Mental math for finance interviews")],
  related=["consulting-case-interview", "market-sizing-questions", "behavioral-interview-questions-finance"]),
 dict(key="sales-and-trading", label="Sales and trading", noun="sales and trading", index_id="st-by-school",
  index_h2="Sales and trading by school", core="sales-and-trading-interview-questions",
  lede=lambda n: ["Sales and trading (S&T) teams buy and sell stocks, bonds and other assets for big clients. Salespeople talk to clients and bring in orders; traders execute the trades and manage the bank's risk.",
                  f"Interviews test whether you follow markets and think fast with numbers. The clubs and programs below come from our {n} guide; the interview topics come from our S&T guide."],
  steps=[["Follow markets daily", "Know roughly where major stock indexes, the 10-year Treasury yield and oil are, and one reason for a recent move."],
         ["Build mental math", "Practice quick percentages and multiplication until it's automatic."],
         ["Prepare a trade pitch", "What you'd buy or sell, the catalyst, what could go wrong and when you'd get out, in 2 minutes."],
         ["Know why S&T", "Tie your interest in fast decisions and live markets to something you've actually done."]],
  topics_h="What S&T interviews test", topics=[
   "Market awareness: \"Where are the markets today?\" and one reason for a recent move.",
   "Pitching a trade: what to buy or sell, the catalyst, the risks and your exit, in about 2 minutes.",
   "Fast mental math and brain teasers.",
   "Basics like what happens to bond prices when interest rates go up (they go down) and the difference between sales and trading."],
  faqs=lambda n: [(f"How do I prepare for sales and trading from {n}?", "Follow markets every day, practice mental math and prepare a 2-minute trade pitch. Use the clubs and programs above to practice with other students."),
                  ("What's the difference between sales and trading?", "Salespeople talk to clients and bring in orders. Traders execute the trades and manage the bank's risk."),
                  ("What happens to bond prices when interest rates go up?", "Bond prices go down. New bonds pay more, so older bonds with lower rates are worth less.")],
  links=[("sales-and-trading-interview-questions", "Sales and trading interview questions"), ("mental-math-finance-interviews", "Mental math for finance interviews"), ("brain-teasers-finance-interviews", "Brain teasers"), ("what-is-a-hedge-fund", "What is a hedge fund?")],
  related=["sales-and-trading-interview-questions", "mental-math-finance-interviews", "brain-teasers-finance-interviews"]),
]

def school_bits(sc):
    name = sc["short"].replace("Investment banking from ", "")
    m = re.search(r"\((.+)\)\s*$", sc["title"]); full = m.group(1) if m else None
    cards, srcs = [], None
    for b in sc["body"]:
        if b[0] == "h2" and b[1].startswith("Your timeline"): break
        if b[0] == "card": cards.append(b)
    for b in sc["body"]:
        if b[0] == "p" and b[1].startswith("Sources:"): srcs = b
    return name, full, cards, srcs

def build_page(sc, pf):
    name, full, cards, srcs = school_bits(sc)
    slug = sc["slug"].replace("-investment-banking", "") + "-" + pf["key"]
    ib = sc["slug"]
    body = [("h2", f"The path from {name}"), ("table", ["When", "What to do"], pf["steps"]),
            ("h2", f"Clubs and programs to know at {name}"),
            ("p", f"These come from our {L(ib, name + ' investment banking guide')}, where each one is described and sourced."),
            *cards,
            ("h2", pf["topics_h"]), ("card", "What to expect", pf["topics"]),
            ("p", "Read next: " + " · ".join(L(s, t) for s, t in pf["links"]) + "."),
            ("h2", "Common questions"), *[("qa", q, a) for q, a in pf["faqs"](name)],
            CTA]
    if srcs: body.append(srcs)
    return {"slug": slug, "short": f"{pf['label']} from {name}",
            "title": f"How to Get Into {pf['label'].title().replace('And','and')} From {name}" + (f" ({full})" if full else ""),
            "h1": f"How to get into {pf['noun']} from {name}",
            "desc": f"How {name} students can break into {pf['noun']}: the path, what interviews test, and the clubs and programs to know at {name}, in plain English.",
            "related": [ib] + pf["related"], "lede": pf["lede"](name), "body": body}

NEW = {pf["key"]: [build_page(sc, pf) for sc in SCHOOLS] for pf in PROFS}
ALL = [p for pf in PROFS for p in NEW[pf["key"]]]
PAGES.extend(ALL)                                    # so related-link names resolve
if __name__ == "__main__":
    for p in ALL:
        f = os.path.join(G, p["slug"], "index.html")
        old = open(f, encoding="utf-8").read() if os.path.exists(f) else ""
        html_ = page(p)
        m = re.search(r'"datePublished": "([0-9-]+)"', old)
        if m: html_ = re.sub(r'"datePublished": "[0-9-]+"', f'"datePublished": "{m.group(1)}"', html_)
        os.makedirs(os.path.dirname(f), exist_ok=True); open(f, "w", encoding="utf-8").write(html_)
    print("wrote", len(ALL), "pages")
    ix = os.path.join(G, "index.html"); s = open(ix, encoding="utf-8").read()
    for pf in PROFS:
        s = re.sub(rf'<h2 id="{pf["index_id"]}">.*?</ul>', "", s, flags=re.S)
        items = sorted(NEW[pf["key"]], key=lambda p: __import__("schoolsort").key(p["short"].split(" from ", 1)[1]))
        cards = "".join(f'<li><a href="/guides/{p["slug"]}/">{e(p["short"])}</a></li>' for p in items)
        s = s.replace("</main>", f'<h2 id="{pf["index_id"]}">{pf["index_h2"]}</h2><ul class="more">{cards}</ul></main>', 1)
    open(ix, "w", encoding="utf-8").write(s); print("index sections added")
    sm = os.path.join(ROOT, "sitemap.xml"); s = open(sm, encoding="utf-8").read(); added = 0
    for p in ALL:
        loc = f"https://mnaprep.com/guides/{p['slug']}/"
        if loc not in s:
            s = s.replace("</urlset>", f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n</urlset>"); added += 1
    open(sm, "w", encoding="utf-8").write(s); print("sitemap +", added, "->", s.count("<url>"), "urls")
