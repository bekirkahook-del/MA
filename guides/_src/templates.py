#!/usr/bin/env python3
"""Builds the free networking templates: an Excel networking tracker, a cold email pack (PDF) and the page that offers them.
Run from the repo root: python3 guides/_src/templates.py
Writes: templates/networking-tracker.xlsx, templates/cold-email-pack.pdf, tools/networking-templates/index.html,
        adds a card to /tools/, a sitemap URL and the short link /templates. Then run recalc on the xlsx (see bottom note)."""
import os, re, json, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
code = open(os.path.join(SRC, "tools.py"), encoding="utf-8").read()
exec(code[:code.index("# ---------- 1.")])  # ROOT, shell(), e(), SITE, TODAY ...

OUT = os.path.join(ROOT, "templates"); os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------------ 1. Excel tracker
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.comments import Comment

F = "Arial"
navy = "13203B"; cobalt = "2448D8"
H_FONT = Font(name=F, bold=True, color="FFFFFF", size=11); H_FILL = PatternFill("solid", fgColor=navy)
IN_FONT = Font(name=F, color="0000FF", size=11)          # blue = type here
BLK = Font(name=F, size=11); GREY = Font(name=F, italic=True, color="7A8499", size=11)
thin = Side(style="thin", color="D3D9E4"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
YEL = PatternFill("solid", fgColor="FFF4D6")

wb = Workbook()

# ---- Start here
ws = wb.active; ws.title = "Start here"
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 3; ws.column_dimensions["B"].width = 30; ws.column_dimensions["C"].width = 78
ws["B2"] = "Finance networking tracker"; ws["B2"].font = Font(name=F, bold=True, size=18, color=navy)
ws["B3"] = "Free from M&A Prep · mnaprep.com"; ws["B3"].font = GREY
rows = [
 ("How to use it", ""),
 ("1. Add people on the Contacts tab", "One row per person. Type only in the blue columns. The black columns fill in on their own."),
 ("2. Send, then log the date", "Put the date you emailed them in \"First contacted\". A follow-up date appears 7 days later."),
 ("3. Check the Status column", "It tells you what to do next: Follow up now, Schedule call or Send thank-you."),
 ("4. Open Summary on Mondays", "See how many emails you sent this week, your reply rate and what you owe people."),
 ("5. Use Target firms to stay organized", "List the firms you want, add the date applications open, and see how many contacts you have at each."),
 ("", ""),
 ("Colors", ""),
 ("Blue text", "Cells you type in."),
 ("Black text", "Formulas. Don't type over them."),
 ("Grey italic row", "An example row on the Contacts tab. Overwrite or delete it. Summary counts it until you do."),
]
r = 5
for a, b in rows:
    ws.cell(r, 2, a).font = Font(name=F, bold=True, size=12 if b == "" and a else 11, color=navy if b == "" else "000000")
    ws.cell(r, 3, b).font = BLK; ws.cell(r, 3).alignment = Alignment(wrap_text=True, vertical="top"); r += 1
ws["B13"].font = Font(name=F, color="0000FF", bold=True); ws["B14"].font = Font(name=F, bold=True)

# ---- Contacts
c = wb.create_sheet("Contacts")
heads = ["Name", "Firm", "Group / role", "How you know them", "Email or LinkedIn", "First contacted", "Follow up on", "Replied?",
         "Call date", "Thank-you sent?", "What they told you", "Status"]
widths = [24, 22, 22, 20, 28, 15, 14, 11, 13, 15, 44, 18]
for i, (h, w) in enumerate(zip(heads, widths), 1):
    cell = c.cell(1, i, h); cell.font = H_FONT; cell.fill = H_FILL; cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True); cell.border = BOX
    c.column_dimensions[chr(64 + i)].width = w
c.row_dimensions[1].height = 32
LAST = 202
ex = ["Jordan Lee (example)", "Example Capital", "M&A, Analyst", "Alumni", "jordan@example.com", datetime.date(2026, 11, 10), None, "No", None, "No",
      "Example only. Write one thing they told you so your follow-up can mention it.", None]
for i, v in enumerate(ex, 1):
    if v is not None: c.cell(2, i, v)
for rr in range(2, LAST + 1):
    for col in range(1, 13):
        cell = c.cell(rr, col); cell.border = BOX
        cell.font = BLK if col in (7, 12) else IN_FONT
        if col in (6, 7, 9): cell.number_format = "mmm d, yyyy"
        if col == 11: cell.alignment = Alignment(wrap_text=True, vertical="top")
    c.cell(rr, 7).value = f'=IF(OR(F{rr}="",H{rr}="Yes"),"",F{rr}+7)'
    c.cell(rr, 12).value = (f'=IF(A{rr}="","",IF(J{rr}="Yes","Done",IF(I{rr}<>"","Send thank-you",IF(H{rr}="Yes","Schedule call",'
                            f'IF(F{rr}="","Not contacted",IF(TODAY()>=G{rr},"Follow up now","Waiting"))))))')
for col in range(1, 13):
    if c.cell(2, col).value is not None and col not in (7, 12): c.cell(2, col).font = GREY
c.freeze_panes = "B2"
dv1 = DataValidation(type="list", formula1='"Alumni,Same club,Friend or family,Cold outreach,Event or info session,Referral"', allow_blank=True)
dv2 = DataValidation(type="list", formula1='"Yes,No"', allow_blank=True)
c.add_data_validation(dv1); c.add_data_validation(dv2)
dv1.add(f"D2:D{LAST}"); dv2.add(f"H2:H{LAST}"); dv2.add(f"J2:J{LAST}")
for txt, color in (("Follow up now", "FDE2E2"), ("Send thank-you", "FFF4D6"), ("Schedule call", "E3E9FC"), ("Done", "DDF3E6")):
    c.conditional_formatting.add(f"L2:L{LAST}", FormulaRule(formula=[f'$L2="{txt}"'], fill=PatternFill("solid", bgColor=color, fgColor=color)))
c["G1"].comment = Comment("Automatic: 7 days after you first contacted them, until they reply.", "M&A Prep")

# ---- Summary
s = wb.create_sheet("Summary"); s.sheet_view.showGridLines = False
s.column_dimensions["A"].width = 3; s.column_dimensions["B"].width = 34; s.column_dimensions["C"].width = 14; s.column_dimensions["D"].width = 52
s["B2"] = "This week at a glance"; s["B2"].font = Font(name=F, bold=True, size=16, color=navy)
rng = lambda col: f"Contacts!{col}2:{col}{LAST}"
lines = [
 ("People in your tracker", f'=COUNTA({rng("A")})', "0", "Counts the example row until you delete it."),
 ("Emails sent (all time)", f'=COUNT({rng("F")})', "0", ""),
 ("Replies", f'=COUNTIF({rng("H")},"Yes")', "0", ""),
 ("Reply rate", '=IF(C6=0,0,C7/C6)', "0%", "Replies divided by emails sent."),
 ("Calls held", f'=COUNT({rng("I")})', "0", ""),
 ("Thank-you notes you still owe", f'=COUNTIFS({rng("I")},"<>",{rng("J")},"<>Yes")', "0", "A call is logged but no thank-you yet."),
 ("Follow-ups due now", f'=COUNTIF({rng("L")},"Follow up now")', "0", "Send a short, polite nudge."),
 ("Emails sent this week (Mon to today)", f'=COUNTIFS({rng("F")},">="&(TODAY()-WEEKDAY(TODAY(),2)+1))', "0", ""),
 ("Your weekly goal", 10, "0", "Change this to what you can keep up."),
 ("Left to hit this week's goal", '=MAX(0,C13-C12)', "0", ""),
]
r = 5
for label, val, fmt, note in lines:
    s.cell(r, 2, label).font = BLK
    cell = s.cell(r, 3, val); cell.number_format = fmt; cell.font = IN_FONT if not str(val).startswith("=") else BLK
    cell.alignment = Alignment(horizontal="right")
    s.cell(r, 4, note).font = GREY
    if label == "Your weekly goal": cell.fill = YEL
    for col in (2, 3, 4): s.cell(r, col).border = Border(bottom=thin)
    r += 1
s["D13"].value = "Blue = type here. Default of 10 is a starting point, not a rule."

# ---- Target firms
t = wb.create_sheet("Target firms")
th = ["Firm", "Type", "Applications open (date)", "Contacts you have", "Where you stand"]
for i, (h, w) in enumerate(zip(th, [26, 20, 22, 18, 22]), 1):
    cell = t.cell(1, i, h); cell.font = H_FONT; cell.fill = H_FILL; cell.alignment = Alignment(horizontal="center", wrap_text=True); cell.border = BOX
    t.column_dimensions[chr(64 + i)].width = w
firms = [("Goldman Sachs", "Bulge bracket"), ("J.P. Morgan", "Bulge bracket"), ("Morgan Stanley", "Bulge bracket"), ("Bank of America", "Bulge bracket"),
         ("Citi", "Bulge bracket"), ("Evercore", "Elite boutique"), ("Lazard", "Elite boutique"), ("Centerview Partners", "Elite boutique"),
         ("PJT Partners", "Elite boutique"), ("Moelis", "Elite boutique"), ("Houlihan Lokey", "Middle market"), ("Jefferies", "Middle market")]
for i in range(2, 32):
    for col in range(1, 6):
        cell = t.cell(i, col); cell.border = BOX; cell.font = IN_FONT if col in (1, 2, 3, 5) else BLK
    if i - 2 < len(firms): t.cell(i, 1, firms[i - 2][0]); t.cell(i, 2, firms[i - 2][1])
    t.cell(i, 3).number_format = "mmm d, yyyy"
    t.cell(i, 4).value = f'=IF(A{i}="","",COUNTIF(Contacts!$B$2:$B${LAST},A{i}))'
dv3 = DataValidation(type="list", formula1='"Researching,Networking,Applied,Interviewing,Offer,Passed"', allow_blank=True)
t.add_data_validation(dv3); dv3.add("E2:E31")
t.freeze_panes = "B2"
t["G1"] = "Type firm names exactly as you write them on the Contacts tab so the count matches."; t["G1"].font = GREY
t["G2"] = "Application dates change every cycle. Check each firm's careers page."; t["G2"].font = GREY

wb.save(os.path.join(OUT, "networking-tracker.xlsx")); print("xlsx written")

# ------------------------------------------------------------------ 2. Cold email pack (PDF)
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Table, TableStyle

NAVY = colors.HexColor("#13203B"); COB = colors.HexColor("#2448D8"); INK2 = colors.HexColor("#4A5672"); RULE = colors.HexColor("#D3D9E4"); PAPER = colors.HexColor("#EEF1F5")
st_h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=26, leading=30, textColor=NAVY, spaceAfter=6)
st_h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=NAVY, spaceBefore=14, spaceAfter=4)
st_p = ParagraphStyle("p", fontName="Helvetica", fontSize=10.5, leading=15, textColor=colors.HexColor("#13203B"), spaceAfter=6)
st_s = ParagraphStyle("s", parent=st_p, fontSize=9.5, textColor=INK2)
st_tag = ParagraphStyle("tag", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=COB, spaceAfter=2)
st_mail = ParagraphStyle("mail", fontName="Courier", fontSize=9.4, leading=13.2, textColor=colors.HexColor("#13203B"))

PACK = [
 ("1", "Cold email to an alum", "Use when you share a school with them. Alumni reply most, so start here.",
  "Subject: [School] [year] interested in [field]\n\nHi [First name],\n\nMy name is [Your name], and I'm a [sophomore] at [School] interested in [investment banking]. I saw that you went to [School] and now work in [group] at [Firm], and I'd love to hear how you got there.\n\nWould you have 15 minutes for a quick call in the next couple of weeks? I'm happy to work around your schedule.\n\nThank you for your time,\n[Your name]\n[School] | [Phone] | [LinkedIn link]"),
 ("2", "Cold email, no school connection", "Use when you share nothing but an interest. Give one specific reason you picked them.",
  "Subject: Question about [group] at [Firm]\n\nHi [First name],\n\nI'm [Your name], a [year] at [School] interested in [field]. I read about [a specific deal or piece of news your group worked on] and it made me want to learn more about the work your team does.\n\nWould you be open to a 15-minute call about your path and what you'd tell a student starting out?\n\nThank you,\n[Your name]"),
 ("3", "LinkedIn connection note", "LinkedIn notes are short. Say who you are and why them in two sentences.",
  "Hi [First name], I'm a [year] at [School] interested in [field]. I saw you work in [group] at [Firm] and would love to learn about your path. Open to a quick chat? Thanks, [Your name]"),
 ("4", "Follow-up after about a week", "Send once if they don't reply. Keep it light, then move on.",
  "Subject: Re: [original subject]\n\nHi [First name],\n\nI wanted to follow up on my note from last week. I know you're busy, so even 10 minutes would mean a lot. If now isn't a good time, no worries at all.\n\nThanks again,\n[Your name]"),
 ("5", "Thank-you note (same day as the call)", "Mention one specific thing they said. That's what makes it memorable.",
  "Subject: Thank you\n\nHi [First name],\n\nThank you for taking the time to talk today. I really appreciated your advice on [one specific thing they said], and I'm going to [what you'll do with it].\n\nI'll keep you posted on how recruiting goes.\n\nBest,\n[Your name]"),
 ("6", "Staying in touch (a month or two later)", "Short updates keep the relationship alive. Don't ask for anything.",
  "Subject: Quick update\n\nHi [First name],\n\nA quick update since we spoke: I [did something you talked about, such as joined a club, read a book, followed a deal]. Your advice on [topic] helped.\n\nHope the [deal or season] is going well.\n\n[Your name]"),
 ("7", "Asking for a referral or a word of support", "Only after a good call and when you've already applied. Make it easy to say no.",
  "Subject: Thank you, and a quick question\n\nHi [First name],\n\nThank you again for the conversation in [month]. I've since applied to the [program] at [Firm]. If you feel comfortable passing my name along to the recruiting team, I'd be grateful, and I completely understand if not.\n\nThanks,\n[Your name]"),
 ("8", "Email to a recruiter or campus contact", "Use for a specific question about timing or process, not to pitch yourself.",
  "Subject: Question about the [year] [program] application\n\nHi [Name],\n\nI'm [Your name], a [year] at [School]. I wanted to ask whether applications for the [program] are open to [year] students yet, and whether there is a deadline I should plan around.\n\nThank you for your help,\n[Your name]"),
]
TIPS = [
 "Email alumni first. A shared school is the easiest reason for a stranger to say yes.",
 "Ask for 15 minutes and a story about their path. Don't ask for a job or a referral in the first note.",
 "Keep it to 4 to 6 sentences. Who you are, why them, one clear ask.",
 "Replace every [bracket] and read the email once out loud before you send it.",
 "Use their real work. A specific deal, product or team shows you did your homework.",
 "Send one follow-up, then move on. Log the date in your tracker so you don't forget.",
 "Send the thank-you note the same day. Mention one thing they said.",
 "Never send the same email, unchanged, to ten people in the same group.",
]

def build_pdf(path):
    doc = SimpleDocTemplate(path, pagesize=letter, leftMargin=0.85*inch, rightMargin=0.85*inch, topMargin=0.8*inch, bottomMargin=0.8*inch,
                            title="Finance cold email pack", author="M&A Prep")
    f = []
    f += [Paragraph("Finance cold email pack", st_h1),
          Paragraph("8 fill-in-the-blank emails for networking into investment banking, private equity and other finance careers. Free from M&amp;A Prep (mnaprep.com).", st_p),
          Spacer(1, 6), Paragraph("How to use this pack", st_h2),
          Paragraph("Copy an email, replace everything in [brackets], and send it from your school address. Each template has a note on when to use it. Then log the person in the free networking tracker so you know when to follow up.", st_p),
          Paragraph("Rules of thumb", st_h2)]
    for t in TIPS: f.append(Paragraph("&bull;&nbsp;&nbsp;" + t, st_p))
    f.append(PageBreak())
    for n, title, when, body in PACK:
        body_html = body.replace("&", "&amp;").replace("<", "&lt;").replace("\n", "<br/>").replace(" ", "&nbsp;") if False else body.replace("&", "&amp;").replace("<", "&lt;").replace("\n", "<br/>")
        box = Table([[Paragraph(body_html, st_mail)]], colWidths=[6.8*inch])
        box.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PAPER), ("BOX", (0, 0), (-1, -1), 0.6, RULE),
                                 ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
        f.append(KeepTogether([Paragraph(f"TEMPLATE {n}", st_tag), Paragraph(title, st_h2), Paragraph(when, st_s), box, Spacer(1, 8)]))
    f += [Spacer(1, 10), Paragraph("Keep practicing", st_h2),
          Paragraph("Networking gets you the conversation. The interview decides the offer. Practice real investment banking, private equity and consulting questions in 5-minute levels, free, at mnaprep.com.", st_p)]
    def foot(canv, d):
        canv.saveState(); canv.setFont("Helvetica", 8.5); canv.setFillColor(INK2)
        canv.drawString(0.85*inch, 0.5*inch, "M&A Prep · mnaprep.com · free finance career training"); canv.drawRightString(letter[0] - 0.85*inch, 0.5*inch, f"Page {d.page}"); canv.restoreState()
    doc.build(f, onFirstPage=foot, onLaterPages=foot)

build_pdf(os.path.join(OUT, "cold-email-pack.pdf")); print("pdf written")

# ------------------------------------------------------------------ 3. The page
SLUG = "networking-templates"
BODY = """<style>.dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:6px 0 4px}
.dl .tool{margin:0}.dl h3{margin:0 0 6px;font-size:18px}.dl p{margin:0 0 4px;color:var(--ink-2);font-size:15px}</style>
<div class="dl">
<div class="tool"><h3>Networking tracker (Excel)</h3><p>Log every person you email. It shows when to follow up, who needs a thank-you and your weekly reply rate.</p>
<a class="btn" href="/templates/networking-tracker.xlsx" download>Download the tracker</a></div>
<div class="tool"><h3>Cold email pack (PDF)</h3><p>8 fill-in-the-blank emails: alumni, cold, LinkedIn, follow-up, thank-you, referral ask and more.</p>
<a class="btn" href="/templates/cold-email-pack.pdf" download>Download the email pack</a></div></div>
<p class="muted">Free. No sign-up needed. Works in Excel and Google Sheets (upload the file to Drive).</p>
<h2>What's in the tracker</h2>
<div class="card"><ul><li><b>Contacts:</b> name, firm, how you know them, first-contacted date and an automatic follow-up date 7 days later.</li>
<li><b>Status column:</b> tells you what to do next: follow up now, schedule a call or send a thank-you.</li>
<li><b>Summary:</b> emails sent this week, reply rate, calls held and thank-you notes you still owe.</li>
<li><b>Target firms:</b> your list of firms with the date applications open and how many contacts you have at each.</li></ul></div>
<h2>What's in the email pack</h2>
<div class="card"><ul><li>Cold email to an alum, and one for when you share no connection</li><li>LinkedIn connection note</li><li>Follow-up, thank-you and stay-in-touch notes</li><li>Referral ask and a recruiter question</li><li>8 rules of thumb that get replies</li></ul></div>
<p>Want the emails written for you? Use the free <a href="/tools/networking-email-generator/">networking email generator</a>. Then practice the call with these <a href="/guides/coffee-chat-questions/">coffee chat questions</a>.</p>"""
FAQ = [("Is the tracker free?", "Yes. Download it and use it as much as you want. No sign-up is needed."),
       ("Does the tracker work in Google Sheets?", "Yes. Upload the .xlsx file to Google Drive and open it with Google Sheets. The dropdowns and formulas carry over."),
       ("How many people can I track?", "The tracker has room for 200 contacts and 30 firms."),
       ("Should I send the same email to everyone?", "No. Change the first line so it mentions something specific about that person, such as their group or a recent deal.")]
page = shell(SLUG, "Free Finance Networking Tracker + Cold Email Pack", "Free networking tracker and cold email pack",
  "Free Excel networking tracker and 8 fill-in-the-blank cold emails for finance recruiting. Track outreach, follow-ups and thank-yous for investment banking networking.",
  ["Two free downloads for finance networking: an Excel tracker that tells you who to follow up with, and a pack of 8 cold emails you can fill in and send.",
   "Built for students recruiting into investment banking, private equity and consulting."], BODY, FAQ, "")
d = os.path.join(ROOT, "tools", SLUG); os.makedirs(d, exist_ok=True)
open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(page); print("page written")

# /tools/ card (idempotent), sitemap, short link
fi = os.path.join(ROOT, "tools", "index.html"); s = open(fi, encoding="utf-8").read()
if f"/tools/{SLUG}/" not in s:
    card = (f'<div class="card"><h3><a href="/tools/{SLUG}/">Free networking tracker and cold email pack</a></h3><p style="margin:0;color:var(--ink-2);font-size:15px">'
            'An Excel tracker for your outreach and 8 fill-in-the-blank cold emails for finance recruiting.</p></div>')
    i = s.index('<!--/tools2-->') if '<!--/tools2-->' in s else s.index('<div class="cta">')
    s = s[:i] + card + s[i:]; open(fi, "w", encoding="utf-8").write(s)
sm = os.path.join(ROOT, "sitemap.xml"); s = open(sm, encoding="utf-8").read(); loc = f"{SITE}/tools/{SLUG}/"
if loc not in s:
    s = s.replace("</urlset>", f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>"); open(sm, "w", encoding="utf-8").write(s)
nt = os.path.join(ROOT, "netlify.toml"); s = open(nt, encoding="utf-8").read()
if 'from = "/templates"' not in s:
    s = s.replace('[[redirects]]\n  from = "/superday"', f'[[redirects]]\n  from = "/templates"\n  to = "/tools/{SLUG}/"\n  status = 301\n\n[[redirects]]\n  from = "/superday"', 1); open(nt, "w", encoding="utf-8").write(s)
print("done")
