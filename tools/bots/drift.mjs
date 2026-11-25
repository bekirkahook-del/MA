// Drift Bot: how far staging has moved from main, and whether merging it would collide. Run before "deploy" so the deploy script never stops halfway.
// Usage: node tools/bots/drift.mjs
import { ROOT, cli, git } from "./lib.mjs";
import { report } from "./scan.mjs";

export function drift({ ahead, behind, conflicts = [], oldestAheadDays = 0, known = true }) {
  const f = [], add = (code, severity, detail, where = "staging") => f.push({ code, severity, detail, where });
  if (!known) add("drift-unknown", "info", "Could not compare staging and main (no remote refs here).");
  else {
    if (conflicts.length) add("drift-conflicts", "critical", `Merging staging into main would conflict in ${conflicts.length} file(s): ${conflicts.slice(0, 4).join(", ")}. The deploy script would stop.`);
    if (behind > 0) add("drift-main-moved", "info", `main has ${behind} commit(s) that staging does not (someone pushed straight to main). The deploy merge will include them.`);
    if (ahead > 0 && oldestAheadDays >= 7) add("drift-stale-queue", "warn", `The oldest change waiting on staging is ${oldestAheadDays} days old. Old queues get riskier to merge.`);
  }
  return report("drift", f, { ahead, behind, oldestAheadDays });
}
export function scan(root = ROOT) {
  const c = git(["rev-list", "--left-right", "--count", "origin/main...origin/staging"], root).split(/\s+/).map(Number);
  if (c.length !== 2 || c.some(isNaN)) return drift({ known: false, ahead: 0, behind: 0 });
  const [behind, ahead] = c, dates = git(["log", "--format=%cI", "origin/main..origin/staging"], root).split("\n").filter(Boolean), oldest = dates.length ? Math.floor((Date.now() - new Date(dates[dates.length - 1])) / 864e5) : 0;
  let conflicts = []; const mt = git(["merge-tree", "--write-tree", "--name-only", "origin/main", "origin/staging"], root); if (/CONFLICT/.test(mt)) conflicts = [...mt.matchAll(/CONFLICT \([^)]*\): (?:Merge conflict in )?(.+)/g)].map(m => m[1].trim());
  else { const lines = mt.split("\n"); if (lines.length > 1 && git(["merge-tree", "--write-tree", "origin/main", "origin/staging"], root) === "" ) conflicts = []; }
  return drift({ ahead, behind, conflicts, oldestAheadDays: oldest });
}
cli(import.meta.url, () => scan());
