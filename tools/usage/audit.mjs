// Usage Saver: reads Claude Code session logs and shows where tokens go.
// Zero AI tokens to run. Read-only. Prints a table + the top fixes.
// Usage: node tools/usage/audit.mjs [--days 7] [--json]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const args = process.argv.slice(2);
const days = Number(args[args.indexOf("--days") + 1]) || 7;
const asJson = args.includes("--json");
const HOME = os.homedir();
const PROJ = path.join(HOME, ".claude", "projects");
const since = Date.now() - days * 864e5;
const k = n => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n));

// ---- 1. Session logs ----
const files = [];
if (fs.existsSync(PROJ)) for (const d of fs.readdirSync(PROJ)) {
  const dir = path.join(PROJ, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith(".jsonl")) {
    const p = path.join(dir, f);
    if (fs.statSync(p).mtimeMs >= since) files.push(p);
  }
}

const sessions = [], toolOut = {}, toolCalls = {}, bigReads = [];
for (const p of files) {
  const s = { id: path.basename(p, ".jsonl").slice(0, 8), calls: 0, fresh: 0, cacheRead: 0, cacheWrite: 0, out: 0, firstCtx: 0, maxCtx: 0, subagent: 0 };
  const pending = {};
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    if (!line) continue;
    let d; try { d = JSON.parse(line); } catch { continue; }
    const m = d.message;
    if (d.type === "assistant" && m?.usage) {
      const u = m.usage, ctx = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
      s.calls++; s.fresh += u.input_tokens || 0; s.cacheRead += u.cache_read_input_tokens || 0;
      s.cacheWrite += u.cache_creation_input_tokens || 0; s.out += u.output_tokens || 0;
      if (!s.firstCtx) s.firstCtx = ctx;
      s.maxCtx = Math.max(s.maxCtx, ctx);
      if (d.isSidechain) s.subagent++;
      for (const c of m.content || []) if (c.type === "tool_use") {
        const name = c.name.startsWith("mcp__") ? c.name.split("__").slice(0, 2).join("__") : c.name;
        pending[c.id] = { name, input: c.input };
        toolCalls[name] = (toolCalls[name] || 0) + 1;
      }
    }
    if (d.type === "user" && Array.isArray(m?.content)) for (const c of m.content) if (c.type === "tool_result" && pending[c.tool_use_id]) {
      const t = pending[c.tool_use_id], len = JSON.stringify(c.content || "").length, tok = Math.round(len / 4);
      toolOut[t.name] = (toolOut[t.name] || 0) + tok;
      if (tok > 8000) bigReads.push({ tool: t.name, tok, what: String(t.input?.file_path || t.input?.command || t.input?.url || "").slice(0, 70) });
    }
  }
  if (s.calls) sessions.push(s);
}

// ---- 2. Baseline bloat: plugins / skills / MCP loaded every session ----
const synced = path.join(HOME, ".claude", "plugins", "synced");
let plugins = 0, skills = 0;
const walk = (dir, depth) => { if (depth > 6 || !fs.existsSync(dir)) return; for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) walk(p, depth + 1);
  else if (e.name === "plugin.json") plugins++;
  else if (e.name === "SKILL.md") skills++;
} };
walk(synced, 0);

// ---- 3. Score + fixes ----
const tot = sessions.reduce((a, s) => ({ calls: a.calls + s.calls, read: a.read + s.cacheRead, write: a.write + s.cacheWrite, out: a.out + s.out, fresh: a.fresh + s.fresh }), { calls: 0, read: 0, write: 0, out: 0, fresh: 0 });
const avgFirst = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.firstCtx, 0) / sessions.length) : 0;
const avgCalls = sessions.length ? Math.round(tot.calls / sessions.length) : 0;
const topTools = Object.entries(toolOut).sort((a, b) => b[1] - a[1]).slice(0, 8);
const fixes = [];
if (avgFirst > 60000) fixes.push({ save: "huge", fix: `Turn off unused plugins/connectors at claude.ai > Settings (now ~${skills} skills). Each session starts at ${k(avgFirst)} tokens before you type. Target <40k.` });
if (avgCalls > 60) fixes.push({ save: "big", fix: `Sessions avg ${avgCalls} model calls. Every call re-reads the whole context. Start fresh sessions per task; use /clear between tasks.` });
const bash = toolOut.Bash || 0, read = toolOut.Read || 0;
if (bigReads.length) fixes.push({ save: "big", fix: `${bigReads.length} tool results over 8k tokens. Grep first, read line ranges, pipe to head.` });
if (bash > read && bash > 20000) fixes.push({ save: "medium", fix: `Bash output is ${k(bash)} tokens. Add | head -50 or --quiet to noisy commands (tests, git log, builds).` });
if (toolCalls.Agent > 3) fixes.push({ save: "medium", fix: `${toolCalls.Agent} subagent spawns. Each starts cold (~${k(avgFirst)}). Only spawn for big fan-out work.` });
fixes.push({ save: "small", fix: "Run the 394 site bots as node scripts, not through Claude. Ask Claude only to fix what they flag." });

const result = { days, sessions: sessions.length, totals: tot, avgStartContext: avgFirst, avgCallsPerSession: avgCalls, plugins, skills, topTools, bigReads: bigReads.sort((a, b) => b.tok - a.tok).slice(0, 10), fixes };
if (asJson) { console.log(JSON.stringify(result, null, 2)); process.exit(0); }

console.log(`\nUSAGE AUDIT  last ${days}d  ${sessions.length} session(s)\n`);
console.log(`Model calls       ${tot.calls}   (avg ${avgCalls}/session)`);
console.log(`Context re-read   ${k(tot.read)}  (cache reads)`);
console.log(`Context written   ${k(tot.write)}  (cache writes, cost more)`);
console.log(`Output            ${k(tot.out)}`);
console.log(`Start-of-session  ${k(avgFirst)} tokens  <- before you type anything`);
console.log(`Plugins / skills  ${plugins} / ${skills}\n`);
console.log("Top tool output (est. tokens):");
for (const [n, t] of topTools) console.log(`  ${k(t).padStart(6)}  ${n}  (${toolCalls[n] || 0} calls)`);
if (result.bigReads.length) { console.log("\nBiggest single results:"); for (const b of result.bigReads.slice(0, 5)) console.log(`  ${k(b.tok).padStart(6)}  ${b.tool}  ${b.what}`); }
console.log("\nFIXES (biggest first):");
for (const f of fixes) console.log(`  [${f.save}] ${f.fix}`);
console.log("");
