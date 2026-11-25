// Fixer Bot: applies only the fixes that are safe to automate. Anything else is a packet for a human or a Claude session.
// Each fixer is deterministic, touches a known file list, and can be reverted with git. Guard approves before anything runs.
import fs from "node:fs";
import path from "node:path";
import { parseDate } from "../lib.mjs";
import { parseArrayAt } from "../../feedbot/triage.mjs";

export const cleanGlitch = s => String(s).replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").replace(/\.\.(?!\.)/g, ".").replace(/\b([A-Za-z]{2,}) \1\b/g, "$1").trim();

/* remove calendar and earnings rows whose date is before yesterday */
export function pruneWire(wire, now = new Date()) {
  const cut = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12)) - 864e5, out = { ...wire }; let removed = 0;
  for (const k of ["CAL", "EARN"]) if (Array.isArray(wire[k])) {
    out[k] = wire[k].filter(r => { const d = parseDate(r[0], now); const keep = !d || d >= cut; if (!keep) removed++; return keep; });
  }
  return { wire: out, removed };
}
/* clean glitches inside one question's literal, leaving every other byte of the file alone */
export function patchQuestion(src, question) {
  const at = src.indexOf(JSON.stringify(question)); if (at < 1) return null;
  let i = at - 1; while (i > 0 && /\s/.test(src[i])) i--; if (src[i] !== "[") return null;
  const lit = parseArrayAt(src, i); if (!lit) return null;
  let arr; try { arr = JSON.parse(lit); } catch (e) { return null; }
  if (!Array.isArray(arr) || !Array.isArray(arr[1])) return null;
  let out = lit, n = 0;
  for (const s of [arr[0], ...arr[1].map(String)]) { const c = cleanGlitch(s); if (c !== s) { const a = JSON.stringify(s); if (out.includes(a)) { out = out.replace(a, JSON.stringify(c)); n++; } } }
  return n ? { src: src.slice(0, i) + out + src.slice(i + lit.length), changes: n } : null;
}
const jsFiles = root => fs.readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js")).map(f => "js/" + f);

export const FIXERS = {
  "wire-past-rows": {
    files: () => ["data/wire.json"],
    apply(root, args, now) {
      const p = path.join(root, "data/wire.json"), w = JSON.parse(fs.readFileSync(p, "utf8")), r = pruneWire(w, now);
      if (!r.removed) return { changed: [], note: "nothing to prune" };
      fs.writeFileSync(p, JSON.stringify(r.wire, null, 2) + "\n"); return { changed: ["data/wire.json"], note: `removed ${r.removed} past calendar/earnings rows` };
    },
  },
  "text-glitch": {
    files: root => jsFiles(root),
    apply(root, args) {
      for (const f of jsFiles(root)) {
        const p = path.join(root, f), src = fs.readFileSync(p, "utf8"), r = patchQuestion(src, args.question);
        if (r) { fs.writeFileSync(p, r.src); return { changed: [f], note: `cleaned ${r.changes} string(s) in one question` }; }
      }
      return { changed: [], note: "question not found as plain JSON in js/" };
    },
  },
};
/* what a human or Claude session gets for everything not auto-fixable */
export const packet = it => ({ issue: it.key, severity: it.severity, what: it.detail, where: it.where, suggestedNextStep: it.bot === "qa" ? "Rewrite the flagged options so the right answer is not the longest or the only sensible one, then rerun qa." : it.bot === "freshness" ? "Check each flagged page against its current source and update or drop the stale line." : it.bot === "billing" ? "Open the user's billing doc and Stripe subscription side by side and correct the mismatch in Stripe or the site (needs Bekir)." : it.bot === "funnel" ? "Product decision: change the call-to-action or the landing path, then measure again." : "Read the finding, verify in the code, fix only what you can prove." });
