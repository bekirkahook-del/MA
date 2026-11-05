import { marketBrief } from "./brief.mjs";
// Builds the Sunday email. Rotates through curveballs, tips and guides by week number, so it runs itself.
const CURVE = [
  ["What's 13% of 87?", "11.31. 10% is 8.7, 3% is 2.61, add them."],
  ["A bat and ball cost $1.10. The bat costs $1 more than the ball. What does the ball cost?", "5 cents, not 10. Ball = x, bat = x + 1, so 2x + 1 = 1.10."],
  ["What's the angle between the clock hands at 3:15?", "7.5°. The hour hand has moved a quarter of the way to the 4."],
  ["A stock goes up 10%, then down 10%. Where is it now?", "Down 1%. $100 → $110 → $99."],
  ["You triple your money in 5 years. Roughly what's the IRR?", "About 25%."],
  ["Revenue grows from $80M to $100M. What's the growth rate?", "25%, not 20%. The change (20) divided by the start (80)."],
  ["What's 17 × 24?", "408. 17 × 25 = 425, minus 17."],
  ["Equity value $500M, debt $200M, cash $50M. What's enterprise value?", "$650M. Equity + debt − cash."],
  ["5 machines make 5 widgets in 5 minutes. How long for 100 machines to make 100 widgets?", "5 minutes. Each machine makes 1 widget in 5 minutes."],
  ["At 8% a year, about how long until your money doubles?", "About 9 years (Rule of 72: 72 ÷ 8)."],
  ["What's 35 squared?", "1,225. 3 × 4 = 12, then add 25."],
  ["How many times do the clock hands overlap in 12 hours?", "11, not 12."],
];
const TIPS = [
  "Send one cold email to an alum in finance this week. Short beats perfect: who you are, one thing you share, ask for 15 minutes.",
  "Practice \"tell me about yourself\" out loud until it's under 90 seconds. Past, present, why this job.",
  "Pick one deal from the news and learn it: who bought whom, the price, and why. Interviewers love asking about this.",
  "Keep a simple spreadsheet of everyone you network with and when to follow up. Most people forget to follow up.",
  "Learn the 3 financial statements cold. It's the first technical topic in almost every interview.",
  "Join (or start) your school's investment club. Pitching one stock gives you a great interview story.",
  "After any coffee chat, send a thank-you within 24 hours that mentions one thing they said.",
  "Do 10 minutes of mental math a day. Speed under pressure is a real interview skill.",
];
const GUIDES = [
  ["how-to-get-into-investment-banking", "How to get into investment banking: a step-by-step plan"],
  ["what-is-private-equity", "What is private equity? Explained simply"],
  ["why-investment-banking-answer", "How to answer \"Why investment banking?\""],
  ["dcf-interview-questions", "How to walk through a DCF"],
  ["coffee-chat-questions", "Coffee chat questions (and how to ask for one)"],
  ["what-is-an-lbo", "What is an LBO? With a simple example"],
  ["investment-banking-resume", "How to write an investment banking resume"],
  ["superday-guide", "The Superday: what to expect"],
  ["valuation-multiples", "Valuation multiples explained"],
  ["non-target-investment-banking", "Breaking in from a non-target school"],
];
export async function weekly(now = new Date()) {
  let brief = { html: "", subjectBit: "" }; try { brief = await marketBrief(now); } catch (e) { console.error("brief", e); }
  const w = Math.floor((now.getTime() / 864e5 - 3) / 7); // changes every Sunday
  const [q, a] = CURVE[w % CURVE.length], tip = TIPS[w % TIPS.length], [slug, title] = GUIDES[w % GUIDES.length];
  const u = (p) => `https://mnaprep.com/${p}${p.includes("?") ? "&" : "?"}utm_source=email&utm_campaign=weekly-${w}`;
  const btn = (href, text) => `<a href="${href}" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;border-radius:10px;padding:11px 18px">${text}</a>`;
  const subject = `Your Sunday brief${brief.subjectBit} + this week's curveball`;
  const body = `${brief.html ? brief.html + '<hr style="border:0;border-top:1px solid #D3D9E4;margin:22px 0">' : ""}<p style="margin-top:0;font-size:12px;letter-spacing:.1em;color:#C33;font-weight:bold">CURVEBALL OF THE WEEK</p>
<p style="font-size:20px;font-weight:bold;line-height:1.3;margin:6px 0 16px">${q}</p>
<p style="color:#4A5672">No calculator. Think about it, then scroll down for the answer.</p>
<hr style="border:0;border-top:1px solid #D3D9E4;margin:20px 0">
<p style="font-size:12px;letter-spacing:.1em;color:#A97A1E;font-weight:bold;margin:0">TIP OF THE WEEK</p>
<p>${tip}</p>
<p style="font-size:12px;letter-spacing:.1em;color:#4A5672;font-weight:bold;margin:20px 0 0">WORTH READING</p>
<p><a href="${u("guides/" + slug + "/")}" style="color:#2448D8;font-weight:bold">${title} →</a></p>
<hr style="border:0;border-top:1px solid #D3D9E4;margin:20px 0">
<p style="font-size:12px;letter-spacing:.1em;color:#1E7F4F;font-weight:bold;margin:0">THE ANSWER</p>
<p><b>${a}</b></p>
<p>Want a new one every day, plus a 60-second mental math sprint?</p>
<p>${btn(u("#curve"), "Practice free on M&amp;A Prep →")}</p>`;
  return { subject, body, week: w };
}
