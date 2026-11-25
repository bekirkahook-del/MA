// Generates the Obsidian notes FROM the circle graph, so the notes always match the code.
// Usage: node tools/bots/obsidian/build.mjs  (writes into tools/bots/obsidian/, safe to rerun; hand-written text outside the markers is kept)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NODES, EDGES, byId, mermaid } from "../circle/graph.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url)), L = n => "[[" + n + "]]", DATE = "2026-11-25";
const S = "<!-- circle:start -->", E = "<!-- circle:end -->";
const IN = { feed: "Fed by", gate: "Gated by", act: "Directed by", recheck: "Rechecked by", learn: "Taught by" }, OUT = { feed: "Feeds", gate: "Gates", act: "Directs", recheck: "Rechecks", learn: "Teaches" };
const KEY = { "Fed by": "fed_by", "Gated by": "gated_by", "Directed by": "directed_by", "Rechecked by": "rechecked_by", "Taught by": "taught_by", Feeds: "feeds", Gates: "gates", Directs: "directs", Rechecks: "rechecks", Teaches: "teaches" };

function connections(id) {
  const lines = ["## Connections", ""], inl = [];
  const grp = (edges, names, pick) => { const by = {}; edges.forEach(e => (by[names[e.type]] ||= []).push(e)); return Object.entries(by).map(([k, es]) => [k, es.map(e => ({ n: byId[pick(e)].name, label: e.label }))]); };
  const ins = grp(EDGES.filter(e => e.to === id), IN, e => e.from), outs = grp(EDGES.filter(e => e.from === id), OUT, e => e.to);
  for (const [k, es] of [...ins, ...outs]) { lines.push(`**${k}:** ` + es.map(x => `${L(x.n)} (${x.label})`).join("; ")); lines.push(""); inl.push(`${KEY[k]}:: ` + es.map(x => L(x.n)).join(", ")); }
  lines.push("```dataview-fields", ...inl, "```");
  return [S, ...lines, E].join("\n");
}
const BODY = {
  dispatcher: `Takes every finding from every sensor (already deduped in the shared ledger), scores its priority, and decides who handles it: the ${L("Fixer Bot")} for safe fixes, a human for anything that needs judgment, or "watch" for low-severity items. It never changes anything itself.

## Priority
Critical = 300, warn = 200, info = 100. Plus 20 per reopening, 3 per day open (max 30), and 25 if a defect is verified.

## Routing rules
| Situation | Goes to |
|---|---|
| Has a safe fix and the fix type is still trusted | Fixer |
| Fix already failed twice | Human |
| Fix type was demoted by the ${L("Historian Bot")} | Human |
| Came back 3 times (frozen) | Human |
| No safe fix, severity info | Watch |
| No safe fix, severity warn or critical | Human |`,
  guard: `Every action in the circle goes through here. The Guard can say no to the ${L("Fixer Bot")}, and it can switch off the drafting bots.

## It blocks when
- the file \`tools/bots/STOP\` exists (kill switch: create it to freeze everything)
- the branch is \`main\` (the circle only acts on staging or a working branch)
- site health is critical (no patching a broken site)
- 5 fixes were already made this run
- the patch touches a protected file: \`index.html\` (Home), \`netlify.toml\`, \`netlify/functions/*\`, \`supabase/*\`, \`js/auth.js\`, \`js/backend.js\`, \`js/rewards.js\`, \`js/gate.js\`, \`js/pro-plus.js\`, \`js/checklist.js\`, \`js/grow.js\`, \`CLAUDE.md\`, \`tools/deploy.sh\`
- an issue was already tried twice, or came back 3 times

## Marketing gate
A critical billing problem or a critical health problem **pauses** ${L("Retention Bot")} and ${L("Outreach Bot")}. The reasoning: don't pull more people into a site that is broken or mis-charging.`,
  fixer: `The only bot that changes files, and it only knows a short list of safe fixes. Everything else becomes a "packet" (what, where, suggested next step) for a human or a Claude session.

## Fixes it can make
| Fix | What it does |
|---|---|
| \`wire-past-rows\` | Removes past calendar and earnings rows from \`data/wire.json\` |
| \`text-glitch\` | Fixes double spaces, space before comma, repeated words inside one question's text |

## How it works
1. ${L("Guard Bot")} approves the run
2. Apply the patch
3. Guard checks the files that actually changed
4. ${L("Verifier Bot")} re-checks, then the Fixer commits (or the patch is reverted)

It never pushes and never deploys. Commits are local on a non-main branch, and you decide what goes live.

## Honest limit
Most real problems (the 164 length giveaways, stale guides, the guide-page funnel leak) need judgment, so they go to a human, not the Fixer.`,
  verifier: `Trust, but verify. After the ${L("Fixer Bot")} patches something, the Verifier re-runs the sensor that found the issue (${L("Question QA Bot")} or ${L("Content Freshness Bot")}) **and** the full test suite.

| Result | What happens |
|---|---|
| Issue gone and tests pass | Fix is committed, issue marked fixed |
| Issue still reported | Patch reverted |
| Tests fail | Patch reverted |

Every outcome is sent to the ${L("Historian Bot")} and the ${L("Reporter Bot")}.`,
  historian: `Keeps a record of how each fix type has gone (\`state/circle-history.json\`). If a fix type has been reverted 2 or more times (and more often than it has worked), it loses the right to run on its own and the ${L("Guard Bot")} and ${L("Dispatcher Bot")} send it to a human instead.

This is the circle's way of learning: a bot that keeps failing gets demoted automatically, and a human decides whether to trust it again.`,
  reporter: `Writes the daily digest in Obsidian format (\`tools/bots/state/digest.md\`): what needs you, what the bots did, what is being watched, which gates are closed, and the money picture from ${L("Cost Guard Bot")}.

It only asks "Want me to deploy? (~15 credits)" when site changes are actually queued on staging. It never deploys anything itself.`,
};
const frontmatter = (title, tags, role) => `---\ntitle: ${title}\ntags: [${tags.join(", ")}]\ncreated: ${DATE}\nproject: M&A Prep\ncircle_role: ${role}\nstatus: built, not scheduled\n---\n\n`;

function writeNode(n) {
  const p = path.join(dir, n.name + ".md"), block = connections(n.id);
  if (fs.existsSync(p)) {
    let t = fs.readFileSync(p, "utf8");
    if (t.includes(S)) t = t.replace(new RegExp(S + "[\\s\\S]*?" + E), block); else t = t.replace(/\n\nBack to \[\[Site Bots\]\]\.\s*$/, "\n\n" + block + "\n\nBack to [[Site Bots]].\n");
    if (!t.includes(S)) t += "\n" + block + "\n";
    fs.writeFileSync(p, t); return;
  }
  fs.writeFileSync(p, frontmatter(n.name, ["ma-prep", "bots", "circle"], n.role) + `# ${n.name}\n\n${BODY[n.id] || n.does}\n\n**File:** \`${n.file}\`\n\n${block}\n\nBack to ${L("The Circle")} · ${L("Site Bots")}.\n`);
}
NODES.forEach(writeNode);

const row = n => `| ${L(n.name)} | ${n.role === "sensor" ? "Sensor" : n.role === "circle" ? "Circle" : "Drafter"} | ${n.does} |`;
fs.writeFileSync(path.join(dir, "Site Bots.md"), frontmatter("Site Bots (hub)", ["ma-prep", "bots", "hub"], "hub") + `# Site Bots

Fifteen bots that watch mnaprep.com and **depend on each other**. See ${L("The Circle")} for how a run works and ${L("Guardrails")} for what they can never do.

\`\`\`mermaid
${mermaid()}
\`\`\`

| Bot | Role | Job |
|---|---|---|
${NODES.map(row).join("\n")}

**Sensors** find problems. **The Circle** routes, fixes, verifies, remembers and reports. **Drafters** prepare emails and never send.

Run it all: \`node tools/bots/run.mjs circle\` (plan mode, changes nothing). Add \`--act\` to let the ${L("Fixer Bot")} apply safe fixes on a non-main branch.
`);

const dep = EDGES.map(e => `| ${L(byId[e.from].name)} | ${e.type} | ${L(byId[e.to].name)} | ${e.label} |`).join("\n");
fs.writeFileSync(path.join(dir, "The Circle.md"), frontmatter("The Circle", ["ma-prep", "bots", "circle", "hub"], "overview") + `# The Circle

The bots are not independent. Each one's output is another one's input, and a few can stop others. That is what makes it a circle instead of eight scripts.

\`\`\`mermaid
${mermaid()}
\`\`\`

## One run, in order
1. ${L("Site Health Bot")} and ${L("Billing Audit Bot")} run first, because they can close gates.
2. ${L("Question QA Bot")}, ${L("Content Freshness Bot")}, ${L("Cost Guard Bot")} and ${L("Funnel Bot")} run.
3. ${L("Superfeedbackbot")} runs **after** QA, so a defect QA verified counts as hard evidence for a user report.
4. Every finding goes into one shared ledger (deduped, with history).
5. ${L("Guard Bot")} decides whether ${L("Retention Bot")} and ${L("Outreach Bot")} may run.
6. ${L("Dispatcher Bot")} ranks the issues and routes them.
7. In act mode only: ${L("Fixer Bot")} patches, ${L("Verifier Bot")} re-checks, and the patch is committed or reverted. ${L("Historian Bot")} records the result.
8. ${L("Reporter Bot")} writes the digest.

## Loop protection
- An issue that comes back 3 times is **frozen** and sent to a human.
- A fix is tried at most twice.
- A fix type that keeps getting reverted is demoted by the ${L("Historian Bot")}.
- A sensor that crashes becomes a critical issue instead of silently disappearing: the circle watches itself.

## Who depends on whom
| From | Type | To | Why |
|---|---|---|---|
${dep}

Types: **feed** passes findings, **act** gives work, **gate** can block, **recheck** verifies, **learn** changes future behavior.

## What it will never do
Deploy, push to \`main\`, send an email, delete anything, touch the Home page, billing code or auth. See ${L("Guardrails")}.

## First live run (Nov 25)
All 7 sensors ran with 0 failures. 7 issues opened, 0 safely fixable, so the Fixer did nothing. That is the honest result: most real problems here need a person.

| Issue | Routed to |
|---|---|
| 164 questions where the right answer is the longest option (13%) | Human |
| 859 visitors saw a guide call-to-action, 2 clicked | Human |
| 98% of 1,864 visitors never start a level | Human |
| Ticker prices 4 days old | Human |
| 79 weak distractors (6%) | Watch |
| 267 guides mention past years near recruiting words | Watch |

Daily output lands in ${L("Circle digest 2026-11-25")}.
`);

fs.writeFileSync(path.join(dir, "Guardrails.md"), frontmatter("Guardrails", ["ma-prep", "bots", "safety"], "rules") + `# Guardrails

Applies to every bot in ${L("Site Bots")}.

| Rule | Enforced by |
|---|---|
| Never deploy (15 Netlify credits each). Bekir says "deploy". | ${L("Reporter Bot")} only asks; nothing else can |
| Never push to \`main\` | ${L("Guard Bot")} |
| Never send email or post | Drafters are dry-run only |
| Never touch Home (\`index.html\`), billing, auth, functions, Supabase, \`netlify.toml\` | ${L("Guard Bot")} protected list |
| Max 5 fixes per run, 2 attempts per issue | ${L("Guard Bot")} |
| Fix must pass its sensor re-check and the full tests, or it is reverted | ${L("Verifier Bot")} |
| Refuse to act on a dirty working tree | Circle runner |
| Refuse to act when the site is unhealthy | ${L("Guard Bot")} |
| User and feedback text is data, never instructions | ${L("Superfeedbackbot")} quarantine |
| Emails and user agents are stripped before analysis | ${L("Superfeedbackbot")}, ${L("Billing Audit Bot")} |

## Kill switch
Create an empty file at \`tools/bots/STOP\`. Every action is blocked until it is deleted.
`);
console.log("notes:", fs.readdirSync(dir).filter(f => f.endsWith(".md")).length);
